'use client';

import React, { useState, useEffect } from 'react';
import { HOURS } from '@/lib/businessRules';
import { nowInSalonTime, timeToMinutes, formatTime12h } from '@/lib/time';
import { api } from '@/lib/clientApi';
import { useChat } from './ChatProvider';

// Honest, real-time urgency: open/closed right now (salon time) and the
// next genuinely free slot today, straight from the availability engine.
function LiveAvailability() {
  const { openBooking } = useChat();
  const [info, setInfo] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const { date, minutes } = nowInSalonTime();
    const opening = timeToMinutes(HOURS.openingTime);
    const closing = timeToMinutes(HOURS.closingTime);
    const isOpen = minutes >= opening && minutes < closing;

    (async () => {
      let nextSlot = null;
      let checked = false;
      try {
        // mid-length service as the probe for "is there room today"
        const { slots } = await api.getAvailability('Nail Art', date, 1);
        checked = true;
        if (slots && slots.length > 0) nextSlot = slots[0].formatted_time;
      } catch {
        /* booking system not configured — show open/closed only */
      }
      if (!cancelled) setInfo({ isOpen, nextSlot, checked });
    })();

    return () => { cancelled = true; };
  }, []);

  if (!info) return null;

  const statusText = info.isOpen
    ? `Open now · closes ${formatTime12h(timeToMinutes(HOURS.closingTime))}`
    : `Closed now · opens ${formatTime12h(timeToMinutes(HOURS.openingTime))}`;

  let slotText = null;
  if (info.checked) {
    slotText = info.nextSlot
      ? `Next free slot today: ${info.nextSlot}`
      : 'Today is fully booked — reserve tomorrow';
  }

  return (
    <button className="live-availability" onClick={() => openBooking()} aria-label="Book an appointment">
      <span className={`live-dot ${info.isOpen ? 'open' : 'closed'}`} />
      <span className="live-status-text">{statusText}</span>
      {slotText && (
        <>
          <span className="live-divider">·</span>
          <span className="live-slot-text">{slotText}</span>
        </>
      )}
      <span className="live-cta">Book →</span>
    </button>
  );
}

export default LiveAvailability;
