import React, { useState } from 'react';
import ChatWidget from './components/ChatWidget';
import './App.css';

function App() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="App">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <img src="/logo.svg" alt="The Nail Hubs" className="logo-image" />
          </div>
          <ul className="nav-menu">
            <li><a href="#home" onClick={() => scrollToSection('home')}>Home</a></li>
            <li><a href="#services" onClick={() => scrollToSection('services')}>Services</a></li>
            <li><a href="#gallery" onClick={() => scrollToSection('gallery')}>Gallery</a></li>
            <li><a href="#about" onClick={() => scrollToSection('about')}>About</a></li>
            <li><a href="#contact" onClick={() => scrollToSection('contact')}>Contact</a></li>
            <li>
              <button className="nav-book-btn" onClick={() => setIsOpen(true)}>
                Book Now
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="elegant-text">Elegance</span>
            <span className="at-text">at Your</span>
            <span className="fingertips-text">Fingertips</span>
          </h1>
          <p className="hero-subtitle">
            Ankleshwar's Premier Luxury Nail Salon
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => setIsOpen(true)}>
              Book Appointment
            </button>
            <button className="btn-secondary" onClick={() => scrollToSection('services')}>
              View Services
            </button>
          </div>
          <div className="hero-features">
            <div className="feature-item">
              <span className="feature-icon">✨</span>
              <span>Premium Quality</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💎</span>
              <span>Expert Artists</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎨</span>
              <span>Custom Designs</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Services</h2>
            <p className="section-subtitle">
              Professional nail care treatments designed to pamper and perfect
            </p>
          </div>

          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">💅</div>
              <h3>Gel Nails</h3>
              <p className="service-duration">60 minutes</p>
              <p className="service-description">
                Long-lasting gel polish with chip-resistant formula and high-gloss finish
              </p>
              <ul className="service-features">
                <li>Up to 3 weeks wear</li>
                <li>Quick drying</li>
                <li>Natural looking finish</li>
              </ul>
              <button className="service-book-btn" onClick={() => setIsOpen(true)}>
                Book Now
              </button>
            </div>

            <div className="service-card featured">
              <div className="popular-badge">Most Popular</div>
              <div className="service-icon">✨</div>
              <h3>Acrylic Nails</h3>
              <p className="service-duration">90 minutes</p>
              <p className="service-description">
                Durable acrylic extensions for strength and length with custom shapes
              </p>
              <ul className="service-features">
                <li>Custom length & shape</li>
                <li>Extra durability</li>
                <li>Perfect for special events</li>
              </ul>
              <button className="service-book-btn" onClick={() => setIsOpen(true)}>
                Book Now
              </button>
            </div>

            <div className="service-card">
              <div className="service-icon">💎</div>
              <h3>Nail Extensions</h3>
              <p className="service-duration">90 minutes</p>
              <p className="service-description">
                Beautiful nail extensions that look natural and feel comfortable
              </p>
              <ul className="service-features">
                <li>Natural appearance</li>
                <li>Various lengths available</li>
                <li>Lightweight feel</li>
              </ul>
              <button className="service-book-btn" onClick={() => setIsOpen(true)}>
                Book Now
              </button>
            </div>

            <div className="service-card">
              <div className="service-icon">👰</div>
              <h3>Bridal Nail Art</h3>
              <p className="service-duration">120 minutes</p>
              <p className="service-description">
                Exquisite bridal designs with intricate details for your special day
              </p>
              <ul className="service-features">
                <li>Custom bridal designs</li>
                <li>Swarovski crystals</li>
                <li>Long-lasting elegance</li>
              </ul>
              <button className="service-book-btn" onClick={() => setIsOpen(true)}>
                Book Now
              </button>
            </div>

            <div className="service-card">
              <div className="service-icon">🔄</div>
              <h3>Nail Refill</h3>
              <p className="service-duration">45 minutes</p>
              <p className="service-description">
                Maintain your beautiful nails with professional refill service
              </p>
              <ul className="service-features">
                <li>Fill grown-out areas</li>
                <li>Reshape & rebalance</li>
                <li>Quick & convenient</li>
              </ul>
              <button className="service-book-btn" onClick={() => setIsOpen(true)}>
                Book Now
              </button>
            </div>

            <div className="service-card">
              <div className="service-icon">⚡</div>
              <h3>Press-on Nails</h3>
              <p className="service-duration">30 minutes</p>
              <p className="service-description">
                Quick and easy press-on nails perfect for events and occasions
              </p>
              <ul className="service-features">
                <li>Instant glamour</li>
                <li>Reusable options</li>
                <li>No damage to natural nails</li>
              </ul>
              <button className="service-book-btn" onClick={() => setIsOpen(true)}>
                Book Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="gallery-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Work</h2>
            <p className="section-subtitle">
              A glimpse of our artistry and attention to detail
            </p>
          </div>

          <div className="instagram-showcase">
            <div className="instagram-header">
              <div className="instagram-profile">
                <div className="instagram-avatar">
                  <span className="avatar-icon">💅</span>
                </div>
                <div className="instagram-info">
                  <h3 className="instagram-username">@thenailhubs</h3>
                  <p className="instagram-tagline">Ankleshwar's Premier Luxury Nail Salon</p>
                </div>
              </div>
              <a
                href="https://www.instagram.com/thenailhubs/"
                target="_blank"
                rel="noopener noreferrer"
                className="follow-btn"
              >
                <span className="follow-icon">📸</span>
                Follow on Instagram
              </a>
            </div>

            <div className="instagram-embed-container">
              <div className="embed-notice">
                <p className="embed-text">
                  <span className="sparkle-icon">✨</span>
                  Click any card below to view our stunning nail art gallery on Instagram
                  <span className="sparkle-icon">✨</span>
                </p>
              </div>

              <div className="instagram-feed-grid">
                {[
                  { emoji: '💅', label: 'Acrylic Nails' },
                  { emoji: '✨', label: 'Gel Polish' },
                  { emoji: '💎', label: 'Nail Extensions' },
                  { emoji: '👰', label: 'Bridal Designs' },
                  { emoji: '🎨', label: 'Nail Art' },
                  { emoji: '🌟', label: 'Latest Work' }
                ].map((item, index) => (
                  <a
                    key={index}
                    href="https://www.instagram.com/thenailhubs/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="instagram-post-card"
                  >
                    <div className="post-preview">
                      <span className="preview-icon">{item.emoji}</span>
                      <p className="preview-label">{item.label}</p>
                    </div>
                    <div className="post-overlay">
                      <div className="post-content">
                        <span className="post-icon">📸</span>
                        <p className="post-cta">View on Instagram</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              <div className="instagram-features">
                <div className="feature-card">
                  <div className="feature-icon-box">💎</div>
                  <h4>Premium Designs</h4>
                  <p>Custom nail art & extensions</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon-box">🎨</div>
                  <h4>Daily Inspiration</h4>
                  <p>New posts & client features</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon-box">👑</div>
                  <h4>Exclusive Offers</h4>
                  <p>Instagram-only promotions</p>
                </div>
              </div>
            </div>

            <div className="instagram-cta">
              <div className="cta-content">
                <h3>Join Our Community</h3>
                <p>Follow us for daily nail inspiration, exclusive offers, and behind-the-scenes content</p>
                <a
                  href="https://www.instagram.com/thenailhubs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="instagram-btn"
                >
                  <span className="instagram-gradient">📸</span>
                  <span>Visit @thenailhubs on Instagram</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2 className="section-title">About The Nail Hubs</h2>
              <p className="about-description">
                Welcome to The Nail Hubs, Ankleshwar's premier destination for luxury nail care.
                We specialize in creating stunning nail art and providing top-tier nail services
                in a relaxing, elegant environment.
              </p>
              <p className="about-description">
                Our team of expert nail artists brings years of experience and a passion for
                perfection to every appointment. We use only premium, internationally-certified
                products to ensure the health and beauty of your nails.
              </p>

              <div className="about-highlights">
                <div className="highlight-item">
                  <div className="highlight-number">5+</div>
                  <div className="highlight-label">Years Experience</div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-number">1000+</div>
                  <div className="highlight-label">Happy Clients</div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-number">6</div>
                  <div className="highlight-label">Premium Services</div>
                </div>
              </div>

              <div className="why-choose">
                <h3>Why Choose Us?</h3>
                <ul className="why-list">
                  <li><span className="check-icon">✓</span> Certified nail technicians</li>
                  <li><span className="check-icon">✓</span> Premium quality products</li>
                  <li><span className="check-icon">✓</span> Hygienic and sanitized tools</li>
                  <li><span className="check-icon">✓</span> Relaxing ambiance</li>
                  <li><span className="check-icon">✓</span> Personalized service</li>
                  <li><span className="check-icon">✓</span> Competitive pricing</li>
                </ul>
              </div>
            </div>

            <div className="about-image">
              <div className="about-placeholder">
                <span className="placeholder-icon">💅</span>
                <p>Luxury Nail Care</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
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
                <p><a href="tel:+917698235501">07698 235501</a></p>
                <p>Call for inquiries</p>
              </div>

              <div className="contact-card">
                <div className="contact-icon">🕐</div>
                <h3>Hours</h3>
                <p><strong>Monday - Saturday</strong></p>
                <p>11:00 AM - 6:00 PM</p>
                <p><strong>Sunday:</strong> Closed</p>
              </div>

              <div className="contact-card">
                <div className="contact-icon">💬</div>
                <h3>Book Online</h3>
                <p>24/7 AI Receptionist</p>
                <button className="contact-book-btn" onClick={() => setIsOpen(true)}>
                  Chat with Us
                </button>
              </div>
            </div>

            <div className="map-container">
              <div className="map-placeholder">
                <span className="map-icon">🗺️</span>
                <p>Garden City, Ankleshwar</p>
                <a
                  href="https://maps.google.com/?q=B-292,Garden+City,Ankleshwar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="directions-btn"
                >
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">
                <img src="/logo.svg" alt="The Nail Hubs" className="footer-logo-image" />
              </div>
              <p>Ankleshwar's Premier Luxury Nail Salon</p>
            </div>

            <div className="footer-links">
              <div className="footer-column">
                <h4>Quick Links</h4>
                <ul>
                  <li><a href="#home" onClick={() => scrollToSection('home')}>Home</a></li>
                  <li><a href="#services" onClick={() => scrollToSection('services')}>Services</a></li>
                  <li><a href="#gallery" onClick={() => scrollToSection('gallery')}>Gallery</a></li>
                  <li><a href="#about" onClick={() => scrollToSection('about')}>About</a></li>
                </ul>
              </div>

              <div className="footer-column">
                <h4>Services</h4>
                <ul>
                  <li>Gel Nails</li>
                  <li>Acrylic Nails</li>
                  <li>Nail Extensions</li>
                  <li>Bridal Nail Art</li>
                </ul>
              </div>

              <div className="footer-column">
                <h4>Contact</h4>
                <ul>
                  <li>📍 Garden City, Ankleshwar</li>
                  <li>📞 07698 235501</li>
                  <li>🕐 Mon-Sat: 11 AM - 6 PM</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2026 The Nail Hubs. All rights reserved.</p>
            <p>Made with 💅 in Ankleshwar</p>
          </div>
        </div>
      </footer>

      {/* Floating Book Button */}
      {!isOpen && (
        <button className="floating-book-button" onClick={() => setIsOpen(true)}>
          <span className="book-icon">💅</span>
          <span className="book-text">Book Appointment</span>
        </button>
      )}

      {/* Chat Widget */}
      <ChatWidget isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}

export default App;
