'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BUSINESS, SERVICES } from '@/lib/businessRules';
import { getNextAvailableDates } from '@/lib/availability';
import { timeToMinutes } from '@/lib/time';
import { api } from '@/lib/clientApi';

// ── Minimal 3-step booking sheet ────────────────────────────────────
// Service → Date & time → Your details → Confirmed.
// Real availability from the booking engine; if the database isn't
// configured (or a request fails) the same picks hand off to WhatsApp
// with a pre-written message, so a visitor can ALWAYS finish a booking.

const STEPS = ['Service', 'Time', 'Details'];

function shortDateParts(iso) {
  const d = new Date(`${iso}T12:00:00Z`);
  return {
    weekday: new Intl.DateTimeFormat('en-IN', { weekday: 'short', timeZone: 'UTC' }).format(d),
    day: d.getUTCDate(),
    month: new Intl.DateTimeFormat('en-IN', { month: 'short', timeZone: 'UTC' }).format(d),
  };
}

function groupSlots(slots) {
  const groups = [
    { label: '🌤 Morning', items: [] },
    { label: '☀️ Afternoon', items: [] },
    { label: '🌆 Evening', items: [] },
  ];
  for (const slot of slots) {
    const mins = timeToMinutes(slot.time);
    if (mins < 12 * 60) groups[0].items.push(slot);
    else if (mins < 16 * 60) groups[1].items.push(slot);
    else groups[2].items.push(slot);
  }
  return groups.filter((g) => g.items.length > 0);
}

function googleCalendarUrl({ service, date, time, endTime }) {
  const compact = (iso, t) => `${iso.replace(/-/g, '')}T${t.replace(/:/g, '')}`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${service} @ ${BUSINESS.name} 💅`,
    dates: `${compact(date, time)}/${compact(date, endTime)}`,
    details: `Appointment at ${BUSINESS.name}. Questions? WhatsApp ${BUSINESS.phone}.`,
    location: BUSINESS.address,
    ctz: BUSINESS.timezone,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function BookingFlow({ open, initialService, onClose }) {
  const [step, setStep] = useState(0);
  const [service, setService] = useState(null);
  const [date, setDate] = useState(null);
  const [slot, setSlot] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [slots, setSlots] = useState(null); // null = loading
  const [slotsError, setSlotsError] = useState('');
  const [offline, setOffline] = useState(false); // booking engine unreachable → WhatsApp mode
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirmed, setConfirmed] = useState(null);

  const dates = useMemo(() => getNextAvailableDates(8), [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // preselect a service when opened from a service card
  useEffect(() => {
    if (open && initialService && SERVICES[initialService]) {
      setService(initialService);
      setStep((s) => (s === 0 ? 1 : s));
    }
  }, [open, initialService]);

  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  // fetch real availability whenever service + date are picked
  useEffect(() => {
    if (!open || !service || !date) return undefined;
    let active = true;
    setSlots(null);
    setSlot(null);
    setSlotsError('');
    api
      .getAvailability(service, date, 12)
      .then((data) => {
        if (!active) return;
        setSlots(data.slots || []);
        setOffline(false);
      })
      .catch((e) => {
        if (!active) return;
        if (e.status === 503) {
          setOffline(true);
          setSlots([]);
        } else {
          setSlots([]);
          setSlotsError('Could not load times — please try another date or book on WhatsApp.');
        }
      });
    return () => {
      active = false;
    };
  }, [open, service, date]);

  const reset = useCallback(() => {
    setStep(0);
    setService(null);
    setDate(null);
    setSlot(null);
    setName('');
    setPhone('');
    setSlots(null);
    setSlotsError('');
    setSubmitError('');
    setConfirmed(null);
  }, []);

  const close = useCallback(() => {
    onClose();
    if (confirmed) reset(); // keep progress on accidental close, clear after success
  }, [onClose, confirmed, reset]);

  const whatsappHandoff = () => {
    const lines = [
      'Hello! 👋 I would like to book an appointment 💅',
      '',
      service ? `✨ Service: ${service}` : null,
      date ? `📅 Date: ${shortDateParts(date).weekday} ${shortDateParts(date).day} ${shortDateParts(date).month}` : null,
      slot ? `⏰ Time: ${slot.formatted_time}` : null,
      name ? `🙋 Name: ${name}` : null,
    ].filter((l) => l !== null);
    const text = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/${BUSINESS.phoneIntl}?text=${text}`, '_blank');
  };

  const submit = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (name.trim().length < 2) {
      setSubmitError('Please tell us your name 🙂');
      return;
    }
    if (cleanPhone.length !== 10) {
      setSubmitError('Phone number should be exactly 10 digits');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await api.book({
        customer_name: name.trim(),
        customer_phone: cleanPhone,
        service,
        appointment_date: date,
        appointment_time: slot.time,
      });
      setConfirmed(res.appointment);
    } catch (err) {
      if (err.status === 503) {
        setOffline(true);
        whatsappHandoff();
      } else if (err.status === 409) {
        setSubmitError(`${err.detail || 'That slot was just taken'} — please pick another time.`);
        setStep(1);
        setSlot(null);
        // refresh slots
        setSlots(null);
        api
          .getAvailability(service, date, 12)
          .then((data) => setSlots(data.slots || []))
          .catch(() => setSlots([]));
      } else {
        setSubmitError(err.detail || err.message || 'Something went wrong — please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const svcInfo = service ? SERVICES[service] : null;
  const dateInfo = date ? shortDateParts(date) : null;
  const today = dates[0]?.date;

  const crumbs = [
    service && { label: `${svcInfo.icon} ${service}`, step: 0 },
    dateInfo && { label: `${dateInfo.weekday} ${dateInfo.day} ${dateInfo.month}`, step: 1 },
    slot && { label: slot.formatted_time, step: 1 },
  ].filter(Boolean);

  return (
    <div className="bk-overlay" onClick={close} role="dialog" aria-modal="true" aria-label="Book an appointment">
      <div className="bk-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="bk-handle" aria-hidden="true" />

        {!confirmed && (
          <header className="bk-header">
            <div>
              <h3 className="bk-title">Book your appointment</h3>
              <div className="bk-steps" aria-label={`Step ${step + 1} of 3`}>
                {STEPS.map((label, i) => (
                  <span key={label} className={`bk-step-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                    {i < step ? '✓' : i + 1}
                    <em>{label}</em>
                  </span>
                ))}
              </div>
            </div>
            <button className="bk-close" onClick={close} aria-label="Close booking">✕</button>
          </header>
        )}

        {!confirmed && crumbs.length > 0 && (
          <div className="bk-crumbs">
            {crumbs.map((c) => (
              <button key={c.label} className="bk-crumb" onClick={() => setStep(c.step)}>
                {c.label}
              </button>
            ))}
          </div>
        )}

        <div className="bk-body">
          {/* ── Step 1: service ── */}
          {!confirmed && step === 0 && (
            <div className="bk-services">
              {Object.entries(SERVICES).map(([svcName, svc]) => (
                <button
                  key={svcName}
                  className={`bk-service ${service === svcName ? 'active' : ''}`}
                  onClick={() => {
                    setService(svcName);
                    setStep(1);
                  }}
                >
                  <span className="bk-service-icon">{svc.icon}</span>
                  <span className="bk-service-name">
                    {svcName}
                    {svc.popular && <em className="bk-popular">Popular</em>}
                  </span>
                  <span className="bk-service-duration">{svc.displayDuration}</span>
                  <span className="bk-service-arrow">→</span>
                </button>
              ))}
            </div>
          )}

          {/* ── Step 2: date & time ── */}
          {!confirmed && step === 1 && (
            <div className="bk-when">
              <div className="bk-dates" role="listbox" aria-label="Choose a date">
                {dates.map((d) => {
                  const p = shortDateParts(d.date);
                  return (
                    <button
                      key={d.date}
                      className={`bk-date ${date === d.date ? 'active' : ''}`}
                      onClick={() => setDate(d.date)}
                    >
                      <span className="bk-date-weekday">
                        {d.date === today ? 'Today' : p.weekday}
                      </span>
                      <span className="bk-date-day">{p.day}</span>
                      <span className="bk-date-month">{p.month}</span>
                    </button>
                  );
                })}
              </div>

              {!date && <p className="bk-hint">Pick a day to see free times ☝️</p>}

              {date && slots === null && (
                <div className="bk-slots-loading">
                  <span className="bk-spinner" /> Checking live availability…
                </div>
              )}

              {date && slots !== null && offline && (
                <div className="bk-offline">
                  <p>Online booking opens soon — finish this booking in one tap on WhatsApp, with your picks pre-filled. 💬</p>
                  <button className="bk-primary whatsapp" onClick={whatsappHandoff}>
                    📱 Continue on WhatsApp
                  </button>
                </div>
              )}

              {date && slots !== null && !offline && slotsError && (
                <div className="bk-offline">
                  <p role="alert">{slotsError}</p>
                  <button className="bk-primary whatsapp" onClick={whatsappHandoff}>
                    📱 Book on WhatsApp instead
                  </button>
                </div>
              )}

              {date && slots !== null && !offline && !slotsError && slots.length === 0 && (
                <p className="bk-hint">That day is fully booked 😔 — try the next one!</p>
              )}

              {date && slots !== null && !offline && slots.length > 0 && (
                <>
                  {groupSlots(slots).map((group) => (
                    <div key={group.label} className="bk-slot-group">
                      <h4>{group.label}</h4>
                      <div className="bk-slots">
                        {group.items.map((s) => (
                          <button
                            key={s.time}
                            className={`bk-slot ${slot?.time === s.time ? 'active' : ''}`}
                            onClick={() => {
                              setSlot(s);
                              setStep(2);
                            }}
                          >
                            {s.formatted_time}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <p className="bk-live-note">● Live availability — what you see is genuinely free</p>
                </>
              )}
            </div>
          )}

          {/* ── Step 3: details ── */}
          {!confirmed && step === 2 && (
            <form className="bk-details" onSubmit={submit}>
              <div className="bk-summary-card">
                <span className="bk-summary-icon">{svcInfo?.icon}</span>
                <div>
                  <strong>{service}</strong>
                  <p>
                    {dateInfo && `${dateInfo.weekday} ${dateInfo.day} ${dateInfo.month}`} · {slot?.formatted_time} ·{' '}
                    {svcInfo?.displayDuration}
                  </p>
                </div>
              </div>

              <label className="bk-field">
                <span>Your name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Shah"
                  autoComplete="name"
                  maxLength={50}
                  required
                />
              </label>

              <label className="bk-field">
                <span>Phone (10 digits)</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\d\s+-]/g, ''))}
                  placeholder="98765 43210"
                  autoComplete="tel"
                  required
                />
              </label>

              {submitError && <p className="bk-error" role="alert">{submitError}</p>}

              <button type="submit" className="bk-primary" disabled={submitting}>
                {submitting ? 'Reserving your slot…' : '✨ Confirm my appointment'}
              </button>
              <p className="bk-fine">Free to book · No advance payment · We'll see you there 💛</p>
            </form>
          )}

          {/* ── Success ── */}
          {confirmed && (
            <div className="bk-success">
              <div className="bk-success-burst" aria-hidden="true">🎉</div>
              <h3>You're booked, {confirmed.customer_name.split(' ')[0]}!</h3>
              <div className="bk-summary-card success">
                <span className="bk-summary-icon">{svcInfo?.icon}</span>
                <div>
                  <strong>{confirmed.service}</strong>
                  <p>
                    {dateInfo && `${dateInfo.weekday} ${dateInfo.day} ${dateInfo.month}`} · {slot?.formatted_time}
                  </p>
                </div>
              </div>
              <p className="bk-conf-id">
                Confirmation ID: <strong>{confirmed.confirmation_id}</strong>
              </p>
              <div className="bk-success-actions">
                <a
                  className="bk-primary calendar"
                  href={googleCalendarUrl({
                    service: confirmed.service,
                    date: confirmed.appointment_date,
                    time: confirmed.appointment_time.slice(0, 5),
                    endTime: confirmed.end_time.slice(0, 5),
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📅 Add to calendar
                </a>
                <button
                  className="bk-primary whatsapp"
                  onClick={() => {
                    const text = encodeURIComponent(
                      `Hi! I just booked online 💅\nConfirmation: ${confirmed.confirmation_id}\n${confirmed.service} on ${confirmed.appointment_date} at ${slot?.formatted_time}`
                    );
                    window.open(`https://wa.me/${BUSINESS.phoneIntl}?text=${text}`, '_blank');
                  }}
                >
                  📱 Say hi on WhatsApp
                </button>
                <button className="bk-secondary" onClick={close}>
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingFlow;
