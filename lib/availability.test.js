import { describe, it, expect } from 'vitest';
import {
  isWorkingDay,
  getNextAvailableDates,
  computeSlots,
  validateSlot,
  generateConfirmationId,
} from './availability';
import { HOURS } from './businessRules';

// Dates relative to "now" rather than hardcoded literals — the availability
// engine enforces a rolling 30-day booking window and a same-day lead time,
// so a fixed calendar date would eventually fall outside the window (or
// land on "today" and hit lead-time edge cases) depending on when the test
// suite actually runs.
function daysFromToday(n) {
  const d = new Date();
  d.setUTCHours(12, 0, 0, 0); // noon UTC dodges any local-timezone date drift
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function timeToMin(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

describe('isWorkingDay', () => {
  it('the salon is open every day of the week', () => {
    for (let n = 0; n < 7; n++) {
      expect(isWorkingDay(daysFromToday(n))).toBe(true);
    }
  });
});

describe('getNextAvailableDates', () => {
  it('returns the requested number of dates, starting today, with no gaps', () => {
    const dates = getNextAvailableDates(5);
    expect(dates).toHaveLength(5);
    expect(dates[0].date).toBe(daysFromToday(0));
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(`${dates[i - 1].date}T00:00:00Z`);
      const cur = new Date(`${dates[i].date}T00:00:00Z`);
      expect((cur - prev) / 86400000).toBe(1);
    }
  });

  it('never returns more than the advance-booking window', () => {
    const dates = getNextAvailableDates(1000);
    expect(dates.length).toBeLessThanOrEqual(HOURS.advanceBookingDays);
  });
});

describe('computeSlots', () => {
  // A few days out — safely inside the 30-day window and never "today",
  // so the same-day lead-time rule never kicks in.
  const SOON = daysFromToday(5);

  it('returns an empty array for an unknown service', () => {
    expect(computeSlots('Not A Real Service', SOON, [])).toEqual([]);
  });

  it('returns an empty array beyond the advance-booking window', () => {
    const tooFar = daysFromToday(HOURS.advanceBookingDays + 5);
    expect(computeSlots('Nail Repair', tooFar, [])).toEqual([]);
  });

  it('packs slots back-to-back with the buffer between them, never overrunning closing time', () => {
    const slots = computeSlots('Nail Repair', SOON, [], 50); // 30 min service, ask for more than fit
    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0].time).toBe(`${HOURS.openingTime}:00`);

    for (let i = 1; i < slots.length; i++) {
      const prevEnd = timeToMin(slots[i - 1].end_time);
      const curStart = timeToMin(slots[i].time);
      expect(curStart - prevEnd).toBe(HOURS.bufferMinutes);
    }

    const last = slots[slots.length - 1];
    expect(timeToMin(last.end_time)).toBeLessThanOrEqual(timeToMin(`${HOURS.closingTime}:00`));
  });

  it('excludes slots that overlap an existing confirmed appointment', () => {
    const existing = [{ appointment_time: '11:00:00', end_time: '11:30:00' }];
    const slots = computeSlots('Nail Repair', SOON, existing, 20);
    expect(slots.find((s) => s.time === '11:00:00')).toBeUndefined();
  });

  it('respects the requested count', () => {
    const slots = computeSlots('Nail Repair', SOON, [], 2);
    expect(slots.length).toBeLessThanOrEqual(2);
  });
});

describe('validateSlot', () => {
  const SOON = daysFromToday(5);

  it('rejects an invalid service', () => {
    expect(validateSlot('Nope', SOON, '12:00', []).ok).toBe(false);
  });

  it('rejects a time before opening or after closing', () => {
    expect(validateSlot('Nail Repair', SOON, '07:00', []).ok).toBe(false);
    expect(validateSlot('Nail Repair', SOON, '17:50', []).ok).toBe(false); // would end after 18:00
  });

  it('accepts a clean in-hours slot with no conflicts', () => {
    const result = validateSlot('Nail Repair', SOON, '12:00', []);
    expect(result.ok).toBe(true);
    expect(result.endTime).toBe('12:30:00');
  });

  it('rejects a slot that overlaps an existing appointment', () => {
    const existing = [{ appointment_time: '12:00:00', end_time: '12:30:00' }];
    expect(validateSlot('Nail Repair', SOON, '12:15', existing).ok).toBe(false);
  });

  it('rejects a date already in the past', () => {
    expect(validateSlot('Nail Repair', daysFromToday(-1), '12:00', []).ok).toBe(false);
  });

  it('rejects a date beyond the advance-booking window', () => {
    const tooFar = daysFromToday(HOURS.advanceBookingDays + 5);
    expect(validateSlot('Nail Repair', tooFar, '12:00', []).ok).toBe(false);
  });
});

describe('generateConfirmationId', () => {
  it('matches the NH + 6 hex chars format the API and chat parse', () => {
    for (let i = 0; i < 20; i++) {
      expect(generateConfirmationId()).toMatch(/^NH[0-9A-F]{6}$/);
    }
  });
});
