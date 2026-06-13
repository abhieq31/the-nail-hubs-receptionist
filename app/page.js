import { BUSINESS, HOURS, SERVICES } from '@/lib/businessRules';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import InstaStrip from '@/components/InstaStrip';
import TryOnTeaser from '@/components/TryOnTeaser';
import Services from '@/components/Services';
import Gallery from '@/components/Gallery';
import Reviews from '@/components/Reviews';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thenailhubs.vercel.app';

// Local-SEO structured data: lets Google show the salon with hours,
// location, services and booking link directly in search results.
const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'NailSalon',
  name: BUSINESS.name,
  description:
    "Ankleshwar's premier luxury nail salon — acrylics, extensions, nail art and bridal designs. Book 24/7 online or try nails on with AI.",
  url: SITE_URL,
  telephone: `+${BUSINESS.phoneIntl}`,
  image: `${SITE_URL}/logo.jpg`,
  priceRange: '₹₹',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'B-292, Garden City, GIDC',
    addressLocality: 'Ankleshwar',
    addressRegion: 'Gujarat',
    postalCode: '393001',
    addressCountry: 'IN',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 21.5980035, longitude: 73.0473514 },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: HOURS.openingTime,
      closes: HOURS.closingTime,
    },
  ],
  sameAs: [BUSINESS.instagramUrl],
  makesOffer: Object.keys(SERVICES).map((name) => ({
    '@type': 'Offer',
    itemOffered: { '@type': 'Service', name },
  })),
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <Navbar />
      <main>
        <Hero />
        <InstaStrip
          title="Fresh from our Instagram"
          subtitle="Real nails, real clients — straight from @thenailhubs"
        />
        <TryOnTeaser />
        <Services />
        <Gallery />
        <Reviews />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
