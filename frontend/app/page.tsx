import { CtaSection } from '@/components/landing/cta-section'
import { FeaturedScholarships } from '@/components/landing/featured-scholarships'
import { FeaturesSection } from '@/components/landing/features-section'
import { HeroSection } from '@/components/landing/hero-section'
import './landing.css'

export default function HomePage() {
  return (
    <main className="page landing">
      <HeroSection />
      <FeaturedScholarships />
      <FeaturesSection />
      <CtaSection />
    </main>
  )
}
