import { Playfair_Display, Poppins } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import ChatProvider from '@/components/ChatProvider';
import ScrollReveal from '@/components/ScrollReveal';
import QuoteSplash from '@/components/QuoteSplash';
import '@/styles/globals.css';
import '@/styles/chat.css';
import '@/styles/feeds.css';
import '@/styles/tryon.css';
import '@/styles/experience.css';

// Luxury typography, self-hosted by next/font (zero external requests)
const heading = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
});

const body = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thenailhubs.vercel.app';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
  keywords: [
    'nail salon Ankleshwar', 'nail art Ankleshwar', 'acrylic nails Gujarat',
    'nail extensions Ankleshwar', 'bridal nail art', 'The Nail Hubs',
    'nail salon near me', 'virtual nail try on',
  ],
  title: 'The Nail Hubs - A Touch Of Elegance',
  description:
    "The Nail Hubs - Ankleshwar's Premier Luxury Nail Salon. Book your appointment 24/7, try nails on with AI, and explore acrylics, extensions, nail art and bridal designs.",
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/logo.jpg',
  },
  openGraph: {
    title: 'The Nail Hubs - A Touch Of Elegance',
    description:
      "Ankleshwar's premier luxury nail salon. Book instantly 24/7 with our AI receptionist, or try your dream nails on with the AI studio.",
    images: ['/logo.jpg'],
  },
};

export const viewport = {
  themeColor: '#C9A961',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <head>
        <link rel="preconnect" href="https://www.instagram.com" />
        <link rel="preconnect" href="https://www.google.com" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://storage.googleapis.com" />
      </head>
      <body>
        <QuoteSplash />
        <ScrollReveal />
        <div className="App">
          <ChatProvider>{children}</ChatProvider>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
