import React from 'react';
import Link from 'next/link';
import { BUSINESS } from '@/lib/businessRules';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/logo.svg" alt="The Nail Hubs" className="footer-logo-image" />
            </div>
            <p>Ankleshwar&apos;s Premier Luxury Nail Salon</p>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Quick Links</h4>
              <ul>
                <li><Link href="/#home">🏠 Home</Link></li>
                <li><Link href="/#services">💅 Services</Link></li>
                <li><Link href="/try-on">✨ AI Try-On Studio</Link></li>
                <li><Link href="/#gallery">📸 Gallery</Link></li>
                <li><Link href="/#about">ℹ️ About</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Services</h4>
              <ul>
                <li>💅 Acrylic Nails</li>
                <li>🎨 Nail Art & Designs</li>
                <li>💎 Nail Extensions</li>
                <li>👰 Bridal Nail Art</li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Contact</h4>
              <ul>
                <li>
                  <a href={BUSINESS.mapsUrl} target="_blank" rel="noopener noreferrer">
                    📍 Garden City, Ankleshwar
                  </a>
                </li>
                <li>
                  <a href={`tel:+${BUSINESS.phoneIntl}`}>
                    📞 {BUSINESS.phone}
                  </a>
                </li>
                <li>🕐 Open All 7 Days</li>
                <li>⏰ 11 AM - 6 PM</li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Follow Us</h4>
              <div className="social-links">
                <a href={BUSINESS.instagramUrl} target="_blank" rel="noopener noreferrer" className="social-icon">
                  📸 Instagram
                </a>
                <a href={BUSINESS.whatsappChannel} target="_blank" rel="noopener noreferrer" className="social-icon">
                  📢 WhatsApp Channel
                </a>
                <a
                  href={`https://wa.me/${BUSINESS.phoneIntl}?text=Hello%2C%20I%20would%20like%20to%20book.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon"
                >
                  📱 Book on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} The Nail Hubs. All rights reserved.</p>
          <p>Made with 💅 in Ankleshwar</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
