'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import ChatWidget from './ChatWidget';
import StickyBookBar from './StickyBookBar';
import BookingFlow from './BookingFlow';

const ChatContext = createContext({
  isChatOpen: false,
  openChat: () => {},
  closeChat: () => {},
  isBookingOpen: false,
  openBooking: () => {},
  closeBooking: () => {},
});

export const useChat = () => useContext(ChatContext);

// Makes the AI receptionist + booking sheet available on every page
export default function ChatProvider({ children }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingService, setBookingService] = useState(null);

  const openBooking = useCallback((service = null) => {
    setBookingService(typeof service === 'string' ? service : null);
    setIsChatOpen(false);
    setIsBookingOpen(true);
  }, []);

  const closeBooking = useCallback(() => setIsBookingOpen(false), []);

  return (
    <ChatContext.Provider
      value={{
        isChatOpen,
        openChat: () => setIsChatOpen(true),
        closeChat: () => setIsChatOpen(false),
        isBookingOpen,
        openBooking,
        closeBooking,
      }}
    >
      {children}

      {!isChatOpen && !isBookingOpen && (
        <button className="floating-book-button" onClick={() => setIsChatOpen(true)}>
          <span className="book-icon">💬</span>
          <span className="book-text">Chat with Us</span>
        </button>
      )}

      <StickyBookBar />
      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <BookingFlow open={isBookingOpen} initialService={bookingService} onClose={closeBooking} />
    </ChatContext.Provider>
  );
}
