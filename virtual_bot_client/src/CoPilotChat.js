// src/CoPilotChat.jsx
import React, { useEffect, useState, useRef, useMemo } from 'react';

// Ensure WebChat is available globally if using CDN
// You would typically include this in your public/index.html
// <script src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>


/*using node server */
//const DIRECT_LINE_TOKEN_ENDPOINT = 'http://localhost:3001/api/directline/token'; // Your backend endpoint

/*usig web api */
const DIRECT_LINE_TOKEN_ENDPOINT = 'http://localhost:53833/api/directline/token'; // Your backend endpoint

const CoPilotChat = ({ userId = 'YourCustomUserID_React', userName = 'React User' }) => {
    const [directLineToken, setDirectLineToken] = useState(null);
    // const [conversationId, setConversationId] = useState(null); // You can store this if needed
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const webChatRef = useRef(null);

    // 1. Fetch Direct Line Token
    useEffect(() => {
        const fetchToken = async () => {
            try {
                console.log("Requesting Direct Line token from backend...");
                const response = await fetch(DIRECT_LINE_TOKEN_ENDPOINT, { method: 'POST' });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Failed to fetch Direct Line token: ${response.status} ${errorData.error || response.statusText}`);
                }
                const data = await response.json();
                setDirectLineToken(data.token);
                // setConversationId(data.conversationId);
                console.log("Direct Line token received:", data.token ? 'OK' : 'NOT OK');
                setIsLoading(false);
            } catch (err) {
                console.error('Error initializing chat:', err);
                setError(err.message);
                setIsLoading(false);
            }
        };

        fetchToken();
    }, []); // Empty dependency array ensures this runs only once on mount

    // 2. Create DirectLine object (memoized)
    const directLine = useMemo(() =>
        directLineToken ? window.WebChat.createDirectLine({ token: directLineToken }) : null,
        [directLineToken]
    );

    // 3. Create Web Chat store with middleware (memoized)
    const store = useMemo(() => {
        if (!window.WebChat) return null; // Guard if WebChat is not loaded
        return window.WebChat.createStore(
            {}, // initial state
            ({ dispatch }) => next => action => {
                if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
                    console.log("Web Chat connected to Direct Line (React).");
                    // Optional: dispatch a welcome event
                    /*
                    dispatch({
                        type: 'WEB_CHAT/SEND_EVENT',
                        payload: { name: 'webchat/join', value: { language: window.navigator.language } }
                    });
                    */
                }

                // Handle OAuthCard for bot user authentication
                if (action.type === 'WEB_CHAT/SEND_POST_BACK' && action.payload.value && action.payload.value.type === 'signin') {
                    console.log("Sign-in action initiated by user (React):", action.payload.value);
                    const signInUrl = action.payload.value.value;
                    if (signInUrl) {
                        const DLAUTHWIN = window.open(signInUrl, "Bot Sign In", "width=1024, height=700");
                        const timer = setInterval(function() {
                            try {
                                if (DLAUTHWIN && DLAUTHWIN.closed) {
                                    clearInterval(timer);
                                    console.log("Sign-in window closed (React).");
                                    // The bot should automatically receive the token if the flow was successful.
                                } else if (DLAUTHWIN === null || typeof DLAUTHWIN === "undefined"){
                                    clearInterval(timer); // Popup was blocked or failed to open
                                    console.warn("Sign-in popup may have been blocked or failed to open.");
                                }
                            } catch (e) {
                                console.warn("Error accessing popup window. It might be on a different domain after redirect, or closed.", e);
                                clearInterval(timer);
                            }
                        }, 1000);
                    }
                    return false; // Suppress the original postBack action
                }
                return next(action);
            }
        );
    }, []); // Store definition doesn't change, so empty deps

    // 4. Render Web Chat
    useEffect(() => {
        if (directLine && store && webChatRef.current && window.WebChat) {
            console.log("Rendering Web Chat component...");
            window.WebChat.renderWebChat(
                {
                    directLine: directLine,
                    store: store,
                    userID: userId,
                    username: userName,
                    locale: 'en-US',
                    styleOptions: {
                        botAvatarInitials: 'CP',
                        userAvatarInitials: userName ? userName.substring(0,1).toUpperCase() : 'U',
                        bubbleBackground: '#f0f0f0',
                        bubbleFromUserBackground: '#d1eaff',
                        suggestedActionBackground: 'white',
                        // Add more style options here
                    }
                },
                webChatRef.current
            );
            console.log("Web Chat rendering initiated.");
        }
        // Note: No specific cleanup for renderWebChat, but if directLine had an 'end' method,
        // you might call it here in a cleanup function if the component unmounts.
        // return () => { if (directLine) directLine.end(); } // Example if directLine had an end method
    }, [directLine, store, userId, userName]); // Re-render if these change

    if (isLoading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Loading Chat...</div>;
    }

    if (error) {
        return <div style={{ color: 'red', padding: '20px', textAlign: 'center' }}>Error: {error}. Please ensure the backend token server is running.</div>;
    }

    // The div where Web Chat will be rendered
    return (
        <div id="webchat-react-container" style={{ height: '100%', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
            {/* You can add a header or other elements around the chat window */}
            <div ref={webChatRef} style={{ flexGrow: 1, border: '1px solid #ccc' }} />
        </div>
    );
};

export default CoPilotChat;