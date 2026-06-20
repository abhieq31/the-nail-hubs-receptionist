import { ImageResponse } from 'next/og';

// The share card people see when the site is sent on WhatsApp / Instagram —
// the salon's #1 channels. Generated on the fly, no design tools needed.
// No dynamic params here, so this prerenders to a static file at build time
// (the edge runtime would force it to regenerate on every request instead).

export const alt = 'The Nail Hubs — Ankleshwar’s Premier Luxury Nail Salon';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 55%, #2a2113 100%)',
          color: '#C9A961',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: 90,
            height: 4,
            background: '#C9A961',
            borderRadius: 2,
            marginBottom: 36,
          }}
        />
        <div
          style={{
            display: 'flex',
            fontSize: 84,
            fontWeight: 700,
            letterSpacing: 2,
            color: '#C9A961',
          }}
        >
          The Nail Hubs
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 34,
            marginTop: 14,
            color: '#e8e8e8',
            letterSpacing: 6,
            textTransform: 'uppercase',
          }}
        >
          A Touch of Elegance
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 44,
            padding: '14px 38px',
            borderRadius: 999,
            border: '2px solid #C9A961',
            fontSize: 28,
            color: '#C9A961',
          }}
        >
          Book 24/7 · AI Nail Try-On · Ankleshwar
        </div>
      </div>
    ),
    size
  );
}
