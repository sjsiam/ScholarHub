import type { ReactNode } from 'react'

const POINTS = [
  { icon: 'insights', text: 'Personalized match scores based on your profile' },
  { icon: 'event_upcoming', text: 'Deadline tracking for every saved scholarship' },
  { icon: 'verified', text: 'Listings linked to official application pages' },
]

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="page auth-page">
      <section className="auth-brand" aria-label="Why join ScholarHub">
        <span className="md-typescale-label-large eyebrow auth-eyebrow">ScholarHub for students</span>
        <h2 className="md-typescale-headline-large text-balance">
          Funding for your studies, organized in one place
        </h2>
        <ul className="auth-points">
          {POINTS.map((p) => (
            <li key={p.text} className="md-typescale-body-large">
              <span className="auth-point-icon" aria-hidden="true">
                <md-icon>{p.icon}</md-icon>
              </span>
              {p.text}
            </li>
          ))}
        </ul>
        <blockquote className="auth-quote">
          <p className="md-typescale-body-large">
            {'“ScholarHub helped me shortlist five fully funded programs in an afternoon. I start my master’s in Zurich this fall.”'}
          </p>
          <footer className="md-typescale-label-large">Daniel M., ETH Excellence Scholar</footer>
        </blockquote>
      </section>
      <div className="auth-form-wrap">{children}</div>
    </main>
  )
}
