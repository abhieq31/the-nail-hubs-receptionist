import React, { useState, useEffect, useRef } from 'react';
import './ChatWidget.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function ChatWidget({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      startConversation();
    }
  }, [isOpen]);

  const startConversation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'hi' }),
      });

      const data = await response.json();
      setSessionId(data.session_id);

      setMessages([
        {
          sender: 'bot',
          text: data.response.message,
          timestamp: new Date(),
        },
      ]);

      if (data.response.options) {
        setOptions(data.response.options);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages([
        {
          sender: 'bot',
          text: 'Hi ✨ Welcome to The Nail Hubs!\n\n💅 Ready to get gorgeous nails? Book your appointment now!\n\n🕐 Open All 7 Days: 11 AM - 6 PM\n📍 B-292, Garden City, Ankleshwar\n\nChoose your booking method:',
          timestamp: new Date(),
        },
      ]);
      setOptions([
        {
          label: '📱 Book via WhatsApp',
          value: 'whatsapp_book',
        },
        {
          label: '📞 Call Us',
          value: 'call',
        },
        {
          label: '📢 Join WhatsApp Channel',
          value: 'whatsapp_channel',
        },
      ]);
    }
    setIsLoading(false);
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      sender: 'user',
      text: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setOptions([]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          session_id: sessionId,
        }),
      });

      const data = await response.json();

      const botMessage = {
        sender: 'bot',
        text: data.response.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);

      if (data.response.options) {
        setOptions(data.response.options);
      }

      if (data.response.state === 'completed') {
        setTimeout(() => {
          setOptions([]);
        }, 5000);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        sender: 'bot',
        text: 'Sorry, something went wrong. Please try again or call us at 07698 235501.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleOptionClick = (option) => {
    // Handle special actions
    if (option === 'whatsapp_book') {
      window.open('https://wa.me/917698235501?text=Hello%2C%20I%20would%20like%20to%20book.%0A%0AName%3A%0ADate%3A%0ATime%3A%0AHow%20many%20people%3A', '_blank');
      return;
    }
    if (option === 'call') {
      window.open('tel:+917698235501', '_self');
      return;
    }
    if (option === 'whatsapp_channel') {
      window.open('https://www.whatsapp.com/channel/0029Vb6wVqy7T8bahzFZwV1d', '_blank');
      return;
    }
    sendMessage(option);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (!isOpen) return null;

  return (
    <div className="chat-widget">
      <div className="chat-header">
        <div className="header-content">
          <span className="header-icon">💅</span>
          <div>
            <h3>The Nail Hubs</h3>
            <p className="status">Online</p>
          </div>
        </div>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div className="message-bubble">
              <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
              <span className="timestamp">
                {msg.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message bot">
            <div className="message-bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {options.length > 0 && (
        <div className="options-container">
          {options.map((option, index) => (
            <button
              key={index}
              className="option-button"
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="chat-input"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="send-button"
          disabled={!input.trim() || isLoading}
        >
          ➤
        </button>
      </form>
    </div>
  );
}

export default ChatWidget;
