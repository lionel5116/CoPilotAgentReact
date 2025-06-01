import React, { useEffect, useRef, useState } from 'react';

const BotFrameworkChat = () => {
  const chatRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Your Direct Line secret key
  const directLineSecret = 'EBphEbDOY462O2N6J0B43S6MBzWrCliXIprzaetbdNvE3WLcqD9eJQQJ99BEACHYHv6AArohAAABAZBSThGE.CEwyGmrOoEFvlBmBWwxr9N7kAqQiBg0O36GWbsgMk5f9bMbhWlCyJQQJ99BEACHYHv6AArohAAABAZBS3vUX';

  useEffect(() => {
    // Load Bot Framework Web Chat SDK
    const loadWebChat = async () => {
      try {
        // Create script elements for Bot Framework Web Chat
        const webChatScript = document.createElement('script');
        webChatScript.src = 'https://cdn.botframework.com/botframework-webchat/latest/webchat.js';
        webChatScript.async = true;
        
        webChatScript.onload = async () => {
          try {
            // Create Direct Line token
            const tokenResponse = await fetch('https://directline.botframework.com/v3/directline/tokens/generate', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${directLineSecret}`,
                'Content-Type': 'application/json'
              }
            });

            if (!tokenResponse.ok) {
              throw new Error('Failed to generate token');
            }

            const tokenData = await tokenResponse.json();
            
            // Initialize Web Chat
            const directLine = window.WebChat.createDirectLine({
              token: tokenData.token
            });

            // Custom styling to match modern chat interfaces
            const styleOptions = {
              backgroundColor: '#f8f9fa',
              primaryFont: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              
              // Bubble styling
              bubbleBackground: '#ffffff',
              bubbleBorder: '1px solid #e1e5e9',
              bubbleBorderRadius: 12,
              bubbleFromUserBackground: '#0078d4',
              bubbleFromUserBorderRadius: 12,
              bubbleFromUserTextColor: '#ffffff',
              
              // Input styling
              sendBoxBackground: '#ffffff',
              sendBoxBorder: '2px solid #e1e5e9',
              sendBoxBorderRadius: 24,
              sendBoxHeight: 48,
              sendBoxButtonColor: '#0078d4',
              sendBoxButtonColorOnHover: '#106ebe',
              
              // General styling
              subtle: '#6b7280',
              accent: '#0078d4',
              cardEmphasisBackgroundColor: '#f3f4f6',
              
              // Suggested actions
              suggestedActionBackground: '#ffffff',
              suggestedActionBorder: '1px solid #0078d4',
              suggestedActionBorderRadius: 20,
              suggestedActionTextColor: '#0078d4',
              suggestedActionTextColorOnHover: '#ffffff',
              suggestedActionBackgroundColorOnHover: '#0078d4'
            };

            window.WebChat.renderWebChat(
              {
                directLine,
                styleOptions,
                userID: `user-${Date.now()}`, // Generate unique user ID
                username: 'User',
                locale: 'en-US'
              },
              chatRef.current
            );

            setIsLoaded(true);
          } catch (err) {
            console.error('Error initializing Web Chat:', err);
            setError('Failed to initialize chat. Please check your connection.');
          }
        };

        webChatScript.onerror = () => {
          setError('Failed to load Web Chat SDK');
        };

        document.head.appendChild(webChatScript);

        // Cleanup function
        return () => {
          if (document.head.contains(webChatScript)) {
            document.head.removeChild(webChatScript);
          }
        };
      } catch (err) {
        console.error('Error loading Web Chat:', err);
        setError('Failed to load chat component');
      }
    };

    loadWebChat();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg border border-red-200">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Chat Error</div>
          <div className="text-red-500">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Virtual Assistant</h3>
            <p className="text-blue-100 text-sm">
              {isLoaded ? 'Online - Ready to help' : 'Connecting...'}
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {!isLoaded && !error && (
        <div className="flex items-center justify-center h-96 bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-600">Loading chat...</div>
          </div>
        </div>
      )}

      {/* Chat Container */}
      <div 
        ref={chatRef} 
        className={`h-96 ${!isLoaded ? 'hidden' : ''}`}
        style={{ height: '500px' }}
      />
      
      {/* Footer */}
      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 text-center border-t">
        Powered by Microsoft Bot Framework
      </div>
    </div>
  );
};

export default BotFrameworkChat;