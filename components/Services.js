'use client';

import React from 'react';
import { SERVICES } from '@/lib/businessRules';
import { useChat } from './ChatProvider';

const SERVICE_COPY = {
  'Acrylic Nails': {
    description: 'Durable acrylic extensions for strength and length with custom shapes',
    features: ['Custom length & shape', 'Extra durability', 'Perfect for special events'],
  },
  'Nail Art': {
    description: 'Creative and intricate nail art designs customized to your style',
    features: ['Custom designs', 'Hand-painted artwork', 'Trending styles'],
  },
  'Nail Extensions': {
    description: 'Beautiful nail extensions that look natural and feel comfortable',
    features: ['Natural appearance', 'Various lengths available', 'Lightweight feel'],
  },
  'Nail Decals': {
    description: 'Stylish nail decals for quick and easy nail decoration',
    features: ['Wide variety of designs', 'Easy application', 'Long-lasting'],
  },
  'Nail Polish Changes': {
    description: 'Quick polish changes with our premium color collection',
    features: ['Wide color range', 'Premium brands', 'Perfect finish'],
  },
  'Nail Painting & Designs': {
    description: 'Hand-painted nail designs from simple to elaborate patterns',
    features: ['Custom painting', 'Artistic designs', 'Personal consultation'],
  },
  'Nail Repair': {
    description: 'Professional repair service for damaged or broken nails',
    features: ['Quick fixes', 'Seamless repair', 'Restore natural look'],
  },
};

function Services() {
  const { openBooking } = useChat();

  return (
    <section id="services" className="services-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">
            Professional nail care treatments designed to pamper and perfect
          </p>
        </div>

        <div className="services-grid">
          {Object.entries(SERVICES).map(([name, svc]) => (
            <div className={`service-card ${svc.popular ? 'featured' : ''}`} key={name}>
              {svc.popular && <div className="popular-badge">Most Popular</div>}
              <div className="service-icon">{svc.icon}</div>
              <h3>{name}</h3>
              <p className="service-duration">{svc.displayDuration}</p>
              <p className="service-description">{SERVICE_COPY[name]?.description}</p>
              <ul className="service-features">
                {(SERVICE_COPY[name]?.features || []).map((f) => <li key={f}>{f}</li>)}
              </ul>
              <button className="service-book-btn" onClick={() => openBooking(name)}>
                Book {svc.icon} →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
