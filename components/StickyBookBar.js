'use client';

import React, { useState, useEffect } from 'react';
import { BUSINESS } from '@/lib/businessRules';
import { useChat } from './ChatProvider';

// Mobile-only sticky action bar: most visitors arrive from Instagram on a
// phone — booking should never be more than one thumb-tap away.
function StickyBookBar() {
  const { isChatOpen, isBookingOpen, openBooking } = useChat();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible || isChatOpen || isBookingOpen) return null;

  return (
    <div className="sticky-book-bar">
      <button className="sticky-book-btn primary" onClick={() => openBooking()}>
        💅 Book Now
      </button>
      <a
        className="sticky-book-btn whatsapp"
        href={`https://wa.me/${BUSINESS.phoneIntl}?text=Hello%2C%20I%20would%20like%20to%20book.`}
        target="_blank"
        rel="noopener noreferrer"
      >
        📱 WhatsApp
      </a>
    </div>
  );
}

export default StickyBookBar;
