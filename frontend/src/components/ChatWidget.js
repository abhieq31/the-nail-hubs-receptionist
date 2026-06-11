import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import './ChatWidget.css';

function ChatWidget({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [options, setOptions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  const messagesEndRef = useRef(null);
  // Active booking / reschedule / manage flow (kept in a ref so async
  // handlers and the input handler always see the latest step)
  const flowRef = useRef(null);

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
    duration: "Service durations vary: Acrylic Nails (100-120 min), Nail Art (75-120 min), Extensions (90-110 min), Decals (25-35 min), Polish Change (25-30 min), Nail Repair (20-30 min).",
    refill: "We recommend getting a refill every 2-3 weeks for acrylic nails and extensions to maintain their beauty and prevent lifting.",
  };

  // Nail care tips
  const nailCareTips = [
    "💧 Keep your nails hydrated by applying cuticle oil daily",
    "🧤 Wear gloves when doing household chores to protect your nails",
    "💅 Avoid using nails as tools - they're jewels, not tools!",
    "🥗 Eat biotin-rich foods like eggs, almonds & sweet potatoes for stronger nails",
    "💤 Give your nails a break between extensions to let them breathe",
    "🚫 Don't peel or pick at your nail polish - it damages the nail bed",
    "✨ Apply a base coat before polish to prevent staining",
  ];

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
    flowRef.current = null;
    const greeting = getTimeBasedGreeting();
    const welcomeText = `${greeting} ✨

Welcome to **The Nail Hubs**!
I'm your 24/7 receptionist — I can book your appointment instantly right here, or help you reschedule and answer any questions.

How can I assist you today?`;

    setMessages([{
      sender: 'bot',
      text: welcomeText,
      timestamp: new Date(),
    }]);

    setOptions([
      { label: '📅 Book Appointment', value: 'book', icon: '📅', highlight: true },
      { label: '🗂️ Manage My Booking', value: 'manage', icon: '🗂️' },
      { label: '💅 View Services', value: 'services', icon: '💅' },
      { label: '💰 Pricing Info', value: 'pricing', icon: '💰' },
      { label: '📍 Location & Hours', value: 'location', icon: '📍' },
      { label: '💡 Nail Care Tips', value: 'tips', icon: '💡' },
      { label: '⭐ Reviews', value: 'reviews', icon: '⭐' },
      { label: '❓ FAQs', value: 'faq', icon: '❓' },
      { label: '📞 Contact Us', value: 'contact', icon: '📞' },
    ]);

    setQuickReplies(['Book appointment', 'View services', 'Nail care tips']);
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

    // Live booking flow buttons (value encodes "prefix:data|label")
    if (typeof value === 'string') {
      if (value.startsWith('svc:')) {
        chooseService(value.slice(4));
        return;
      }
      if (value.startsWith('date:')) {
        const [date, label] = value.slice(5).split('|');
        chooseDate(date, label);
        return;
      }
      if (value.startsWith('slot:')) {
        const [time, label] = value.slice(5).split('|');
        chooseSlot(time, label);
        return;
      }
    }

    switch (value) {
      case 'book':
        handleBooking();
        break;
      case 'manage':
        handleManage();
        break;
      case 'confirm_booking':
        confirmBooking();
        break;
      case 'manage_cancel':
        confirmCancel();
        break;
      case 'manage_cancel_yes':
        doCancel();
        break;
      case 'manage_reschedule':
        startReschedule();
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
      case 'tips':
        handleNailCareTips();
        break;
      case 'reviews':
        handleReviews();
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
      case 'faq_duration':
        addBotMessage(faqs.duration, getBackToMenuOptions());
        break;
      case 'faq_refill':
        addBotMessage(faqs.refill, getBackToMenuOptions());
        break;
      case 'open_reviews':
        window.open('https://www.google.com/maps/place/The+Nail+Hubs/@21.5980035,73.0473514,17z/data=!4m8!3m7!1s0x3be0237ec798dc17:0xbe20ebcb0a43670a!8m2!3d21.5980035!4d73.0473514!9m1!1b1!16s%2Fg%2F11v9_ppp79?entry=ttu', '_blank');
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

  // ── Live booking flow (talks to the FastAPI backend) ──────────────

  const apiUnavailable = (intro = "Hmm, I couldn't reach our booking system right now. 😔") => {
    flowRef.current = null;
    addBotMessage(`${intro}

No worries — you can book instantly on WhatsApp and Saloni will confirm your slot personally! 💜`, [
      { label: '📱 Book on WhatsApp', value: 'book_whatsapp', highlight: true },
      { label: '🔄 Try Again', value: 'book' },
      { label: '📞 Call Us', value: 'book_call' },
      { label: '🔙 Main Menu', value: 'main_menu' },
    ]);
  };

  const handleBooking = async () => {
    setIsTyping(true);
    try {
      const { services: liveServices } = await api.getServices();
      flowRef.current = { type: 'book', step: 'service' };
      addBotMessage(`📅 **Let's book your appointment!**

I'll reserve your slot instantly — no waiting, confirmed on the spot. ✨

Which service would you like?`, [
        ...liveServices.map(s => ({
          label: `${s.icon} ${s.name} · ${s.display_duration}`,
          value: `svc:${s.name}`,
          highlight: s.popular,
        })),
        { label: '📱 Prefer WhatsApp?', value: 'book_whatsapp' },
        { label: '🔙 Main Menu', value: 'main_menu' },
      ]);
    } catch (e) {
      apiUnavailable();
    }
  };

  const chooseService = async (serviceName) => {
    setIsTyping(true);
    try {
      const { dates } = await api.getAvailableDates(7);
      flowRef.current = { ...(flowRef.current || { type: 'book' }), step: 'date', service: serviceName };
      addBotMessage(`Great choice! ✨ **${serviceName}** it is.

Which day works best for you?`, [
        ...dates.map(d => ({ label: `📅 ${d.formatted}`, value: `date:${d.date}|${d.formatted}` })),
        { label: '🔙 Main Menu', value: 'main_menu' },
      ]);
    } catch (e) {
      apiUnavailable();
    }
  };

  const chooseDate = async (date, dateLabel) => {
    const flow = flowRef.current;
    if (!flow || !flow.service) return showWelcomeMessage();
    setIsTyping(true);
    try {
      const { slots } = await api.getAvailability(flow.service, date, 6);
      if (!slots || slots.length === 0) {
        addBotMessage(`Oh no, **${dateLabel}** is fully booked! 😅

Saloni's artistry is in high demand. Shall we try another day?`, [
          { label: '📅 Pick Another Day', value: `svc:${flow.service}`, highlight: true },
          { label: '🔙 Main Menu', value: 'main_menu' },
        ]);
        return;
      }
      flowRef.current = { ...flow, step: 'time', date, dateLabel };
      addBotMessage(`Perfect! Here are the open times for **${flow.service}** on **${dateLabel}**:`, [
        ...slots.map(s => ({ label: `⏰ ${s.formatted_time}`, value: `slot:${s.time}|${s.formatted_time}` })),
        { label: '🔙 Pick Another Day', value: `svc:${flow.service}` },
        { label: '🔙 Main Menu', value: 'main_menu' },
      ]);
    } catch (e) {
      apiUnavailable();
    }
  };

  const chooseSlot = async (time, timeLabel) => {
    const flow = flowRef.current;
    if (!flow || !flow.date) return showWelcomeMessage();

    if (flow.type === 'reschedule') {
      setIsTyping(true);
      try {
        await api.reschedule(flow.confirmationId, flow.date, time);
        flowRef.current = null;
        addBotMessage(`✨ **All done!** Your appointment has been moved.

📅 ${flow.dateLabel}
⏰ ${timeLabel}
🆔 ${flow.confirmationId}

We'll see you then! 💅`, getBackToMenuOptions());
      } catch (e) {
        if (e.status === 409) {
          addBotMessage(`Oops, that slot was just taken! 😱 Let me show you the latest availability.`, []);
          setTimeout(() => chooseDate(flow.date, flow.dateLabel), 1200);
        } else if (e.status === 404) {
          flowRef.current = null;
          addBotMessage(`I couldn't find that booking anymore. Please check your confirmation ID.`, getBackToMenuOptions());
        } else {
          apiUnavailable();
        }
      }
      return;
    }

    flowRef.current = { ...flow, step: 'name', time, timeLabel };
    addBotMessage(`Lovely! **${timeLabel}** on **${flow.dateLabel}** it is. 💖

May I have your name, please? (Just type it below)`);
  };

  const handleNameInput = (text) => {
    const name = text.trim().replace(/\s+/g, ' ');
    if (name.length < 2 || name.length > 50) {
      addBotMessage('Could you please share your full name? (2–50 characters)');
      return;
    }
    const pretty = name.replace(/\b\w/g, c => c.toUpperCase());
    flowRef.current = { ...flowRef.current, step: 'phone', name: pretty };
    addBotMessage(`Thank you, ${pretty}! 😊

And your 10-digit phone number? (We'll use it to confirm your appointment)`);
  };

  const handlePhoneInput = (text) => {
    const phone = text.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    if (phone.length !== 10) {
      addBotMessage('That doesn\'t look like a valid number — please enter your **10-digit** phone number. 📞');
      return;
    }
    const flow = flowRef.current;
    flowRef.current = { ...flow, step: 'confirm', phone };
    addBotMessage(`Almost there! Please confirm your booking:

💅 **Service:** ${flow.service}
📅 **Date:** ${flow.dateLabel}
⏰ **Time:** ${flow.timeLabel}
👤 **Name:** ${flow.name}
📞 **Phone:** ${phone}

Shall I confirm it?`, [
      { label: '✅ Confirm Booking', value: 'confirm_booking', highlight: true },
      { label: '✏️ Start Over', value: 'book' },
      { label: '🔙 Main Menu', value: 'main_menu' },
    ]);
  };

  const confirmBooking = async () => {
    const flow = flowRef.current;
    if (!flow || !flow.phone) return showWelcomeMessage();
    setIsTyping(true);
    try {
      const { appointment } = await api.book({
        customer_name: flow.name,
        customer_phone: flow.phone,
        service: flow.service,
        appointment_date: flow.date,
        appointment_time: flow.time,
      });
      flowRef.current = null;
      addBotMessage(`🎉 **You're booked, ${flow.name}!**

💅 ${flow.service}
📅 ${flow.dateLabel}
⏰ ${flow.timeLabel}

🆔 **Confirmation ID:** ${appointment.confirmation_id}

Please save this ID — you can use it right here anytime to reschedule or cancel. We can't wait to pamper you! 💜`, [
        { label: '🗂️ Manage This Booking', value: 'manage' },
        { label: '📸 See Our Work', value: 'open_instagram' },
        { label: '🔙 Main Menu', value: 'main_menu' },
      ]);
    } catch (e) {
      if (e.status === 409) {
        addBotMessage(`Oh no, that slot was booked by someone else just now! 😱 Let me show you the latest times.`, []);
        setTimeout(() => chooseDate(flow.date, flow.dateLabel), 1200);
      } else {
        apiUnavailable('Something went wrong while confirming your booking. 😔');
      }
    }
  };

  // ── Manage booking (lookup / reschedule / cancel) ──────────────────

  const handleManage = () => {
    flowRef.current = { type: 'manage', step: 'manage_id' };
    addBotMessage(`🗂️ **Manage Your Booking**

Please type your confirmation ID (it looks like **NH1A2B3C** and was given when you booked).`, [
      { label: '🔙 Main Menu', value: 'main_menu' },
    ]);
  };

  const handleManageId = async (text) => {
    const match = text.toUpperCase().match(/NH[A-F0-9]{6}/);
    if (!match) {
      addBotMessage(`Hmm, that doesn't look like a confirmation ID. It should look like **NH1A2B3C**. Please try again, or contact us if you've lost it.`, [
        { label: '💬 WhatsApp Us', value: 'whatsapp_chat' },
        { label: '🔙 Main Menu', value: 'main_menu' },
      ]);
      return;
    }
    const confirmationId = match[0];
    setIsTyping(true);
    try {
      const appointment = await api.getAppointment(confirmationId);
      if (appointment.status !== 'confirmed') {
        flowRef.current = null;
        addBotMessage(`That appointment has already been **${appointment.status}**.

Would you like to book a new one?`, [
          { label: '📅 Book New Appointment', value: 'book', highlight: true },
          { label: '🔙 Main Menu', value: 'main_menu' },
        ]);
        return;
      }
      flowRef.current = { type: 'manage', step: 'manage_action', confirmationId, appointment };
      const dateObj = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
      const formattedDate = dateObj.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });
      const formattedTime = dateObj.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
      addBotMessage(`Found it! Here's your appointment: ✨

💅 **${appointment.service}**
📅 ${formattedDate}
⏰ ${formattedTime}
👤 ${appointment.customer_name}

What would you like to do?`, [
        { label: '🔁 Reschedule', value: 'manage_reschedule', highlight: true },
        { label: '❌ Cancel Appointment', value: 'manage_cancel' },
        { label: '🔙 Main Menu', value: 'main_menu' },
      ]);
    } catch (e) {
      if (e.status === 404) {
        addBotMessage(`I couldn't find a booking with ID **${confirmationId}**. Please double-check it, or reach out to us directly.`, [
          { label: '💬 WhatsApp Us', value: 'whatsapp_chat' },
          { label: '🔙 Main Menu', value: 'main_menu' },
        ]);
      } else {
        apiUnavailable("I couldn't reach our booking system right now. 😔");
      }
    }
  };

  const startReschedule = async () => {
    const flow = flowRef.current;
    if (!flow || !flow.appointment) return showWelcomeMessage();
    setIsTyping(true);
    try {
      const { dates } = await api.getAvailableDates(7);
      flowRef.current = {
        type: 'reschedule',
        step: 'date',
        service: flow.appointment.service,
        confirmationId: flow.confirmationId,
      };
      addBotMessage(`🔁 Let's find a new time for your **${flow.appointment.service}**.

Which day works best?`, [
        ...dates.map(d => ({ label: `📅 ${d.formatted}`, value: `date:${d.date}|${d.formatted}` })),
        { label: '🔙 Main Menu', value: 'main_menu' },
      ]);
    } catch (e) {
      apiUnavailable();
    }
  };

  const confirmCancel = () => {
    const flow = flowRef.current;
    if (!flow || !flow.confirmationId) return showWelcomeMessage();
    addBotMessage(`Are you sure you want to cancel your **${flow.appointment.service}** appointment? 🥺`, [
      { label: '✅ Yes, Cancel It', value: 'manage_cancel_yes' },
      { label: '💜 No, Keep It', value: 'main_menu', highlight: true },
    ]);
  };

  const doCancel = async () => {
    const flow = flowRef.current;
    if (!flow || !flow.confirmationId) return showWelcomeMessage();
    setIsTyping(true);
    try {
      await api.cancel(flow.confirmationId);
      flowRef.current = null;
      addBotMessage(`Your appointment has been cancelled. We hope to see you again soon! 💕

Whenever you're ready to treat yourself, I'm here 24/7. ✨`, [
        { label: '📅 Book New Appointment', value: 'book', highlight: true },
        { label: '🔙 Main Menu', value: 'main_menu' },
      ]);
    } catch (e) {
      apiUnavailable("I couldn't cancel it right now. 😔");
    }
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
      { label: '⏱️ Service Duration?', value: 'faq_duration' },
      { label: '🔄 Refill Timing?', value: 'faq_refill' },
      { label: '🔙 Main Menu', value: 'main_menu' },
    ]);
  };

  const handleNailCareTips = () => {
    const randomTips = nailCareTips.sort(() => 0.5 - Math.random()).slice(0, 4);

    const tipsText = `💡 **Nail Care Tips from The Nail Hubs**

Here are some expert tips to keep your nails healthy & beautiful:

${randomTips.join('\n\n')}

✨ **Pro Tip:** Regular visits to your nail technician help catch problems early!

Want to maintain beautiful nails? Book a session with Saloni!`;

    addBotMessage(tipsText, [
      { label: '📅 Book Appointment', value: 'book', highlight: true },
      { label: '💅 View Services', value: 'services' },
      { label: '💡 More Tips', value: 'tips' },
      { label: '🔙 Main Menu', value: 'main_menu' },
    ]);
  };

  const handleReviews = () => {
    const reviewsText = `⭐ **What Our Clients Say**

We're proud to have a **5.0 rating** on Google! Here's what our customers love:

💬 *"I went here for my wedding Nail art… Saloni explains well about shapes, gel polish, which colour would suit on my outfits..."*
— **Vyoma Patel** (Local Guide)

💬 *"Such a relaxing and enjoyable experience! The design turned out even better than I imagined!"*
— **Dhvani Shah**

💬 *"She has magical hands... Got awesome nails.... Specially came from Bharuch!"*
— **Minaxi Patel**

💬 *"Very happy with the service! My sister got her nails done for her birthday ceremony and was too happy!"*
— **Meet Patel**

🌟 Customers travel from Bharuch just to visit us!

Leave your own review after your visit!`;

    addBotMessage(reviewsText, [
      { label: '📅 Book & Experience', value: 'book', highlight: true },
      { label: '⭐ Leave a Review', value: 'open_reviews' },
      { label: '📸 See Our Work', value: 'open_instagram' },
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

    // Keywords matching - ordered by specificity
    if (/nh[a-f0-9]{6}/i.test(text) || lowerText.includes('cancel') || lowerText.includes('reschedul') || lowerText.includes('confirmation id') || lowerText.includes('my booking')) {
      if (/nh[a-f0-9]{6}/i.test(text)) {
        handleManageId(text);
      } else {
        handleManage();
      }
    } else if (lowerText.includes('book') || lowerText.includes('appointment') || lowerText.includes('schedule') || lowerText.includes('reserve')) {
      handleBooking();
    } else if (lowerText.includes('tip') || lowerText.includes('care') || lowerText.includes('maintain') || lowerText.includes('healthy nail')) {
      handleNailCareTips();
    } else if (lowerText.includes('review') || lowerText.includes('rating') || lowerText.includes('feedback') || lowerText.includes('testimonial')) {
      handleReviews();
    } else if (lowerText.includes('service') || lowerText.includes('offer') || lowerText.includes('what do you') || lowerText.includes('menu')) {
      handleServices();
    } else if (lowerText.includes('price') || lowerText.includes('cost') || lowerText.includes('how much') || lowerText.includes('rate') || lowerText.includes('charge')) {
      handlePricing();
    } else if (lowerText.includes('location') || lowerText.includes('address') || lowerText.includes('where') || lowerText.includes('direction') || lowerText.includes('find you')) {
      handleLocation();
    } else if (lowerText.includes('hour') || lowerText.includes('timing') || lowerText.includes('open') || lowerText.includes('close') || lowerText.includes('when')) {
      handleLocation();
    } else if (lowerText.includes('contact') || lowerText.includes('phone') || lowerText.includes('call') || lowerText.includes('whatsapp') || lowerText.includes('reach')) {
      handleContact();
    } else if (lowerText.includes('acrylic')) {
      handleServiceDetail('service_acrylic');
    } else if (lowerText.includes('nail art') || (lowerText.includes('art') && lowerText.includes('nail'))) {
      handleServiceDetail('service_art');
    } else if (lowerText.includes('extension') || lowerText.includes('extend')) {
      handleServiceDetail('service_extensions');
    } else if (lowerText.includes('decal') || lowerText.includes('sticker')) {
      handleServiceDetail('service_decals');
    } else if (lowerText.includes('polish') || lowerText.includes('color change') || lowerText.includes('colour change')) {
      handleServiceDetail('service_polish');
    } else if (lowerText.includes('repair') || lowerText.includes('fix') || lowerText.includes('broken')) {
      handleServiceDetail('service_repair');
    } else if (lowerText.includes('bridal') || lowerText.includes('wedding') || lowerText.includes('bride') || lowerText.includes('shaadi')) {
      addBotMessage(faqs.bridal, getBackToMenuOptions());
    } else if (lowerText.includes('refill') || lowerText.includes('maintenance') || lowerText.includes('touch up')) {
      addBotMessage(faqs.refill, getBackToMenuOptions());
    } else if (lowerText.includes('how long') || lowerText.includes('duration') || lowerText.includes('time take')) {
      addBotMessage(faqs.duration, getBackToMenuOptions());
    } else if (lowerText.includes('hygiene') || lowerText.includes('clean') || lowerText.includes('sanitize') || lowerText.includes('safe')) {
      addBotMessage(faqs.hygiene, getBackToMenuOptions());
    } else if (lowerText.includes('park') || lowerText.includes('parking')) {
      addBotMessage(faqs.parking, getBackToMenuOptions());
    } else if (lowerText.includes('payment') || lowerText.includes('pay') || lowerText.includes('upi') || lowerText.includes('cash') || lowerText.includes('card')) {
      addBotMessage(faqs.payment, getBackToMenuOptions());
    } else if (lowerText.includes('walk') || lowerText.includes('without appointment')) {
      addBotMessage(faqs.walkIn, getBackToMenuOptions());
    } else if (lowerText.includes('product') || lowerText.includes('brand') || lowerText.includes('quality')) {
      addBotMessage(faqs.products, getBackToMenuOptions());
    } else if (lowerText.includes('saloni') || lowerText.includes('owner') || lowerText.includes('who')) {
      addBotMessage(`💜 **Meet Saloni - Owner & Artist**\n\nSaloni is the heart of The Nail Hubs! She personally handles all appointments and is known for:\n\n✨ Her cooperative nature\n✨ Expert advice on nail shapes & colors\n✨ Beautiful custom designs\n✨ Sweet and polite personality\n\nCustomers love her expertise and attention to detail! Book now to experience her magic.`, getBackToMenuOptions());
    } else if (lowerText.includes('hi') || lowerText.includes('hello') || lowerText.includes('hey') || lowerText.includes('hii') || lowerText.includes('hola')) {
      showWelcomeMessage();
    } else if (lowerText.includes('thank') || lowerText.includes('thanks') || lowerText.includes('thx')) {
      addBotMessage(`You're welcome! 💜\n\nIs there anything else I can help you with?\n\nFeel free to ask anything about our services or book your appointment!`, getBackToMenuOptions());
    } else if (lowerText.includes('bye') || lowerText.includes('goodbye') || lowerText.includes('see you')) {
      addBotMessage(`Goodbye! 👋\n\nThank you for chatting with The Nail Hubs! We hope to see you soon for your nail pampering session. 💅\n\nHave a beautiful day! ✨`, getBackToMenuOptions());
    } else if (lowerText.includes('help') || lowerText.includes('support')) {
      showWelcomeMessage();
    } else {
      // Default response for unrecognized input
      addBotMessage(`I'd be happy to help! 😊\n\nFor the best assistance, please select from the options below or try asking about:\n• Our services\n• Booking an appointment\n• Pricing information\n• Location & hours\n• Nail care tips\n\nOr simply WhatsApp us for personalized help!`, [
        { label: '📅 Book Appointment', value: 'book' },
        { label: '💅 View Services', value: 'services' },
        { label: '💡 Nail Care Tips', value: 'tips' },
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

    // If a booking flow is waiting for typed input, route there first
    const step = flowRef.current?.step;
    if (step === 'name') {
      handleNameInput(userInput);
    } else if (step === 'phone') {
      handlePhoneInput(userInput);
    } else if (step === 'manage_id') {
      handleManageId(userInput);
    } else {
      handleNaturalLanguage(userInput);
    }
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
