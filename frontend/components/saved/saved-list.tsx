'use client'

import Link from 'next/link'
import { useState } from 'react'
import { DeadlineBadge } from '@/components/deadline-badge'
import { EmptyState } from '@/components/empty-state'
import { FilterSelect } from '@/components/filter-select'
import { LinkButton } from '@/components/link-button'
import { useSnackbar } from '@/components/snackbar-provider'
import { useAllScholarships, useSaved } from '@/lib/hooks'
import type { Scholarship } from '@/lib/types'

const SORTS = [
  { value: 'recent', label: 'Recently saved' },
  { value: 'deadline', label: 'Deadline (soonest)' },
  { value: 'amount', label: 'Funding (highest)' },
]

export function SavedList() {
  const { data: all } = useAllScholarships()
  const { savedIds, toggle, isLoading } = useSaved()
  const showSnackbar = useSnackbar()
  const [sort, setSort] = useState('recent')

  if (!all || isLoading) {
    return (
      <div className="detail-loading" aria-label="Loading saved scholarships">
        <md-circular-progress indeterminate />
      </div>
    )
  }

  const saved = savedIds
    .map((id) => all.find((s) => s.id === id))
    .filter((s): s is Scholarship => Boolean(s))
  if (sort === 'deadline') saved.sort((a, b) => a.deadline.localeCompare(b.deadline))
  if (sort === 'amount') saved.sort((a, b) => b.amountUsd - a.amountUsd)

  function remove(s: Scholarship) {
    toggle(s.id)
    showSnackbar(`Removed "${s.title}"`, { label: 'Undo', onAction: () => toggle(s.id) })
  }

  if (saved.length === 0) {
    return (
      <EmptyState
        icon="bookmark_add"
        title="No saved scholarships yet"
        description="Tap the bookmark on any scholarship to build your shortlist and track its deadline."
        action={<LinkButton href="/scholarships" icon="travel_explore">Discover scholarships</LinkButton>}
      />
    )
  }

  return (
    <section className="section" aria-labelledby="saved-count">
      <div className="results-toolbar">
        <h2 id="saved-count" className="md-typescale-title-medium">
          {saved.length} saved scholarship{saved.length === 1 ? '' : 's'}
        </h2>
        <FilterSelect label="Sort by" className="sort-select" value={sort} options={SORTS} onChange={setSort} />
      </div>
      <ul className="saved-list">
        {saved.map((s) => (
          <li key={s.id}>
            <md-outlined-card class="saved-item">
              <span className="org-avatar" aria-hidden="true">
                <md-icon>account_balance</md-icon>
              </span>
              <div className="saved-item-body">
                <span className="md-typescale-label-large muted">{s.organization}</span>
                <h3 className="md-typescale-title-medium">
                  <Link href={`/scholarships/view/?id=${s.id}`} className="saved-item-link">
                    {s.title}
                  </Link>
                </h3>
                <p className="md-typescale-body-medium muted">
                  {s.country} · {s.degreeLevels.join(', ')} · {s.fundingType}
                </p>
                <p className="md-typescale-body-medium">{s.amountLabel}</p>
              </div>
              <div className="saved-item-actions">
                <DeadlineBadge deadline={s.deadline} />
                <div className="saved-item-buttons">
                  <md-text-button onClick={() => remove(s)} has-icon>
                    Remove
                    <md-icon slot="icon">bookmark_remove</md-icon>
                  </md-text-button>
                  <LinkButton href={`/scholarships/view/?id=${s.id}`} variant="tonal">
                    View
                  </LinkButton>
                </div>
              </div>
            </md-outlined-card>
          </li>
        ))}
      </ul>
    </section>
  )
}
