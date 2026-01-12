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
          text: 'Hi ✨ Welcome to The Nail Hubs!\n\nI\'m your virtual assistant. How can I help you today?',
          timestamp: new Date(),
        },
      ]);
      setOptions([
        {
          label: '📱 Book Appointment',
          value: 'book',
        },
        {
          label: '🕐 Working Hours',
          value: 'hours',
        },
        {
          label: '📍 Location',
          value: 'location',
        },
        {
          label: '💅 Our Services',
          value: 'services',
        },
        {
          label: '📸 Instagram',
          value: 'instagram',
        },
        {
          label: '📞 Contact',
          value: 'contact',
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
    const responses = {
      'book': {
        text: '📱 Book Your Appointment\n\nClick below to book via WhatsApp with our team. We\'ll confirm your preferred date and time!\n\n🕐 Open All 7 Days: 11 AM - 6 PM',
        options: [
          { label: '📱 Book on WhatsApp', value: 'whatsapp_book' },
          { label: '📞 Call to Book', value: 'call' },
          { label: '🔙 Back to Menu', value: 'menu' },
        ]
      },
      'hours': {
        text: '🕐 Working Hours\n\n📅 Open All 7 Days\n⏰ 11:00 AM - 6:00 PM\n\nWalk-ins welcome! Appointments recommended for bridal services.',
        options: [
          { label: '📱 Book Appointment', value: 'book' },
          { label: '🔙 Back to Menu', value: 'menu' },
        ]
      },
      'location': {
        text: '📍 Our Location\n\nThe Nail Hubs\nB-292, Garden City\nGIDC, Ankleshwar - 393001\nGujarat, India',
        options: [
          { label: '🗺️ Open in Google Maps', value: 'maps' },
          { label: '📱 Get Directions on WhatsApp', value: 'whatsapp_directions' },
          { label: '🔙 Back to Menu', value: 'menu' },
        ]
      },
      'services': {
        text: '💅 Our Services\n\n✨ Gel Nails - 45 mins\n💎 Acrylic Nails - 45 mins\n🌟 Nail Extensions - 45 mins\n👰 Bridal Nail Art - 45 mins\n🔄 Nail Refill - 45 mins\n✨ Press-on Nails - 45 mins\n\nAll services include premium products and expert care!',
        options: [
          { label: '📱 Book a Service', value: 'book' },
          { label: '🔙 Back to Menu', value: 'menu' },
        ]
      },
      'instagram': {
        text: '📸 Follow Us on Instagram\n\n@thenailhubs\n\nSee our latest nail art, customer reviews, and exclusive offers!\n\nJoin our WhatsApp channel for updates and special discounts!',
        options: [
          { label: '📸 Visit Instagram', value: 'instagram_link' },
          { label: '📢 Join WhatsApp Channel', value: 'whatsapp_channel' },
          { label: '🔙 Back to Menu', value: 'menu' },
        ]
      },
      'contact': {
        text: '📞 Contact Information\n\n📱 Phone: 07698 235501\n📧 Instagram: @thenailhubs\n📍 B-292, Garden City, Ankleshwar\n\nFeel free to call, WhatsApp, or visit us anytime during business hours!',
        options: [
          { label: '📞 Call Now', value: 'call' },
          { label: '💬 WhatsApp Us', value: 'whatsapp_chat' },
          { label: '🔙 Back to Menu', value: 'menu' },
        ]
      }
    };

    // Handle action options
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
    if (option === 'whatsapp_chat') {
      window.open('https://wa.me/917698235501', '_blank');
      return;
    }
    if (option === 'whatsapp_directions') {
      window.open('https://wa.me/917698235501?text=Hi%2C%20I%20need%20directions%20to%20The%20Nail%20Hubs', '_blank');
      return;
    }
    if (option === 'instagram_link') {
      window.open('https://www.instagram.com/thenailhubs/', '_blank');
      return;
    }
    if (option === 'maps') {
      window.open('https://www.google.com/maps?q=The+Nail+Hubs,+b-292+gardencity+,gidc+ankleshwer+pin:-393001,+Ankleshwar,+Gujarat+393001&ftid=0x3be0237ec798dc17:0xbe20ebcb0a43670a', '_blank');
      return;
    }
    if (option === 'menu') {
      startConversation();
      return;
    }

    // Show response for information requests
    if (responses[option]) {
      const userMessage = {
        sender: 'user',
        text: option.charAt(0).toUpperCase() + option.slice(1),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      setTimeout(() => {
        const botMessage = {
          sender: 'bot',
          text: responses[option].text,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setOptions(responses[option].options);
      }, 500);
    } else {
      sendMessage(option);
    }
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
              onClick={() => handleOptionClick(option.value || option)}
            >
              {option.label || option}
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
