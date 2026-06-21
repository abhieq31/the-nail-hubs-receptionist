import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from './clientApi';

function mockFetchOnce(body, { ok = true, status = 200 } = {}) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => body,
  });
}

describe('api request wrapper', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('returns the parsed JSON body on success', async () => {
    mockFetchOnce({ services: [] });
    const data = await api.getServices();
    expect(data).toEqual({ services: [] });
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/services',
      expect.objectContaining({ headers: { 'Content-Type': 'application/json' } })
    );
  });

  it('sends POST bodies as JSON with the booking payload', async () => {
    mockFetchOnce({ status: 'success', appointment: { confirmation_id: 'NHABC123' } });
    await api.book({
      customer_name: 'Priya',
      customer_phone: '9876543210',
      service: 'Nail Repair',
      appointment_date: '2026-07-01',
      appointment_time: '12:00',
    });
    const [, options] = global.fetch.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toMatchObject({ customer_name: 'Priya', service: 'Nail Repair' });
  });

  it('throws an error carrying the HTTP status and server-provided detail on failure', async () => {
    mockFetchOnce({ detail: 'This time slot is no longer available' }, { ok: false, status: 409 });
    await expect(api.book({})).rejects.toMatchObject({
      status: 409,
      detail: 'This time slot is no longer available',
    });
  });

  it('falls back to a generic message when the error response has no body', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => {
        throw new Error('not json');
      },
    });
    await expect(api.getServices()).rejects.toMatchObject({ status: 503 });
  });

  it('builds query strings for GET helpers', async () => {
    mockFetchOnce({ dates: [] });
    await api.getAvailableDates(14);
    expect(global.fetch).toHaveBeenCalledWith('/api/available-dates?days=14', expect.anything());
  });

  it('uppercases nothing client-side — confirmation IDs pass through as typed', async () => {
    mockFetchOnce({ confirmation_id: 'NHABC123' });
    await api.getAppointment('NHABC123');
    expect(global.fetch).toHaveBeenCalledWith('/api/appointment/NHABC123', expect.anything());
  });
});
