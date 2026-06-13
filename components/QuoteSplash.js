'use client';

import React, { useState, useEffect } from 'react';

// A different encouraging quote welcomes the visitor on every page
// load/refresh — a 2.5-second branded moment, tap anywhere to skip.
const QUOTES = [
  'Great nails don’t happen by chance — they happen by appointment.',
  'Confidence begins at your fingertips.',
  'Self-care isn’t selfish — it’s scheduled.',
  'Life is too short for boring nails.',
  'Elegance is an attitude. Wear it on every fingertip.',
  'Your hands tell your story — make it a beautiful one.',
  'One tap. One look. Endless compliments.',
  'You deserve a little luxury today — your slot is waiting.',
  'Try your dream nails on with AI, then make them real.',
  'Polished nails, powerful you.',
  'Today’s agenda: sparkle, shine, repeat.',
  'Beauty begins the moment you decide to book yourself in.',
  'Treat yourself like the masterpiece you are.',
  'Your dream look is 60 seconds away — try it on, then book it.',
];

function QuoteSplash() {
  const [quote, setQuote] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    const leaveTimer = setTimeout(() => setLeaving(true), 2400);
    const goneTimer = setTimeout(() => setGone(true), 3100);
    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(goneTimer);
    };
  }, []);

  if (!quote || gone) return null;

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => setGone(true), 450);
  };

  return (
    <div
      className={`quote-splash ${leaving ? 'leaving' : ''}`}
      onClick={dismiss}
      role="status"
      aria-live="polite"
    >
      <div className="quote-splash-inner">
        <span className="quote-splash-mark">💅</span>
        <p className="quote-splash-text">&ldquo;{quote}&rdquo;</p>
        <span className="quote-splash-brand">The Nail Hubs · A Touch Of Elegance</span>
      </div>
    </div>
  );
}

export default QuoteSplash;
