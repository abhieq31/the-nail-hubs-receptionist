import { describe, it, expect } from 'vitest';
import { BUSINESS, HOURS, SERVICES } from './businessRules';
import { timeToMinutes } from './time';

describe('BUSINESS', () => {
  it('phoneIntl is the phone number without the leading 0, prefixed with the country code', () => {
    const localDigits = BUSINESS.phone.replace(/\D/g, '');
    expect(BUSINESS.phoneIntl).toBe(`91${localDigits.replace(/^0/, '')}`);
  });
});

describe('HOURS', () => {
  it('opening time is strictly before closing time', () => {
    expect(HOURS.openingTime < HOURS.closingTime).toBe(true);
  });

  it('open all 7 days, as advertised on the site', () => {
    expect(HOURS.workingDays).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
});

describe('SERVICES', () => {
  it('every service has a positive duration and the metadata the UI/chat/API depend on', () => {
    for (const [name, svc] of Object.entries(SERVICES)) {
      expect(svc.duration, `${name}.duration`).toBeGreaterThan(0);
      expect(typeof svc.displayDuration, `${name}.displayDuration`).toBe('string');
      expect(typeof svc.icon, `${name}.icon`).toBe('string');
      expect(typeof svc.popular, `${name}.popular`).toBe('boolean');
    }
  });

  it('no service is longer than a working day', () => {
    const openMinutes = timeToMinutes(HOURS.closingTime) - timeToMinutes(HOURS.openingTime);
    for (const svc of Object.values(SERVICES)) {
      expect(svc.duration).toBeLessThanOrEqual(openMinutes);
    }
  });

  it('exactly one service is flagged popular (drives the chat/booking "Most Popular" badge)', () => {
    const popularCount = Object.values(SERVICES).filter((s) => s.popular).length;
    expect(popularCount).toBe(1);
  });
});
