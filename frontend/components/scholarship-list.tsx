'use client'

import { useRouter } from 'next/navigation'
import { Fragment } from 'react'
import { deadlineLabel, deadlineStatus } from '@/lib/format'
import type { Scholarship } from '@/lib/types'

interface ScholarshipListProps {
  items: Scholarship[]
  label: string
  variant?: 'deadline' | 'meta'
}

export function ScholarshipList({ items, label, variant = 'meta' }: ScholarshipListProps) {
  const router = useRouter()

  return (
    <md-list aria-label={label}>
      {items.map((s, i) => (
        <Fragment key={s.id}>
          {i > 0 ? <md-divider /> : null}
          <md-list-item type="button" onClick={() => router.push(`/scholarships/${s.id}`)}>
            {variant === 'deadline' ? (
              <span slot="start" className={`deadline-dot status-${deadlineStatus(s.deadline)}`} aria-hidden="true">
                <md-icon>event</md-icon>
              </span>
            ) : (
              <md-icon slot="start">history</md-icon>
            )}
            <div slot="headline">{s.title}</div>
            <div slot="supporting-text">
              {variant === 'deadline' ? deadlineLabel(s.deadline) : `${s.organization} · ${s.country}`}
            </div>
            <md-icon slot="end">chevron_right</md-icon>
          </md-list-item>
        </Fragment>
      ))}
    </md-list>
  )
}
