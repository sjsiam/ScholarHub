import Image from 'next/image'
import { formatUsd } from '@/lib/format'
import { MOCK_SCHOLARSHIPS } from '@/lib/mock/scholarships'
import { HeroSearch } from './hero-search'

const totalFunding = MOCK_SCHOLARSHIPS.reduce((sum, s) => sum + s.amountUsd, 0)
const countryCount = new Set(MOCK_SCHOLARSHIPS.map((s) => s.country)).size

const STATS = [
  { value: String(MOCK_SCHOLARSHIPS.length), label: 'Curated scholarships' },
  { value: String(countryCount), label: 'Host countries' },
  { value: formatUsd(totalFunding, true), label: 'Annual funding listed' },
]

export function HeroSection() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <span className="hero-pill md-typescale-label-large">
          <md-icon aria-hidden="true">auto_awesome</md-icon>
          {'2027 intake applications are open'}
        </span>
        <h1 id="hero-title" className="md-typescale-display-medium hero-title">
          Find Scholarships That Fit Your Future
        </h1>
        <p className="md-typescale-body-large muted hero-lede">
          ScholarHub brings fully funded and partial scholarships from leading governments,
          universities and foundations into one place, matched to your degree, field and
          destination.
        </p>
        <HeroSearch />
        <dl className="hero-stats">
          {STATS.map((s) => (
            <div key={s.label} className="hero-stat">
              <dt className="md-typescale-body-medium muted">{s.label}</dt>
              <dd className="md-typescale-headline-medium">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="hero-visual">
        <Image
          src="/images/hero-students.png"
          alt="Illustration of international students walking together across a university campus"
          width={1024}
          height={1024}
          priority
          sizes="(min-width: 840px) 45vw, 100vw"
        />
        <div className="hero-float hero-float-top">
          <span className="hero-float-icon" aria-hidden="true">
            <md-icon>verified</md-icon>
          </span>
          <div>
            <p className="md-typescale-label-large">Chevening Scholarship</p>
            <p className="md-typescale-body-small muted">98% profile match</p>
          </div>
        </div>
        <div className="hero-float hero-float-bottom">
          <span className="hero-float-icon tertiary" aria-hidden="true">
            <md-icon>notifications_active</md-icon>
          </span>
          <div>
            <p className="md-typescale-label-large">Deadline reminder</p>
            <p className="md-typescale-body-small muted">DAAD EPOS closes soon</p>
          </div>
        </div>
      </div>
    </section>
  )
}
