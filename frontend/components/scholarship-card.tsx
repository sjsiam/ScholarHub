import Link from 'next/link'
import type { Scholarship } from '@/lib/types'
import { DeadlineBadge } from './deadline-badge'
import { SaveButton } from './save-button'

interface ScholarshipCardProps {
  scholarship: Scholarship
  matchScore?: number
}

export function ScholarshipCard({ scholarship: s, matchScore }: ScholarshipCardProps) {
  return (
    <md-outlined-card class="scholarship-card">
      <div className="scholarship-card-top">
        <span className="org-avatar" aria-hidden="true">
          <md-icon>account_balance</md-icon>
        </span>
        <span className="md-typescale-label-large muted scholarship-card-org">
          {s.organization}
        </span>
        <SaveButton id={s.id} title={s.title} />
      </div>

      <h3 className="md-typescale-title-large scholarship-card-title">
        <Link href={`/scholarships/view/?id=${s.id}`} className="stretched-link">
          {s.title}
        </Link>
      </h3>

      <ul className="meta-list md-typescale-body-medium" aria-label="Scholarship details">
        <li>
          <md-icon aria-hidden="true">public</md-icon>
          {s.country}
        </li>
        <li>
          <md-icon aria-hidden="true">school</md-icon>
          {s.degreeLevels.join(', ')}
        </li>
        <li>
          <md-icon aria-hidden="true">payments</md-icon>
          {s.fundingType}
        </li>
      </ul>

      <p className="md-typescale-body-medium scholarship-card-amount">{s.amountLabel}</p>

      <div className="scholarship-card-footer">
        <DeadlineBadge deadline={s.deadline} />
        {matchScore !== undefined ? (
          <span className="match-score md-typescale-label-large">{matchScore}% match</span>
        ) : null}
      </div>
    </md-outlined-card>
  )
}

export function ScholarshipCardSkeleton() {
  return (
    <md-outlined-card class="scholarship-card skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-line short" />
      <div className="skeleton skeleton-line tall" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line short" />
    </md-outlined-card>
  )
}
