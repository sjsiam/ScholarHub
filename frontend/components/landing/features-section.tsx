const FEATURES = [
  {
    icon: 'travel_explore',
    title: 'One search, every source',
    body: 'Government, university and foundation awards indexed together, with consistent details on eligibility and funding.',
  },
  {
    icon: 'tune',
    title: 'Filters that matter',
    body: 'Narrow by country, degree level, field of study, funding type and deadline window in seconds.',
  },
  {
    icon: 'insights',
    title: 'Personal match scores',
    body: 'Your profile powers recommendations ranked by how well each scholarship fits your goals.',
  },
  {
    icon: 'event_upcoming',
    title: 'Never miss a deadline',
    body: 'Track saved scholarships on your dashboard with countdowns for every upcoming deadline.',
  },
  {
    icon: 'bookmarks',
    title: 'Shortlist and compare',
    body: 'Save promising awards and come back to them anytime from any device.',
  },
  {
    icon: 'shield_person',
    title: 'Verified listings',
    body: 'Every listing is reviewed by our partner team and linked to the official application page.',
  },
]

const STEPS = [
  { title: 'Build your profile', body: 'Tell us your degree, field and preferred destinations.' },
  { title: 'Discover matches', body: 'Browse ranked recommendations and filter the full catalog.' },
  { title: 'Apply with confidence', body: 'Track deadlines and jump straight to official applications.' },
]

export function FeaturesSection() {
  return (
    <>
      <section className="section landing-section" aria-labelledby="features-title">
        <div className="page-header features-header">
          <span className="md-typescale-label-large eyebrow">Why ScholarHub</span>
          <h2 id="features-title" className="md-typescale-headline-medium text-balance">
            Everything you need to fund your studies abroad
          </h2>
          <p className="md-typescale-body-large muted">
            Stop juggling dozens of tabs and spreadsheets. ScholarHub organizes the search so you can
            focus on writing a winning application.
          </p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <md-filled-card key={f.title} class="feature-card">
              <span className="feature-icon" aria-hidden="true">
                <md-icon>{f.icon}</md-icon>
              </span>
              <h3 className="md-typescale-title-medium">{f.title}</h3>
              <p className="md-typescale-body-medium muted">{f.body}</p>
            </md-filled-card>
          ))}
        </div>
      </section>

      <section className="section landing-section" aria-labelledby="steps-title">
        <h2 id="steps-title" className="md-typescale-headline-medium">
          How it works
        </h2>
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s.title} className="step">
              <span className="step-number md-typescale-title-medium" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h3 className="md-typescale-title-medium">{s.title}</h3>
                <p className="md-typescale-body-medium muted">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}
