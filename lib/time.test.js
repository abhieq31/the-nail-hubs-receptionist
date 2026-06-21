import { describe, it, expect } from 'vitest';
import {
  timeToMinutes,
  minutesToTime,
  formatTime12h,
  dateFromISO,
  formatDateLong,
  dayName,
  addDays,
  weekday,
} from './time';

describe('timeToMinutes', () => {
  it('parses HH:MM', () => {
    expect(timeToMinutes('00:00')).toBe(0);
    expect(timeToMinutes('11:00')).toBe(660);
    expect(timeToMinutes('18:00')).toBe(1080);
  });

  it('parses HH:MM:SS, ignoring seconds', () => {
    expect(timeToMinutes('13:45:30')).toBe(13 * 60 + 45);
  });
});

describe('minutesToTime', () => {
  it('pads hours and minutes and appends :00 seconds', () => {
    expect(minutesToTime(0)).toBe('00:00:00');
    expect(minutesToTime(660)).toBe('11:00:00');
    expect(minutesToTime(65)).toBe('01:05:00');
  });

  it('round-trips with timeToMinutes', () => {
    for (const mins of [0, 5, 60, 599, 1080, 1439]) {
      expect(timeToMinutes(minutesToTime(mins))).toBe(mins);
    }
  });
});

describe('formatTime12h', () => {
  it('formats midnight and noon correctly', () => {
    expect(formatTime12h(0)).toBe('12:00 AM');
    expect(formatTime12h(720)).toBe('12:00 PM');
  });

  it('formats morning and afternoon times', () => {
    expect(formatTime12h(660)).toBe('11:00 AM'); // opening time
    expect(formatTime12h(1080)).toBe('6:00 PM'); // closing time
    expect(formatTime12h(13 * 60 + 5)).toBe('1:05 PM');
  });
});

describe('date helpers (anchored at UTC noon to dodge timezone drift)', () => {
  it('dateFromISO produces the same calendar day regardless of host timezone', () => {
    const d = dateFromISO('2026-03-05');
    expect(d.getUTCFullYear()).toBe(2026);
    expect(d.getUTCMonth()).toBe(2); // 0-indexed: March
    expect(d.getUTCDate()).toBe(5);
  });

  it('formatDateLong renders a human-readable date (en-IN day-before-month order)', () => {
    expect(formatDateLong('2026-03-05')).toBe('Thursday, 5 March');
  });

  it('dayName returns the weekday name', () => {
    expect(dayName('2026-03-05')).toBe('Thursday');
  });

  it('addDays advances the calendar date, including across month/year boundaries', () => {
    expect(addDays('2026-06-20', 1)).toBe('2026-06-21');
    expect(addDays('2026-06-30', 1)).toBe('2026-07-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('weekday maps to JS getDay() convention (0=Sunday)', () => {
    expect(weekday('2026-03-01')).toBe(0); // Sunday
    expect(weekday('2026-03-05')).toBe(4); // Thursday
  });
});
