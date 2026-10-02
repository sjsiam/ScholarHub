import Link from 'next/link'

const COLUMNS = [
  {
    title: 'Platform',
    links: [
      { href: '/scholarships', label: 'Discover scholarships' },
      { href: '/dashboard', label: 'Student dashboard' },
      { href: '/saved', label: 'Saved scholarships' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/login', label: 'Sign in' },
      { href: '/register', label: 'Create account' },
      { href: '/profile', label: 'Profile' },
    ],
  },
  {
    title: 'Partners',
    links: [{ href: '/admin', label: 'Admin console' }],
  },
]

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand">
          <span className="md-typescale-title-large">
            Scholar<span className="wordmark-accent">Hub</span>
          </span>
          <p className="md-typescale-body-medium muted">
            Helping students find and win the funding that makes international education possible.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} className="footer-col" aria-label={col.title}>
            <h2 className="md-typescale-title-small">{col.title}</h2>
            <ul>
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="md-typescale-body-medium">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="site-footer-bottom md-typescale-body-small muted">
        {'© 2026 ScholarHub · Demo data for illustration only'}
      </div>
    </footer>
  )
}
