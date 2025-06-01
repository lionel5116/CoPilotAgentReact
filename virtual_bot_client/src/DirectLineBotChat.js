import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader } from 'lucide-react';

const DirectLineBotChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [directLineSecret, setDirectLineSecret] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  
  const BOT_ENDPOINT = 'https://defaultf5eb996693364b3388959982425b13.ed.environment.api.powerplatform.com/copilotstudio/dataverse-backed/authenticated/bots/cr684_askItHardware/conversations?api-version=2022-03-01-preview';
  const DIRECTLINE_ENDPOINT = 'https://directline.botframework.com/v3/directline';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Direct Line connection
  const initializeDirectLine = async () => {
    if (!directLineSecret) {
      addMessage('system', 'Please enter your Direct Line secret key to connect to the bot.');
      return;
    }

    try {
      setIsLoading(true);
      
      // Start conversation with Direct Line
      const response = await fetch(`${DIRECTLINE_ENDPOINT}/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${directLineSecret}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to start conversation: ${response.statusText}`);
      }

      const data = await response.json();
      setConversationId(data.conversationId);
      setIsConnected(true);
      
      addMessage('system', 'Connected to bot! You can now start chatting.');
      
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
            'Authorization': `Bearer ${directLineSecret}`
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
      
      // Continue polling
      setTimeout(poll, 1000);
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
          'Authorization': `Bearer ${directLineSecret}`,
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

  const handleSecretSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    initializeDirectLine();
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (inputValue.trim()) {
      if (isConnected) {
        sendMessage(inputValue);
      } else {
        addMessage('system', 'Please connect to the bot first by entering your Direct Line secret.');
      }
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bot className="w-8 h-8" />
          Ask IT Hardware Bot
        </h1>
        <p className="text-blue-100 text-sm mt-1">
          {isConnected ? 'Connected' : 'Not connected'} • Direct Line API
        </p>
      </div>

      {/* Connection Setup */}
      {!isConnected && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Setup Required:</strong> Enter your Direct Line secret key to connect to the bot.
              </p>
              <div className="mt-2 flex gap-2">
                <input
                  type="password"
                  placeholder="Enter Direct Line Secret Key"
                  value={directLineSecret}
                  onChange={(e) => setDirectLineSecret(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSecretSubmit(e)}
                />
                <button
                  onClick={handleSecretSubmit}
                  disabled={isLoading || !directLineSecret}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Connect'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-12">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Welcome to Ask IT Hardware Bot!</p>
            <p className="text-sm">Connect with your Direct Line secret to start chatting.</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            } ${message.sender === 'system' ? 'justify-center' : ''}`}
          >
            <div
              className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              } ${message.sender === 'system' ? 'flex-col items-center' : ''}`}
            >
              {message.sender !== 'system' && (
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 text-white'
                  }`}
                >
                  {message.sender === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
              )}
              <div
                className={`rounded-lg px-4 py-2 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.sender === 'system'
                    ? 'bg-orange-100 text-orange-800 text-sm'
                    : 'bg-white text-gray-800 shadow-sm border'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-white p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isConnected ? "Type your message..." : "Connect to bot first..."}
            disabled={!isConnected}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            onClick={handleSubmit}
            disabled={!inputValue.trim() || !isConnected}
            className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DirectLineBotChat;