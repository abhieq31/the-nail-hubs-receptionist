import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TryOnStudio from '@/components/TryOnStudio';
import InstaStrip from '@/components/InstaStrip';

export const metadata = {
  title: 'AI Nail Try-On Studio | The Nail Hubs',
  description:
    'Try nail colours, shapes and finishes on your own hand — live, with on-device AI. The first virtual nail try-on in Gujarat, by The Nail Hubs, Ankleshwar.',
};

export default function TryOnPage() {
  return (
    <>
      <Navbar />
      <main className="tryon-page">
        <section className="tryon-hero">
          <div className="container">
            <span className="tryon-teaser-badge">🤖 AI-Powered · Runs on your device · Free</span>
            <h1 className="section-title">Virtual Nail Try-On Studio</h1>
            <p className="section-subtitle">
              Pick a colour, shape and finish — then watch them appear on your real
              fingertips through your camera. When you love a look, book it in one tap.
            </p>
          </div>
        </section>
        <section className="tryon-section">
          <div className="container">
            <TryOnStudio />
          </div>
        </section>
        <InstaStrip
          title="Need inspiration?"
          subtitle="Looks we've actually done — recreate any of them in the studio above"
        />
      </main>
      <Footer />
    </>
  );
}
