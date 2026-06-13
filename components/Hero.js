'use client';

import React from 'react';
import Link from 'next/link';
import { BUSINESS } from '@/lib/businessRules';
import { useChat } from './ChatProvider';
import LiveAvailability from './LiveAvailability';

const WHATSAPP_BOOKING_URL = `https://wa.me/${BUSINESS.phoneIntl}?text=Hello%2C%20I%20would%20like%20to%20book.%0A%0AName%3A%0ADate%3A%0ATime%3A%0AService%3A`;

function Hero() {
  const { openBooking } = useChat();

  return (
    <section id="home" className="hero">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1 className="hero-title">
          <span className="elegant-text">Elegance</span>
          <span className="at-text">at Your</span>
          <span className="fingertips-text">Fingertips</span>
        </h1>
        <p className="hero-subtitle">
          Ankleshwar&apos;s Premier Luxury Nail Salon
        </p>
        <LiveAvailability />
        <div className="hero-buttons">
          <button className="btn-primary" onClick={() => openBooking()}>
            💅 Book in 30 Seconds — 24/7
          </button>
          <Link href="/try-on" className="btn-whatsapp">
            ✨ Try Nails On — AI Studio
          </Link>
          <a
            href={WHATSAPP_BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            📱 Book on WhatsApp
          </a>
        </div>
        <div className="hero-features">
          <div className="feature-item">
            <span className="feature-icon">💜</span>
            <span>Women-Owned Business</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💅</span>
            <span>5+ Years Experience</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">✨</span>
            <span>Premium Products</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎨</span>
            <span>Custom Artistic Designs</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
