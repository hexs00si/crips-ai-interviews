import { Hero } from '@/components/sections/Hero';
import { Features } from '@/components/sections/Features';

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
    </div>
  );
}