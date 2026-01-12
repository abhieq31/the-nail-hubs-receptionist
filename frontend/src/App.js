import React, { useState } from 'react';
import ChatWidget from './components/ChatWidget';
import './App.css';

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false); // Close mobile menu after navigation
    }
  };

  const openWhatsAppBooking = () => {
    window.open('https://wa.me/917698235501?text=Hello%2C%20I%20would%20like%20to%20book.%0A%0AName%3A%0ADate%3A%0ATime%3A%0AHow%20many%20people%3A', '_blank');
  };

  return (
    <div className="App">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo" onClick={() => scrollToSection('home')} style={{cursor: 'pointer'}}>
            <img src="/logo.svg" alt="The Nail Hubs" className="logo-image" />
            <span className="salon-name">The Nail Hubs</span>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>

          {/* Navigation Menu */}
          <ul className={`nav-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <li><a href="#home" onClick={() => scrollToSection('home')}>Home</a></li>
            <li><a href="#services" onClick={() => scrollToSection('services')}>Services</a></li>
            <li><a href="#gallery" onClick={() => scrollToSection('gallery')}>Gallery</a></li>
            <li><a href="#reviews" onClick={() => scrollToSection('reviews')}>Reviews</a></li>
            <li><a href="#about" onClick={() => scrollToSection('about')}>About</a></li>
            <li><a href="#contact" onClick={() => scrollToSection('contact')}>Contact</a></li>
            <li>
              <button className="nav-book-btn" onClick={openWhatsAppBooking}>
                📱 Book Now
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
            <button className="btn-primary" onClick={openWhatsAppBooking}>
              📱 Book Appointment
            </button>
            <a
              href="https://www.whatsapp.com/channel/0029Vb6wVqy7T8bahzFZwV1d"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              📢 Join WhatsApp Channel
            </a>
            <button className="btn-secondary" onClick={() => scrollToSection('services')}>
              💅 View Services
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
            <div className="service-card featured">
              <div className="popular-badge">Most Popular</div>
              <div className="service-icon">💅</div>
              <h3>Acrylic Nails</h3>
              <p className="service-duration">100–120 minutes</p>
              <p className="service-description">
                Durable acrylic extensions for strength and length with custom shapes
              </p>
              <ul className="service-features">
                <li>Custom length & shape</li>
                <li>Extra durability</li>
                <li>Perfect for special events</li>
              </ul>
            </div>

            <div className="service-card">
              <div className="service-icon">🎨</div>
              <h3>Nail Art</h3>
              <p className="service-duration">75–120 minutes</p>
              <p className="service-description">
                Creative and intricate nail art designs customized to your style
              </p>
              <ul className="service-features">
                <li>Custom designs</li>
                <li>Hand-painted artwork</li>
                <li>Trending styles</li>
              </ul>
            </div>

            <div className="service-card">
              <div className="service-icon">💎</div>
              <h3>Nail Extensions</h3>
              <p className="service-duration">90–110 minutes</p>
              <p className="service-description">
                Beautiful nail extensions that look natural and feel comfortable
              </p>
              <ul className="service-features">
                <li>Natural appearance</li>
                <li>Various lengths available</li>
                <li>Lightweight feel</li>
              </ul>
            </div>

            <div className="service-card">
              <div className="service-icon">✨</div>
              <h3>Nail Decals</h3>
              <p className="service-duration">25–35 minutes</p>
              <p className="service-description">
                Stylish nail decals for quick and easy nail decoration
              </p>
              <ul className="service-features">
                <li>Wide variety of designs</li>
                <li>Easy application</li>
                <li>Long-lasting</li>
              </ul>
            </div>

            <div className="service-card">
              <div className="service-icon">💅</div>
              <h3>Nail Polish Changes</h3>
              <p className="service-duration">25–30 minutes</p>
              <p className="service-description">
                Quick polish changes with our premium color collection
              </p>
              <ul className="service-features">
                <li>Wide color range</li>
                <li>Premium brands</li>
                <li>Perfect finish</li>
              </ul>
            </div>

            <div className="service-card">
              <div className="service-icon">🖌️</div>
              <h3>Nail Painting & Designs</h3>
              <p className="service-duration">60–90 minutes</p>
              <p className="service-description">
                Hand-painted nail designs from simple to elaborate patterns
              </p>
              <ul className="service-features">
                <li>Custom painting</li>
                <li>Artistic designs</li>
                <li>Personal consultation</li>
              </ul>
            </div>

            <div className="service-card">
              <div className="service-icon">🔧</div>
              <h3>Nail Repair</h3>
              <p className="service-duration">20–30 minutes</p>
              <p className="service-description">
                Professional repair service for damaged or broken nails
              </p>
              <ul className="service-features">
                <li>Quick fixes</li>
                <li>Seamless repair</li>
                <li>Restore natural look</li>
              </ul>
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
                  <img src="/logo.svg" alt="The Nail Hubs" className="avatar-logo" />
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
                  Latest posts from @thenailhubs
                  <span className="sparkle-icon">✨</span>
                </p>
              </div>

              {/* Instagram Feed Widget */}
              <div className="instagram-feed-wrapper">
                <iframe
                  src="https://www.instagram.com/thenailhubs/embed"
                  className="instagram-feed-iframe"
                  frameBorder="0"
                  scrolling="no"
                  allowTransparency="true"
                  title="Instagram Feed"
                  style={{
                    background: 'white',
                    maxWidth: '100%',
                    width: '100%',
                    border: 'none',
                    overflow: 'hidden',
                    minHeight: '600px',
                    borderRadius: '15px'
                  }}
                />
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

      {/* Reviews Section */}
      <section id="reviews" className="reviews-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What Our Clients Say</h2>
            <p className="section-subtitle">
              Real reviews from our valued customers
            </p>
          </div>

          <div className="reviews-content">
            {/* Google Reviews Embed */}
            <div className="google-reviews-container">
              <div className="reviews-header">
                <div className="reviews-rating">
                  <span className="star-icon">⭐⭐⭐⭐⭐</span>
                  <h3>5.0 Rating on Google</h3>
                  <p>Join hundreds of satisfied customers!</p>
                </div>
              </div>

              {/* Google Maps Reviews Embed */}
              <div className="google-maps-embed">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3720.8286419779897!2d73.04735137496908!3d21.598003580125658!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be0237ec798dc17%3A0xbe20ebcb0a43670a!2sThe%20Nail%20Hubs!5e0!3m2!1sen!2sin!4v1736709000000!5m2!1sen!2sin"
                  width="100%"
                  height="500"
                  style={{ border: 0, borderRadius: '15px' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="The Nail Hubs Google Reviews"
                ></iframe>
              </div>

              {/* Customer Testimonials */}
              <div className="testimonials-header">
                <h3>Customer Testimonials</h3>
                <p>Hear what our clients have to say about their experience</p>
              </div>

              <div className="review-cards">
                <div className="review-card">
                  <div className="review-stars">⭐⭐⭐⭐⭐</div>
                  <p className="review-text">
                    I went here for my wedding Nail art… & I noticed Cooperative nature of saloni, she explains well about shapes of nail extensions, gel polish, which colour would suit on my outfits... also her suggestions for designs and colours are up to mark… thank you for making my nails pretty 🤗♥️
                  </p>
                  <p className="review-author">- Vyoma Patel</p>
                  <p className="review-meta">Local Guide · 2 years ago</p>
                </div>

                <div className="review-card">
                  <div className="review-stars">⭐⭐⭐⭐⭐</div>
                  <p className="review-text">
                    I recently had the pleasure of getting my nails done at The Nails Hub, and I must say it was such a relaxing and enjoyable experience! I especially loved how creative and detailed the nail artist was—the design turned out even better than I imagined!
                  </p>
                  <p className="review-author">- Dhvani Shah</p>
                  <p className="review-meta">7 months ago</p>
                </div>

                <div className="review-card">
                  <div className="review-stars">⭐⭐⭐⭐⭐</div>
                  <p className="review-text">
                    Firstly I would like to say Thank you to saloni for being so polite and courteous, nail techs actually are very knowledgeable and have interest. I highly recommend this nail studio (THE NAIL HUBS).
                  </p>
                  <p className="review-author">- Gayatri Patel</p>
                  <p className="review-meta">A year ago</p>
                </div>

                <div className="review-card">
                  <div className="review-stars">⭐⭐⭐⭐⭐</div>
                  <p className="review-text">
                    It was amazing experience. I never got my nails done nd the owner was very sweet despite me fumbling. It was a really good experience overall.
                  </p>
                  <p className="review-author">- Helin Patel</p>
                  <p className="review-meta">3 months ago</p>
                </div>

                <div className="review-card">
                  <div className="review-stars">⭐⭐⭐⭐⭐</div>
                  <p className="review-text">
                    Got the beautiful nails.... So happy to choose her for permanent things.... Thank you so much the nail hubs (saloni) my first experience is good and worth visiting .. ♥️♥️♥️♥️😘
                  </p>
                  <p className="review-author">- Dolly Suthar</p>
                  <p className="review-meta">A year ago</p>
                </div>

                <div className="review-card">
                  <div className="review-stars">⭐⭐⭐⭐⭐</div>
                  <p className="review-text">
                    Must visit guys. It's a such a amazing experience ❤️❤️❤️ I am so happy with artist's work and it's is also reasonable range ❤️❤️❤️❤️
                  </p>
                  <p className="review-author">- Nidhi Patel</p>
                  <p className="review-meta">2 years ago</p>
                </div>

                <div className="review-card">
                  <div className="review-stars">⭐⭐⭐⭐⭐</div>
                  <p className="review-text">
                    Very happy with the service here! My sister got her nails done here for her birthday ceremony and she was too happy with that...... Thank you THE NAIL HUBS (saloni didi) 😍💐
                  </p>
                  <p className="review-author">- Meet Patel</p>
                  <p className="review-meta">A year ago</p>
                </div>

                <div className="review-card">
                  <div className="review-stars">⭐⭐⭐⭐⭐</div>
                  <p className="review-text">
                    She has magical hands... Got awesome nails.... Specially came from Bharuch....very happy.... ♥️♥️♥️
                  </p>
                  <p className="review-author">- Minaxi Patel</p>
                  <p className="review-meta">A year ago</p>
                </div>

                <div className="review-card">
                  <div className="review-stars">⭐⭐⭐⭐⭐</div>
                  <p className="review-text">
                    Art of nails is too much elegance and natural. Nature is too much soft and friendly.
                  </p>
                  <p className="review-author">- Misha Patel</p>
                  <p className="review-meta">10 months ago</p>
                </div>
              </div>

              {/* CTA to Leave Review */}
              <div className="review-cta">
                <h3>Love Our Service?</h3>
                <p>Share your experience with us on Google!</p>
                <a
                  href="https://www.google.com/maps/place/The+Nail+Hubs/@21.5980035,73.0473514,17z/data=!4m8!3m7!1s0x3be0237ec798dc17:0xbe20ebcb0a43670a!8m2!3d21.5980035!4d73.0473514!9m1!1b1!16s%2Fg%2F11v9_ppp79?entry=ttu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="review-btn"
                >
                  ⭐ Leave a Review
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

              {/* Women-Owned Business Badge */}
              <div className="women-owned-badge">
                <span className="badge-icon">💜</span>
                <span className="badge-text">Proudly Women-Owned Business</span>
              </div>

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
                  <li><span className="check-icon">✓</span> Women-owned and operated</li>
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
              <iframe
                src="https://www.instagram.com/p/C_Nzu25CnYd/embed"
                width="100%"
                height="600"
                frameBorder="0"
                scrolling="no"
                allowTransparency="true"
                title="Instagram Reel"
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  border: '2px solid var(--primary-gold)',
                  boxShadow: '0 10px 40px rgba(201, 169, 97, 0.2)'
                }}
              />
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
                <p><strong>Open All 7 Days</strong></p>
                <p>11:00 AM - 6:00 PM</p>
                <p>Monday - Sunday</p>
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
              <iframe
                src="https://www.instagram.com/p/C4umxKdgbNw/embed"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                allowTransparency="true"
                title="Instagram Post"
                style={{
                  background: 'white',
                  minHeight: '500px',
                  borderRadius: '15px',
                  border: '2px solid var(--primary-gold)',
                  boxShadow: '0 10px 40px rgba(201, 169, 97, 0.2)'
                }}
              />
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
                  <li><a href="#home" onClick={() => scrollToSection('home')}>🏠 Home</a></li>
                  <li><a href="#services" onClick={() => scrollToSection('services')}>💅 Services</a></li>
                  <li><a href="#gallery" onClick={() => scrollToSection('gallery')}>📸 Gallery</a></li>
                  <li><a href="#about" onClick={() => scrollToSection('about')}>ℹ️ About</a></li>
                </ul>
              </div>

              <div className="footer-column">
                <h4>Services</h4>
                <ul>
                  <li>✨ Gel Nails</li>
                  <li>💎 Acrylic Nails</li>
                  <li>🌟 Nail Extensions</li>
                  <li>👰 Bridal Nail Art</li>
                </ul>
              </div>

              <div className="footer-column">
                <h4>Contact</h4>
                <ul>
                  <li>
                    <a href="https://www.google.com/maps?q=The+Nail+Hubs,+b-292+gardencity+,gidc+ankleshwer+pin:-393001,+Ankleshwar,+Gujarat+393001&ftid=0x3be0237ec798dc17:0xbe20ebcb0a43670a" target="_blank" rel="noopener noreferrer">
                      📍 Garden City, Ankleshwar
                    </a>
                  </li>
                  <li>
                    <a href="tel:+917698235501">
                      📞 07698 235501
                    </a>
                  </li>
                  <li>🕐 Open All 7 Days</li>
                  <li>⏰ 11 AM - 6 PM</li>
                </ul>
              </div>

              <div className="footer-column">
                <h4>Follow Us</h4>
                <div className="social-links">
                  <a href="https://www.instagram.com/thenailhubs/" target="_blank" rel="noopener noreferrer" className="social-icon">
                    📸 Instagram
                  </a>
                  <a href="https://www.whatsapp.com/channel/0029Vb6wVqy7T8bahzFZwV1d" target="_blank" rel="noopener noreferrer" className="social-icon">
                    📢 WhatsApp Channel
                  </a>
                  <a href="https://wa.me/917698235501?text=Hello%2C%20I%20would%20like%20to%20book.%0A%0AName%3A%0ADate%3A%0ATime%3A%0AHow%20many%20people%3A" target="_blank" rel="noopener noreferrer" className="social-icon">
                    📱 Book on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2026 The Nail Hubs. All rights reserved.</p>
            <p>Made with 💅 in Ankleshwar</p>
          </div>
        </div>
      </footer>

      {/* Floating Chat Button */}
      {!isOpen && (
        <button className="floating-book-button" onClick={() => setIsOpen(true)}>
          <span className="book-icon">💬</span>
          <span className="book-text">Chat with Us</span>
        </button>
      )}

      {/* Chat Widget */}
      <ChatWidget isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}

export default App;
