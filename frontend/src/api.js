// Thin client for The Nail Hubs booking API.
// Every helper throws on network/HTTP errors so callers can fall back
// (e.g. the chat widget offers WhatsApp booking when the API is down).

export const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.detail || `Request failed (${response.status})`);
    error.status = response.status;
    error.detail = data.detail;
    throw error;
  }

  return data;
}

export const api = {
  getServices: () => request('/services'),
  getAvailableDates: (days = 7) => request(`/available-dates?days=${days}`),
  getAvailability: (service, date, count = 6) =>
    request('/availability', {
      method: 'POST',
      body: JSON.stringify({ service, date, count }),
    }),
  book: (booking) =>
    request('/book', { method: 'POST', body: JSON.stringify(booking) }),
  reschedule: (confirmationId, newDate, newTime) =>
    request('/reschedule', {
      method: 'POST',
      body: JSON.stringify({ confirmation_id: confirmationId, new_date: newDate, new_time: newTime }),
    }),
  cancel: (confirmationId) =>
    request('/cancel', {
      method: 'POST',
      body: JSON.stringify({ confirmation_id: confirmationId }),
    }),
  getAppointment: (confirmationId) => request(`/appointment/${confirmationId}`),
  getInstagramFeed: (limit = 12) => request(`/instagram/feed?limit=${limit}`),
  getInstagramStories: () => request('/instagram/stories'),
  getGoogleReviews: () => request('/google/reviews'),
};
