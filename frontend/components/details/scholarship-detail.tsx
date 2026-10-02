'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { mutate } from 'swr'
import { DeadlineBadge } from '@/components/deadline-badge'
import { EmptyState } from '@/components/empty-state'
import { LinkButton } from '@/components/link-button'
import { SaveButton } from '@/components/save-button'
import { ScholarshipCard } from '@/components/scholarship-card'
import { formatDate, formatUsd } from '@/lib/format'
import { useAllScholarships, useScholarship } from '@/lib/hooks'
import { activityService } from '@/lib/services/user-service'
import type { Scholarship } from '@/lib/types'

export function ScholarshipDetail({ id }: { id: string }) {
  const { data: scholarship, isLoading } = useScholarship(id)

  useEffect(() => {
    activityService.recordView(id).then((ids) => mutate('recently-viewed', ids, false))
  }, [id])

  if (isLoading) {
    return (
      <div className="detail-loading" aria-label="Loading scholarship">
        <md-circular-progress indeterminate />
      </div>
    )
  }

  if (!scholarship) {
    return (
      <EmptyState
        icon="travel_explore"
        title="Scholarship not found"
        description="This listing may have been removed or the link is incorrect."
        action={<LinkButton href="/scholarships">Browse scholarships</LinkButton>}
      />
    )
  }

  return (
    <>
      <Link href="/scholarships" className="back-link md-typescale-label-large">
        <md-icon aria-hidden="true">arrow_back</md-icon>
        All scholarships
      </Link>
      <DetailHeader s={scholarship} />
      <div className="detail-layout">
        <div className="detail-main">
          <section className="detail-section" aria-labelledby="about-title">
            <h2 id="about-title" className="md-typescale-title-large">
              About this scholarship
            </h2>
            <p className="md-typescale-body-large detail-description">{scholarship.description}</p>
          </section>
          <md-divider />
          <section className="detail-section" aria-labelledby="eligibility-title">
            <h2 id="eligibility-title" className="md-typescale-title-large">
              Eligibility requirements
            </h2>
            <ul className="check-list md-typescale-body-large">
              {scholarship.eligibility.map((item) => (
                <li key={item}>
                  <md-icon aria-hidden="true">check_circle</md-icon>
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <md-divider />
          <section className="detail-section" aria-labelledby="benefits-title">
            <h2 id="benefits-title" className="md-typescale-title-large">
              What the award covers
            </h2>
            <ul className="benefit-grid md-typescale-body-medium">
              {scholarship.benefits.map((item) => (
                <li key={item}>
                  <md-icon aria-hidden="true">workspace_premium</md-icon>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>
        <FactsCard s={scholarship} />
      </div>
      <SimilarScholarships current={scholarship} />
    </>
  )
}

function DetailHeader({ s }: { s: Scholarship }) {
  return (
    <header className="detail-header">
      <div className="detail-org">
        <span className="org-avatar large" aria-hidden="true">
          <md-icon>account_balance</md-icon>
        </span>
        <span className="md-typescale-title-medium muted">{s.organization}</span>
      </div>
      <h1 className="md-typescale-display-small text-balance">{s.title}</h1>
      <div className="detail-tags">
        <DeadlineBadge deadline={s.deadline} />
        <span className="tag md-typescale-label-large">
          <md-icon aria-hidden="true">public</md-icon>
          {s.country}
        </span>
        <span className="tag md-typescale-label-large">
          <md-icon aria-hidden="true">payments</md-icon>
          {s.fundingType}
        </span>
      </div>
    </header>
  )
}

function FactsCard({ s }: { s: Scholarship }) {
  const facts = [
    { icon: 'savings', label: 'Funding amount', value: s.amountLabel },
    { icon: 'calculate', label: 'Estimated annual value', value: formatUsd(s.amountUsd) },
    { icon: 'event', label: 'Application deadline', value: formatDate(s.deadline) },
    { icon: 'public', label: 'Country', value: s.country },
    { icon: 'school', label: 'Degree level', value: s.degreeLevels.join(', ') },
    { icon: 'menu_book', label: 'Field of study', value: s.fields.join(', ') },
    { icon: 'payments', label: 'Funding type', value: s.fundingType },
  ]

  return (
    <aside className="detail-aside" aria-label="Key facts">
      <md-elevated-card class="facts-card">
        <h2 className="md-typescale-title-medium">Key facts</h2>
        <dl className="facts-list">
          {facts.map((f) => (
            <div key={f.label} className="fact">
              <md-icon aria-hidden="true">{f.icon}</md-icon>
              <div>
                <dt className="md-typescale-label-medium muted">{f.label}</dt>
                <dd className="md-typescale-body-large">{f.value}</dd>
              </div>
            </div>
          ))}
        </dl>
        <div className="facts-actions">
          <md-filled-button href={s.applicationUrl} target="_blank" trailing-icon has-icon>
            Apply on official site
            <md-icon slot="icon">open_in_new</md-icon>
          </md-filled-button>
          <SaveButton id={s.id} title={s.title} variant="button" />
        </div>
      </md-elevated-card>
    </aside>
  )
}

function SimilarScholarships({ current }: { current: Scholarship }) {
  const { data = [] } = useAllScholarships()
  const similar = data
    .filter((s) => s.id !== current.id)
    .filter(
      (s) =>
        s.country === current.country ||
        s.degreeLevels.some((d) => current.degreeLevels.includes(d)),
    )
    .slice(0, 3)

  if (similar.length === 0) return null

  return (
    <section className="section" aria-labelledby="similar-title">
      <h2 id="similar-title" className="md-typescale-headline-small">
        Similar scholarships
      </h2>
      <div className="cards-grid">
        {similar.map((s) => (
          <ScholarshipCard key={s.id} scholarship={s} />
        ))}
      </div>
    </section>
  )
}
