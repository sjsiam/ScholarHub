import { daysUntil, formatUsd } from '@/lib/format'
import { FUNDING_TYPES, type Scholarship } from '@/lib/types'

export function AdminStats({ scholarships }: { scholarships: Scholarship[] }) {
  const open = scholarships.filter((s) => daysUntil(s.deadline) >= 0)
  const closing = open.filter((s) => daysUntil(s.deadline) <= 30)
  const totalValue = scholarships.reduce((sum, s) => sum + s.amountUsd, 0)

  const stats = [
    { icon: 'library_books', label: 'Total listings', value: String(scholarships.length) },
    { icon: 'lock_open', label: 'Accepting applications', value: String(open.length) },
    { icon: 'alarm', label: 'Closing in 30 days', value: String(closing.length) },
    { icon: 'savings', label: 'Annual value listed', value: formatUsd(totalValue, true) },
  ]

  const byFunding = FUNDING_TYPES.map((type) => ({
    label: type,
    count: scholarships.filter((s) => s.fundingType === type).length,
  }))

  const countryCounts = Object.entries(
    scholarships.reduce<Record<string, number>>((acc, s) => {
      acc[s.country] = (acc[s.country] ?? 0) + 1
      return acc
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count]) => ({ label, count }))

  return (
    <>
      <section className="stat-grid" aria-label="Scholarship statistics">
        {stats.map((s) => (
          <md-filled-card key={s.label} class="stat-card">
            <span className="stat-icon" aria-hidden="true">
              <md-icon>{s.icon}</md-icon>
            </span>
            <span className="md-typescale-headline-medium">{s.value}</span>
            <span className="md-typescale-label-large muted">{s.label}</span>
          </md-filled-card>
        ))}
      </section>
      <div className="breakdown-grid">
        <BreakdownCard title="By funding type" rows={byFunding} total={scholarships.length} />
        <BreakdownCard title="Top host countries" rows={countryCounts} total={scholarships.length} />
      </div>
    </>
  )
}

function BreakdownCard({
  title,
  rows,
  total,
}: {
  title: string
  rows: { label: string; count: number }[]
  total: number
}) {
  return (
    <md-outlined-card class="panel">
      <h2 className="md-typescale-title-medium">{title}</h2>
      <ul className="bar-list">
        {rows.map((r) => (
          <li key={r.label}>
            <div className="bar-label md-typescale-body-medium">
              <span>{r.label}</span>
              <span className="muted">{r.count}</span>
            </div>
            <div
              className="bar-track"
              role="meter"
              aria-label={r.label}
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={r.count}
            >
              <div className="bar-fill" style={{ width: `${total ? (r.count / total) * 100 : 0}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </md-outlined-card>
  )
}
