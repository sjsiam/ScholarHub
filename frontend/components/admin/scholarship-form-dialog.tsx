'use client'

import { useState } from 'react'
import { FilterSelect, toOptions } from '@/components/filter-select'
import {
  DEGREE_LEVELS,
  FIELDS_OF_STUDY,
  FUNDING_TYPES,
  type DegreeLevel,
  type FieldOfStudy,
  type Scholarship,
  type ScholarshipInput,
} from '@/lib/types'

interface FormState {
  title: string
  organization: string
  country: string
  degreeLevels: DegreeLevel[]
  fields: FieldOfStudy[]
  fundingType: ScholarshipInput['fundingType']
  amountUsd: string
  amountLabel: string
  deadline: string
  applicationUrl: string
  description: string
  eligibility: string
  benefits: string
  featured: boolean
}

type Errors = Partial<Record<keyof FormState, string>>

const EMPTY: FormState = {
  title: '',
  organization: '',
  country: '',
  degreeLevels: [],
  fields: [],
  fundingType: 'Full funding',
  amountUsd: '',
  amountLabel: '',
  deadline: '',
  applicationUrl: '',
  description: '',
  eligibility: '',
  benefits: '',
  featured: false,
}

function fromScholarship(s: Scholarship): FormState {
  return {
    ...s,
    amountUsd: String(s.amountUsd),
    eligibility: s.eligibility.join('\n'),
    benefits: s.benefits.join('\n'),
  }
}

const lines = (v: string) => v.split('\n').map((l) => l.trim()).filter(Boolean)

function validate(f: FormState): Errors {
  const e: Errors = {}
  if (!f.title.trim()) e.title = 'Title is required'
  if (!f.organization.trim()) e.organization = 'Organization is required'
  if (!f.country.trim()) e.country = 'Country is required'
  if (f.degreeLevels.length === 0) e.degreeLevels = 'Select at least one degree level'
  if (f.fields.length === 0) e.fields = 'Select at least one field'
  const amount = Number(f.amountUsd)
  if (!f.amountUsd || !Number.isFinite(amount) || amount < 0) e.amountUsd = 'Enter a valid amount'
  if (!f.amountLabel.trim()) e.amountLabel = 'Describe what is covered'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f.deadline)) e.deadline = 'Pick a deadline'
  try {
    const url = new URL(f.applicationUrl)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
  } catch {
    e.applicationUrl = 'Enter a valid https:// link'
  }
  if (f.description.trim().length < 20) e.description = 'Add at least 20 characters'
  if (lines(f.eligibility).length === 0) e.eligibility = 'Add at least one requirement'
  return e
}

interface ScholarshipFormDialogProps {
  open: boolean
  scholarship: Scholarship | null
  onClose: () => void
  onSubmit: (input: ScholarshipInput) => Promise<void>
}

export function ScholarshipFormDialog({ open, scholarship, onClose, onSubmit }: ScholarshipFormDialogProps) {
  return (
    <md-dialog open={open || undefined} onclosed={onClose} class="form-dialog">
      <div slot="headline">{scholarship ? 'Edit scholarship' : 'Add scholarship'}</div>
      {open ? (
        <ScholarshipFormBody
          key={scholarship?.id ?? 'new'}
          initial={scholarship ? fromScholarship(scholarship) : EMPTY}
          isEdit={Boolean(scholarship)}
          onCancel={onClose}
          onSubmit={onSubmit}
        />
      ) : (
        <div slot="content" />
      )}
    </md-dialog>
  )
}

function ScholarshipFormBody({
  initial,
  isEdit,
  onCancel,
  onSubmit,
}: {
  initial: FormState
  isEdit: boolean
  onCancel: () => void
  onSubmit: (input: ScholarshipInput) => Promise<void>
}) {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }
  const text = (key: keyof FormState) => (e: Event) => set(key, (e.target as HTMLInputElement).value as never)
  const err = (key: keyof FormState) => ({
    error: errors[key] ? true : undefined,
    'error-text': errors[key],
  })
  const toggleIn = <T extends string>(list: T[], value: T) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

  async function submit() {
    const next = validate(form)
    setErrors(next)
    if (Object.keys(next).length) return
    setSaving(true)
    await onSubmit({
      title: form.title.trim(),
      organization: form.organization.trim(),
      country: form.country.trim(),
      degreeLevels: form.degreeLevels,
      fields: form.fields,
      fundingType: form.fundingType,
      amountUsd: Number(form.amountUsd),
      amountLabel: form.amountLabel.trim(),
      deadline: form.deadline,
      applicationUrl: form.applicationUrl.trim(),
      description: form.description.trim(),
      eligibility: lines(form.eligibility),
      benefits: lines(form.benefits),
      featured: form.featured,
    })
    setSaving(false)
  }

  return (
    <>
      <form slot="content" id="scholarship-form" className="dialog-form" method="dialog" onSubmit={(e) => e.preventDefault()}>
        <md-outlined-text-field label="Title" value={form.title} oninput={text('title')} {...err('title')} />
        <div className="dialog-grid">
          <md-outlined-text-field label="Organization" value={form.organization} oninput={text('organization')} {...err('organization')} />
          <md-outlined-text-field label="Country" value={form.country} oninput={text('country')} {...err('country')} />
          <FilterSelect
            label="Funding type"
            value={form.fundingType}
            options={toOptions(FUNDING_TYPES)}
            onChange={(v) => set('fundingType', v as FormState['fundingType'])}
          />
          <md-outlined-text-field label="Deadline" type="date" value={form.deadline} oninput={text('deadline')} {...err('deadline')} />
          <md-outlined-text-field label="Annual value" type="number" prefix-text="$" min="0" value={form.amountUsd} oninput={text('amountUsd')} {...err('amountUsd')} />
          <md-outlined-text-field label="Funding summary" value={form.amountLabel} oninput={text('amountLabel')} {...err('amountLabel')} />
        </div>

        <fieldset className="dialog-fieldset">
          <legend className="md-typescale-label-large">Degree levels</legend>
          <div className="checkbox-group">
            {DEGREE_LEVELS.map((d) => (
              <label key={d} className="checkbox-row md-typescale-body-medium">
                <md-checkbox
                  touch-target="wrapper"
                  checked={form.degreeLevels.includes(d) || undefined}
                  onchange={() => set('degreeLevels', toggleIn(form.degreeLevels, d))}
                />
                {d}
              </label>
            ))}
          </div>
          {errors.degreeLevels ? <span className="md-typescale-body-small field-error-inline">{errors.degreeLevels}</span> : null}
        </fieldset>

        <fieldset className="dialog-fieldset">
          <legend className="md-typescale-label-large">Fields of study</legend>
          <md-chip-set aria-label="Fields of study">
            {FIELDS_OF_STUDY.map((f) => (
              <md-filter-chip
                key={f}
                label={f}
                selected={form.fields.includes(f) || undefined}
                onClick={() => set('fields', toggleIn(form.fields, f))}
              />
            ))}
          </md-chip-set>
          {errors.fields ? <span className="md-typescale-body-small field-error-inline">{errors.fields}</span> : null}
        </fieldset>

        <md-outlined-text-field label="Application URL" type="url" value={form.applicationUrl} oninput={text('applicationUrl')} {...err('applicationUrl')} />
        <md-outlined-text-field label="Description" type="textarea" rows={3} value={form.description} oninput={text('description')} {...err('description')} />
        <md-outlined-text-field
          label="Eligibility requirements"
          type="textarea"
          rows={3}
          value={form.eligibility}
          oninput={text('eligibility')}
          supporting-text="One requirement per line"
          {...err('eligibility')}
        />
        <md-outlined-text-field
          label="Benefits"
          type="textarea"
          rows={3}
          value={form.benefits}
          oninput={text('benefits')}
          supporting-text="One benefit per line"
        />
        <label className="switch-row">
          <span className="switch-copy">
            <span className="md-typescale-body-large">Featured listing</span>
            <span className="md-typescale-body-medium muted">Show on the landing page</span>
          </span>
          <md-switch
            selected={form.featured || undefined}
            onchange={(e: Event) => set('featured', (e.target as unknown as { selected: boolean }).selected)}
          />
        </label>
      </form>
      <div slot="actions">
        <md-text-button onClick={onCancel}>Cancel</md-text-button>
        <md-filled-button onClick={submit} disabled={saving || undefined}>
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add scholarship'}
        </md-filled-button>
      </div>
    </>
  )
}
