'use client'

import Link from 'next/link'
import { useState } from 'react'
import { DeadlineBadge } from '@/components/deadline-badge'
import { useSnackbar } from '@/components/snackbar-provider'
import { useAllScholarships, useInvalidateScholarships } from '@/lib/hooks'
import { scholarshipService } from '@/lib/services/scholarship-service'
import type { Scholarship, ScholarshipInput } from '@/lib/types'
import { AdminStats } from './admin-stats'
import { ScholarshipFormDialog } from './scholarship-form-dialog'

type FormTarget = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; scholarship: Scholarship }

export function AdminDashboard() {
  const { data: scholarships } = useAllScholarships()
  const invalidate = useInvalidateScholarships()
  const showSnackbar = useSnackbar()
  const [query, setQuery] = useState('')
  const [formTarget, setFormTarget] = useState<FormTarget>({ mode: 'closed' })
  const [pendingDelete, setPendingDelete] = useState<Scholarship | null>(null)

  async function handleSubmit(input: ScholarshipInput) {
    if (formTarget.mode === 'edit') {
      await scholarshipService.update(formTarget.scholarship.id, input)
      showSnackbar(`Updated "${input.title}"`)
    } else {
      await scholarshipService.create(input)
      showSnackbar(`Added "${input.title}"`)
    }
    setFormTarget({ mode: 'closed' })
    await invalidate()
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    const { id, title } = pendingDelete
    setPendingDelete(null)
    await scholarshipService.remove(id)
    await invalidate()
    showSnackbar(`Deleted "${title}"`)
  }

  const q = query.trim().toLowerCase()
  const rows = (scholarships ?? []).filter(
    (s) => !q || `${s.title} ${s.organization} ${s.country}`.toLowerCase().includes(q),
  )

  return (
    <>
      <header className="page-header-row">
        <div className="page-header">
          <span className="md-typescale-label-large eyebrow">Admin console</span>
          <h1 className="md-typescale-headline-large">Manage scholarships</h1>
          <p className="md-typescale-body-large muted">
            Publish, update and retire listings across the ScholarHub catalog.
          </p>
        </div>
        <md-filled-button onClick={() => setFormTarget({ mode: 'create' })} has-icon>
          Add scholarship
          <md-icon slot="icon">add</md-icon>
        </md-filled-button>
      </header>

      {scholarships ? (
        <AdminStats scholarships={scholarships} />
      ) : (
        <div className="detail-loading">
          <md-circular-progress indeterminate aria-label="Loading statistics" />
        </div>
      )}

      <md-outlined-card class="table-card">
        <div className="table-toolbar">
          <h2 className="md-typescale-title-large">All listings</h2>
          <md-outlined-text-field
            class="table-search"
            label="Search listings"
            type="search"
            value={query}
            oninput={(e: Event) => setQuery((e.target as HTMLInputElement).value)}
          >
            <md-icon slot="leading-icon">search</md-icon>
          </md-outlined-text-field>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <caption className="sr-only">Scholarship listings</caption>
            <thead>
              <tr className="md-typescale-label-large">
                <th scope="col">Scholarship</th>
                <th scope="col">Country</th>
                <th scope="col">Degree</th>
                <th scope="col">Funding</th>
                <th scope="col">Deadline</th>
                <th scope="col" className="actions-col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="md-typescale-body-medium">
              {rows.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="table-title">
                      <Link href={`/scholarships/${s.id}`}>{s.title}</Link>
                      <span className="md-typescale-body-small muted">{s.organization}</span>
                    </div>
                  </td>
                  <td>{s.country}</td>
                  <td>{s.degreeLevels.join(', ')}</td>
                  <td>{s.fundingType}</td>
                  <td>
                    <DeadlineBadge deadline={s.deadline} />
                  </td>
                  <td className="actions-col">
                    <div className="row-actions">
                      <md-icon-button
                        aria-label={`Edit ${s.title}`}
                        onClick={() => setFormTarget({ mode: 'edit', scholarship: s })}
                      >
                        <md-icon>edit</md-icon>
                      </md-icon-button>
                      <md-icon-button aria-label={`Delete ${s.title}`} onClick={() => setPendingDelete(s)}>
                        <md-icon class="icon-error">delete</md-icon>
                      </md-icon-button>
                    </div>
                  </td>
                </tr>
              ))}
              {scholarships && rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-empty muted">
                    No listings match {`"${query}"`}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </md-outlined-card>

      <ScholarshipFormDialog
        open={formTarget.mode !== 'closed'}
        scholarship={formTarget.mode === 'edit' ? formTarget.scholarship : null}
        onClose={() => setFormTarget({ mode: 'closed' })}
        onSubmit={handleSubmit}
      />

      <md-dialog type="alert" open={pendingDelete ? true : undefined} onclosed={() => setPendingDelete(null)}>
        <md-icon slot="icon">delete</md-icon>
        <div slot="headline">Delete scholarship?</div>
        <div slot="content" className="md-typescale-body-medium">
          {pendingDelete
            ? `"${pendingDelete.title}" will be permanently removed from the catalog. This cannot be undone.`
            : null}
        </div>
        <div slot="actions">
          <md-text-button onClick={() => setPendingDelete(null)}>Cancel</md-text-button>
          <md-filled-button class="danger-button" onClick={confirmDelete}>
            Delete
          </md-filled-button>
        </div>
      </md-dialog>
    </>
  )
}
