'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useChat } from './ChatProvider';

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { openBooking } = useChat();
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="logo" onClick={closeMenu}>
          <img src="/logo.svg" alt="The Nail Hubs" className="logo-image" />
          <span className="salon-name">The Nail Hubs</span>
        </Link>

        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        <ul className={`nav-menu ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <li><a href="/#home" onClick={closeMenu}>Home</a></li>
          <li><a href="/#services" onClick={closeMenu}>Services</a></li>
          <li><Link href="/try-on" className="nav-tryon-link" onClick={closeMenu}>✨ AI Try-On</Link></li>
          <li><a href="/#gallery" onClick={closeMenu}>Gallery</a></li>
          <li><a href="/#reviews" onClick={closeMenu}>Reviews</a></li>
          <li><a href="/#about" onClick={closeMenu}>About</a></li>
          <li><a href="/#contact" onClick={closeMenu}>Contact</a></li>
          <li>
            <button className="nav-book-btn" onClick={() => { openBooking(); closeMenu(); }}>
              💅 Book Now
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
