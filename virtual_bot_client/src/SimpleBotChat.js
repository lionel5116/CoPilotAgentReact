import React, { useState, useEffect, useRef } from 'react';

const SimpleBotChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Hardcoded Direct Line secret
  const DIRECTLINE_SECRET = 'EBphEbDOY462O2N6J0B43S6MBzWrCliXIprzaetbdNvE3WLcqD9eJQQJ99BEACHYHv6AArohAAABAZBSThGE.BmP3BWfELvI1XgQMj8nR2R4JWyMyBg6gCm1wvKvVRcRjIKHNVP8bJQQJ99BEACHYHv6AArohAAABAZBS21pj';
  const DIRECTLINE_ENDPOINT = 'https://directline.botframework.com/v3/directline';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Auto-initialize connection on component mount
    initializeDirectLine();
  }, []);

  // Initialize Direct Line connection
  const initializeDirectLine = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${DIRECTLINE_ENDPOINT}/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DIRECTLINE_SECRET}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to start conversation: ${response.statusText}`);
      }

      const data = await response.json();
      setConversationId(data.conversationId);
      setIsConnected(true);
      
      // Start polling for messages
      startPolling(data.conversationId);
      
    } catch (error) {
      console.error('Error initializing Direct Line:', error);
      addMessage('system', `Connection failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for new messages from the bot
  const startPolling = (convId) => {
    let watermark = '';
    
    const poll = async () => {
      try {
        const url = `${DIRECTLINE_ENDPOINT}/conversations/${convId}/activities${watermark ? `?watermark=${watermark}` : ''}`;
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${DIRECTLINE_SECRET}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.activities && data.activities.length > 0) {
            const botMessages = data.activities.filter(activity => 
              activity.from.id !== 'user' && activity.type === 'message'
            );
            
            botMessages.forEach(activity => {
              if (activity.text) {
                addMessage('bot', activity.text);
              }
            });
          }
          
          watermark = data.watermark;
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
      
      // Continue polling if still connected
      if (isConnected) {
        setTimeout(poll, 1000);
      }
    };
    
    poll();
  };

  // Send message to bot
  const sendMessage = async (message) => {
    if (!conversationId || !message.trim()) return;

    try {
      const activity = {
        type: 'message',
        from: { id: 'user' },
        text: message
      };

      const response = await fetch(`${DIRECTLINE_ENDPOINT}/conversations/${conversationId}/activities`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DIRECTLINE_SECRET}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activity)
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      addMessage('user', message);
      
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('system', `Failed to send message: ${error.message}`);
    }
  };

  const addMessage = (sender, text) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      sender,
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendClick = () => {
    if (inputValue.trim() && isConnected) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  const handleReset = () => {
    setMessages([]);
    setInputValue('');
    // Reconnect
    initializeDirectLine();
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '800px',
      height: '600px',
      margin: '0 auto',
      backgroundColor: '#f8f9fa',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        padding: '15px 20px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        borderRadius: '8px 8px 0 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Test your agent</h3>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
            {isConnected ? 'Connected' : isLoading ? 'Connecting...' : 'Disconnected'} • 
            <span style={{ color: '#0078d4', marginLeft: '4px' }}>Surfaced with Azure OpenAI</span>
          </div>
        </div>
        <div>
          <button 
            onClick={handleReset}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '5px',
              marginRight: '10px'
            }}
          >
            🔄
          </button>
          <button 
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '5px'
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        backgroundColor: '#f8f9fa'
      }}>
        {messages.length === 0 && !isLoading && (
          <div style={{
            textAlign: 'center',
            color: '#666',
            marginTop: '50px'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>🤖</div>
            <p>Ask IT Hardware Bot is ready to help!</p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} style={{ marginBottom: '15px' }}>
            {message.sender === 'bot' && (
              <div style={{
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '5px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                maxWidth: '80%'
              }}>
                <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                  {message.text}
                </div>
              </div>
            )}
            
            {message.sender === 'user' && (
              <div style={{
                backgroundColor: '#0078d4',
                color: 'white',
                padding: '10px 15px',
                borderRadius: '18px',
                marginLeft: 'auto',
                maxWidth: '80%',
                width: 'fit-content',
                fontSize: '14px'
              }}>
                {message.text}
              </div>
            )}

            {message.sender === 'system' && (
              <div style={{
                backgroundColor: '#fff3cd',
                color: '#856404',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '12px',
                textAlign: 'center'
              }}>
                {message.text}
              </div>
            )}

            <div style={{
              fontSize: '11px',
              color: '#999',
              textAlign: message.sender === 'user' ? 'right' : 'left',
              marginTop: '2px'
            }}>
              Just now
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{
        padding: '15px 20px',
        backgroundColor: 'white',
        borderTop: '1px solid #e0e0e0',
        borderRadius: '0 0 8px 8px'
      }}>
        <div style={{ position: 'relative' }}>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question or describe what you need"
            disabled={!isConnected}
            style={{
              width: '100%',
              minHeight: '40px',
              maxHeight: '120px',
              padding: '10px 50px 10px 15px',
              border: '1px solid #e0e0e0',
              borderRadius: '20px',
              resize: 'none',
              outline: 'none',
              fontSize: '14px',
              fontFamily: 'inherit',
              backgroundColor: isConnected ? 'white' : '#f5f5f5'
            }}
            rows="1"
          />
          <button
            onClick={handleSendClick}
            disabled={!inputValue.trim() || !isConnected}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: inputValue.trim() && isConnected ? '#0078d4' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: inputValue.trim() && isConnected ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}
          >
            →
          </button>
        </div>
        <div style={{
          fontSize: '11px',
          color: '#666',
          marginTop: '8px',
          textAlign: 'center'
        }}>
          Make sure AI-generated content is accurate and appropriate before using. 
          <span style={{ color: '#0078d4', textDecoration: 'underline', cursor: 'pointer' }}>
            See terms
          </span>
        </div>
      </div>
    </div>
  );
};

export default SimpleBotChat;