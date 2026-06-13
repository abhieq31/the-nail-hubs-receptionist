'use client';

import React from 'react';
import { BUSINESS } from '@/lib/businessRules';
import { useChat } from './ChatProvider';

function Contact() {
  const { openChat, openBooking } = useChat();

  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Visit Us</h2>
          <p className="section-subtitle">
            Book your appointment today and experience luxury nail care
          </p>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <div className="contact-card">
              <div className="contact-icon">📍</div>
              <h3>Location</h3>
              <p>B-292, Garden City</p>
              <p>Ankleshwar – 393001</p>
              <p>Gujarat, India</p>
            </div>

            <div className="contact-card">
              <div className="contact-icon">📞</div>
              <h3>Phone</h3>
              <p><a href={`tel:+${BUSINESS.phoneIntl}`}>{BUSINESS.phone}</a></p>
              <p>Call for inquiries</p>
            </div>

            <div className="contact-card">
              <div className="contact-icon">🕐</div>
              <h3>Hours</h3>
              <p><strong>Open All 7 Days</strong></p>
              <p>11:00 AM - 6:00 PM</p>
              <p>Monday - Sunday</p>
            </div>

            <div className="contact-card">
              <div className="contact-icon">💬</div>
              <h3>Book Online</h3>
              <p>Live slots, 24/7 — done in 30 seconds</p>
              <button className="contact-book-btn" onClick={() => openBooking()}>
                Book Now
              </button>
              <button className="contact-book-btn" onClick={openChat} style={{ marginTop: 8 }}>
                Chat with Us
              </button>
            </div>
          </div>

          <div className="map-container">
            <iframe
              src="https://www.instagram.com/p/C4umxKdgbNw/embed"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              loading="lazy"
              title="Instagram Post"
              style={{
                background: 'white',
                minHeight: '500px',
                borderRadius: '15px',
                border: '2px solid var(--primary-gold)',
                boxShadow: '0 10px 40px rgba(201, 169, 97, 0.2)',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
