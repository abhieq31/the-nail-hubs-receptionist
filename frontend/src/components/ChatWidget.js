import React, { useState, useEffect, useRef } from 'react';
import './ChatWidget.css';

function ChatWidget({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [options, setOptions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  const messagesEndRef = useRef(null);

  // Business Information
  const businessInfo = {
    name: 'The Nail Hubs',
    tagline: 'Where Elegance Meets Your Fingertips',
    phone: '+917698235501',
    address: 'B-292, Garden City, GIDC, Ankleshwar - 393001, Gujarat',
    hours: 'Open All 7 Days: 11:00 AM - 6:00 PM',
    instagram: '@thenailhubs',
    whatsappChannel: 'https://www.whatsapp.com/channel/0029Vb6wVqy7T8bahzFZwV1d',
    mapsLink: 'https://www.google.com/maps?q=The+Nail+Hubs,+b-292+gardencity+,gidc+ankleshwer+pin:-393001,+Ankleshwar,+Gujarat+393001&ftid=0x3be0237ec798dc17:0xbe20ebcb0a43670a',
    owner: 'Saloni',
  };

  // Services with accurate timings
  const services = [
    { name: 'Acrylic Nails', duration: '100-120 min', icon: '💅', popular: true },
    { name: 'Nail Art', duration: '75-120 min', icon: '🎨' },
    { name: 'Nail Extensions', duration: '90-110 min', icon: '💎' },
    { name: 'Nail Decals', duration: '25-35 min', icon: '✨' },
    { name: 'Nail Polish Changes', duration: '25-30 min', icon: '💅' },
    { name: 'Nail Painting & Designs', duration: '60-90 min', icon: '🖌️' },
    { name: 'Nail Repair', duration: '20-30 min', icon: '🔧' },
  ];

  // FAQ data
  const faqs = {
    pricing: "Our pricing varies based on the service and design complexity. For accurate pricing, please WhatsApp us with your preferred design and we'll provide a quote!",
    bridal: "Yes! We specialize in bridal nail art. Saloni personally handles bridal appointments with custom designs. Book in advance for your special day! 👰",
    products: "We use only premium quality products to ensure the health and beauty of your nails.",
    hygiene: "Hygiene is our top priority! All tools are properly sanitized and sterilized after each use.",
    walkIn: "Walk-ins are welcome! However, we recommend booking an appointment to ensure availability, especially for bridal services.",
    parking: "Yes, Garden City has ample parking space available for our customers.",
    payment: "We accept Cash, UPI, and all major payment methods for your convenience.",
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      showWelcomeMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Simulate typing effect
  const simulateTyping = (callback, delay = 800) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const addBotMessage = (text, newOptions = [], newQuickReplies = []) => {
    simulateTyping(() => {
      setMessages(prev => [...prev, {
        sender: 'bot',
        text,
        timestamp: new Date(),
      }]);
      setOptions(newOptions);
      setQuickReplies(newQuickReplies);
    });
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, {
      sender: 'user',
      text,
      timestamp: new Date(),
    }]);
  };

  const showWelcomeMessage = () => {
    const greeting = getTimeBasedGreeting();
    const welcomeText = `${greeting} ✨

Welcome to **The Nail Hubs**!
I'm your virtual nail assistant, here to help you discover our services and book your perfect appointment.

How can I assist you today?`;

    setMessages([{
      sender: 'bot',
      text: welcomeText,
      timestamp: new Date(),
    }]);

    setOptions([
      { label: '📅 Book Appointment', value: 'book', icon: '📅' },
      { label: '💅 View Services', value: 'services', icon: '💅' },
      { label: '💰 Pricing Info', value: 'pricing', icon: '💰' },
      { label: '📍 Location & Hours', value: 'location', icon: '📍' },
      { label: '❓ FAQs', value: 'faq', icon: '❓' },
      { label: '📞 Contact Us', value: 'contact', icon: '📞' },
    ]);

    setQuickReplies(['What services do you offer?', 'How to book?', 'Where are you located?']);
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleOptionClick = (option) => {
    const value = option.value || option;

    // Add user selection as message
    const displayText = option.label || value;
    addUserMessage(displayText);
    setOptions([]);
    setQuickReplies([]);

    switch (value) {
      case 'book':
        handleBooking();
        break;
      case 'services':
        handleServices();
        break;
      case 'pricing':
        handlePricing();
        break;
      case 'location':
        handleLocation();
        break;
      case 'faq':
        handleFAQ();
        break;
      case 'contact':
        handleContact();
        break;
      case 'book_whatsapp':
        openWhatsAppBooking();
        break;
      case 'book_call':
        window.open('tel:+917698235501', '_self');
        break;
      case 'open_maps':
        window.open(businessInfo.mapsLink, '_blank');
        break;
      case 'open_instagram':
        window.open('https://www.instagram.com/thenailhubs/', '_blank');
        break;
      case 'whatsapp_channel':
        window.open(businessInfo.whatsappChannel, '_blank');
        break;
      case 'whatsapp_chat':
        window.open('https://wa.me/917698235501', '_blank');
        break;
      case 'main_menu':
        showWelcomeMessage();
        break;
      case 'faq_bridal':
        addBotMessage(faqs.bridal, getBackToMenuOptions());
        break;
      case 'faq_products':
        addBotMessage(faqs.products, getBackToMenuOptions());
        break;
      case 'faq_hygiene':
        addBotMessage(faqs.hygiene, getBackToMenuOptions());
        break;
      case 'faq_walkin':
        addBotMessage(faqs.walkIn, getBackToMenuOptions());
        break;
      case 'faq_parking':
        addBotMessage(faqs.parking, getBackToMenuOptions());
        break;
      case 'faq_payment':
        addBotMessage(faqs.payment, getBackToMenuOptions());
        break;
      case 'service_acrylic':
      case 'service_art':
      case 'service_extensions':
      case 'service_decals':
      case 'service_polish':
      case 'service_painting':
      case 'service_repair':
        handleServiceDetail(value);
        break;
      default:
        handleNaturalLanguage(value);
    }
  };

  const getBackToMenuOptions = () => [
    { label: '📅 Book Now', value: 'book' },
    { label: '🔙 Main Menu', value: 'main_menu' },
  ];

  const handleBooking = () => {
    const bookingText = `📅 **Book Your Appointment**

Ready to pamper yourself? Here's how to book:

**WhatsApp Booking** (Recommended)
Quick responses & easy scheduling!

**Call Us**
Speak directly with our team

🕐 **Hours:** ${businessInfo.hours}
👩‍🎨 **Artist:** Saloni (Owner)

What's your preferred booking method?`;

    addBotMessage(bookingText, [
      { label: '📱 Book on WhatsApp', value: 'book_whatsapp', highlight: true },
      { label: '📞 Call Now', value: 'book_call' },
      { label: '🔙 Main Menu', value: 'main_menu' },
    ]);
  };

  const handleServices = () => {
    let servicesText = `💅 **Our Services**

We offer a wide range of premium nail services:\n\n`;

    services.forEach(service => {
      const popular = service.popular ? ' ⭐ Most Popular' : '';
      servicesText += `${service.icon} **${service.name}**${popular}\n   ⏱️ ${service.duration}\n\n`;
    });

    servicesText += `✨ All services include premium products & expert care by Saloni!

Select a service to learn more:`;

    addBotMessage(servicesText, [
      { label: '💅 Acrylic Nails', value: 'service_acrylic' },
      { label: '🎨 Nail Art', value: 'service_art' },
      { label: '💎 Extensions', value: 'service_extensions' },
      { label: '📅 Book Now', value: 'book' },
      { label: '🔙 Main Menu', value: 'main_menu' },
    ]);
  };

  const handleServiceDetail = (serviceValue) => {
    const serviceDetails = {
      'service_acrylic': {
        name: 'Acrylic Nails',
        duration: '100-120 minutes',
        description: 'Durable acrylic extensions for strength and length with custom shapes. Perfect for special events, weddings, and long-lasting glamour!',
        features: ['Custom length & shape', 'Extra durability', 'Various designs available', 'Long-lasting results'],
      },
      'service_art': {
        name: 'Nail Art',
        duration: '75-120 minutes',
        description: 'Creative and intricate nail art designs customized to your style. From minimalist to elaborate patterns!',
        features: ['Custom designs', 'Hand-painted artwork', 'Trending styles', 'Personal consultation'],
      },
      'service_extensions': {
        name: 'Nail Extensions',
        duration: '90-110 minutes',
        description: 'Beautiful nail extensions that look natural and feel comfortable. Perfect for adding length and elegance!',
        features: ['Natural appearance', 'Various lengths', 'Lightweight feel', 'Customizable shapes'],
      },
      'service_decals': {
        name: 'Nail Decals',
        duration: '25-35 minutes',
        description: 'Stylish nail decals for quick and easy nail decoration. Great for a quick glam-up!',
        features: ['Wide variety of designs', 'Easy application', 'Long-lasting', 'Quick service'],
      },
      'service_polish': {
        name: 'Nail Polish Changes',
        duration: '25-30 minutes',
        description: 'Quick polish changes with our premium color collection. Perfect for a fresh new look!',
        features: ['Wide color range', 'Premium brands', 'Perfect finish', 'Quick turnaround'],
      },
      'service_painting': {
        name: 'Nail Painting & Designs',
        duration: '60-90 minutes',
        description: 'Hand-painted nail designs from simple to elaborate patterns. Express your personality!',
        features: ['Custom painting', 'Artistic designs', 'Personal consultation', 'Unique creations'],
      },
      'service_repair': {
        name: 'Nail Repair',
        duration: '20-30 minutes',
        description: 'Professional repair service for damaged or broken nails. Get your nails back to perfect condition!',
        features: ['Quick fixes', 'Seamless repair', 'Restore natural look', 'Affordable'],
      },
    };

    const service = serviceDetails[serviceValue];
    if (!service) return;

    let detailText = `${service.name === 'Acrylic Nails' ? '💅' : '✨'} **${service.name}**

⏱️ **Duration:** ${service.duration}

${service.description}

**What's Included:**
${service.features.map(f => `✓ ${f}`).join('\n')}

Ready to book this service?`;

    addBotMessage(detailText, [
      { label: '📅 Book This Service', value: 'book', highlight: true },
      { label: '💅 View Other Services', value: 'services' },
      { label: '🔙 Main Menu', value: 'main_menu' },
    ]);
  };

  const handlePricing = () => {
    const pricingText = `💰 **Pricing Information**

Our pricing varies based on:
• Type of service
• Design complexity
• Time required

**How to Get a Quote:**
1. 📱 WhatsApp us your preferred design
2. 💬 Describe what you're looking for
3. 💰 We'll provide an accurate quote!

**Payment Methods Accepted:**
✓ Cash
✓ UPI (GPay, PhonePe, Paytm)
✓ All major payment methods

Get a personalized quote now!`;

    addBotMessage(pricingText, [
      { label: '📱 Get Quote on WhatsApp', value: 'whatsapp_chat', highlight: true },
      { label: '💅 View Services', value: 'services' },
      { label: '🔙 Main Menu', value: 'main_menu' },
    ]);
  };

  const handleLocation = () => {
    const locationText = `📍 **Visit Us**

**The Nail Hubs**
B-292, Garden City
GIDC, Ankleshwar - 393001
Gujarat, India

🕐 **Working Hours**
Open All 7 Days
11:00 AM - 6:00 PM

🚗 **Parking:** Available at Garden City

💜 **Women-Owned Business**
Run by Saloni with passion & expertise!

Customers travel from Bharuch just to visit us! 🚗`;

    addBotMessage(locationText, [
      { label: '🗺️ Open in Google Maps', value: 'open_maps', highlight: true },
      { label: '📱 Get Directions via WhatsApp', value: 'whatsapp_chat' },
      { label: '📅 Book Appointment', value: 'book' },
      { label: '🔙 Main Menu', value: 'main_menu' },
    ]);
  };

  const handleContact = () => {
    const contactText = `📞 **Contact Us**

**Phone/WhatsApp**
📱 07698 235501

**Instagram**
📸 @thenailhubs

**WhatsApp Channel**
📢 Join for updates & offers!

**Location**
📍 B-292, Garden City, Ankleshwar

Our owner Saloni personally responds to all inquiries! She's known for being sweet, polite, and incredibly helpful. 💜`;

    addBotMessage(contactText, [
      { label: '💬 Chat on WhatsApp', value: 'whatsapp_chat', highlight: true },
      { label: '📞 Call Now', value: 'book_call' },
      { label: '📸 Visit Instagram', value: 'open_instagram' },
      { label: '📢 Join WhatsApp Channel', value: 'whatsapp_channel' },
      { label: '🔙 Main Menu', value: 'main_menu' },
    ]);
  };

  const handleFAQ = () => {
    const faqText = `❓ **Frequently Asked Questions**

Select a question to get your answer:`;

    addBotMessage(faqText, [
      { label: '👰 Bridal Services?', value: 'faq_bridal' },
      { label: '💎 Products Used?', value: 'faq_products' },
      { label: '🧹 Hygiene Standards?', value: 'faq_hygiene' },
      { label: '🚶 Walk-ins Welcome?', value: 'faq_walkin' },
      { label: '🚗 Parking Available?', value: 'faq_parking' },
      { label: '💳 Payment Methods?', value: 'faq_payment' },
      { label: '🔙 Main Menu', value: 'main_menu' },
    ]);
  };

  const openWhatsAppBooking = () => {
    const message = encodeURIComponent(
      `Hello Saloni! 👋\n\nI would like to book an appointment at The Nail Hubs.\n\n📝 Details:\n• Name: \n• Preferred Date: \n• Preferred Time: \n• Service: \n• Any specific design in mind: \n\nThank you! 💅`
    );
    window.open(`https://wa.me/917698235501?text=${message}`, '_blank');
  };

  const handleNaturalLanguage = (text) => {
    const lowerText = text.toLowerCase();

    // Keywords matching
    if (lowerText.includes('book') || lowerText.includes('appointment') || lowerText.includes('schedule')) {
      handleBooking();
    } else if (lowerText.includes('service') || lowerText.includes('offer') || lowerText.includes('what do you')) {
      handleServices();
    } else if (lowerText.includes('price') || lowerText.includes('cost') || lowerText.includes('how much') || lowerText.includes('rate')) {
      handlePricing();
    } else if (lowerText.includes('location') || lowerText.includes('address') || lowerText.includes('where') || lowerText.includes('direction')) {
      handleLocation();
    } else if (lowerText.includes('hour') || lowerText.includes('time') || lowerText.includes('open') || lowerText.includes('close')) {
      handleLocation();
    } else if (lowerText.includes('contact') || lowerText.includes('phone') || lowerText.includes('call') || lowerText.includes('whatsapp')) {
      handleContact();
    } else if (lowerText.includes('acrylic')) {
      handleServiceDetail('service_acrylic');
    } else if (lowerText.includes('nail art') || lowerText.includes('art')) {
      handleServiceDetail('service_art');
    } else if (lowerText.includes('extension')) {
      handleServiceDetail('service_extensions');
    } else if (lowerText.includes('bridal') || lowerText.includes('wedding')) {
      addBotMessage(faqs.bridal, getBackToMenuOptions());
    } else if (lowerText.includes('hi') || lowerText.includes('hello') || lowerText.includes('hey')) {
      showWelcomeMessage();
    } else if (lowerText.includes('thank')) {
      addBotMessage(`You're welcome! 💜\n\nIs there anything else I can help you with?\n\nFeel free to ask anything about our services or book your appointment!`, getBackToMenuOptions());
    } else {
      // Default response for unrecognized input
      addBotMessage(`I'd be happy to help! 😊\n\nFor the best assistance, please select from the options below or try asking about:\n• Our services\n• Booking an appointment\n• Pricing information\n• Location & hours\n\nOr simply WhatsApp us for personalized help!`, [
        { label: '📅 Book Appointment', value: 'book' },
        { label: '💅 View Services', value: 'services' },
        { label: '💬 WhatsApp Us', value: 'whatsapp_chat' },
        { label: '🔙 Main Menu', value: 'main_menu' },
      ]);
    }
  };

  const handleQuickReply = (reply) => {
    addUserMessage(reply);
    setQuickReplies([]);
    setOptions([]);
    handleNaturalLanguage(reply);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userInput = input.trim();
    addUserMessage(userInput);
    setInput('');
    setOptions([]);
    setQuickReplies([]);

    handleNaturalLanguage(userInput);
  };

  if (!isOpen) return null;

  return (
    <div className="chat-widget">
      <div className="chat-header">
        <div className="header-content">
          <div className="header-avatar">
            <span className="avatar-icon">💅</span>
            <span className="online-indicator"></span>
          </div>
          <div className="header-info">
            <h3>The Nail Hubs</h3>
            <p className="status">
              <span className="status-dot"></span>
              Online • Typically replies instantly
            </p>
          </div>
        </div>
        <button className="close-button" onClick={onClose} aria-label="Close chat">
          ✕
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.sender === 'bot' && (
              <div className="bot-avatar">💅</div>
            )}
            <div className="message-bubble">
              <p style={{ whiteSpace: 'pre-line' }}
                 dangerouslySetInnerHTML={{
                   __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                 }}
              />
              <span className="timestamp">
                {msg.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="message bot">
            <div className="bot-avatar">💅</div>
            <div className="message-bubble typing">
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

      {quickReplies.length > 0 && (
        <div className="quick-replies-container">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              className="quick-reply-button"
              onClick={() => handleQuickReply(reply)}
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {options.length > 0 && (
        <div className="options-container">
          {options.map((option, index) => (
            <button
              key={index}
              className={`option-button ${option.highlight ? 'highlight' : ''}`}
              onClick={() => handleOptionClick(option)}
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
          placeholder="Type a message..."
          className="chat-input"
          disabled={isTyping}
        />
        <button
          type="submit"
          className="send-button"
          disabled={!input.trim() || isTyping}
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </form>

      <div className="chat-footer">
        <span>Powered by</span>
        <strong>The Nail Hubs</strong>
        <span>💜 Women-Owned</span>
      </div>
    </div>
  );
}

export default ChatWidget;
