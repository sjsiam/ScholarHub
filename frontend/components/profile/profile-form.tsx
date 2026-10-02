'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import { mutate } from 'swr'
import { FilterSelect, toOptions } from '@/components/filter-select'
import { useSnackbar } from '@/components/snackbar-provider'
import { initials } from '@/lib/format'
import { useCountries, useProfile } from '@/lib/hooks'
import { profileCompleteness } from '@/lib/recommend'
import { profileService } from '@/lib/services/user-service'
import { DEGREE_LEVELS, FIELDS_OF_STUDY, type StudentProfile } from '@/lib/types'

const HOME_COUNTRIES = [
  'Brazil',
  'Egypt',
  'Ghana',
  'India',
  'Indonesia',
  'Kenya',
  'Mexico',
  'Nigeria',
  'Pakistan',
  'Philippines',
  'Vietnam',
]

export function ProfileView() {
  const { data: profile } = useProfile()

  if (!profile) {
    return (
      <div className="detail-loading" aria-label="Loading profile">
        <md-circular-progress indeterminate />
      </div>
    )
  }

  return <ProfileForm key={profile.email} initial={profile} />
}

function FormSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <md-outlined-card class="profile-section">
      <div className="profile-section-header">
        <h2 className="md-typescale-title-large">{title}</h2>
        <p className="md-typescale-body-medium muted">{description}</p>
      </div>
      <div className="profile-section-body">{children}</div>
    </md-outlined-card>
  )
}

function ProfileForm({ initial }: { initial: StudentProfile }) {
  const [draft, setDraft] = useState(initial)
  const [saving, setSaving] = useState(false)
  const { data: destinations = [] } = useCountries()
  const showSnackbar = useSnackbar()

  const set = <K extends keyof StudentProfile>(key: K, value: StudentProfile[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))
  const text = (key: keyof StudentProfile) => (e: Event) =>
    set(key, (e.target as HTMLInputElement).value as never)
  const setPref = (key: keyof StudentProfile['preferences'], value: boolean) =>
    setDraft((d) => ({ ...d, preferences: { ...d.preferences, [key]: value } }))
  const toggleCountry = (country: string) =>
    set(
      'preferredCountries',
      draft.preferredCountries.includes(country)
        ? draft.preferredCountries.filter((c) => c !== country)
        : [...draft.preferredCountries, country],
    )

  const dirty = JSON.stringify(draft) !== JSON.stringify(initial)
  const name = `${draft.firstName} ${draft.lastName}`.trim() || 'Student'

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    const saved = await profileService.update(draft)
    await Promise.all([mutate('profile', saved, false), mutate('session')])
    setSaving(false)
    showSnackbar('Profile updated. Your recommendations have been refreshed.')
  }

  return (
    <form className="profile-layout" onSubmit={handleSubmit}>
      <aside className="profile-aside">
        <md-filled-card class="profile-hero">
          <span className="profile-avatar large md-typescale-headline-small" aria-hidden="true">
            {initials(name)}
          </span>
          <div>
            <h2 className="md-typescale-title-large">{name}</h2>
            <p className="md-typescale-body-medium muted">
              {draft.degreeLevel} · {draft.fieldOfStudy}
            </p>
          </div>
          <div className="completeness">
            <div className="section-heading md-typescale-label-large">
              <span>Profile strength</span>
              <span>{Math.round(profileCompleteness(draft) * 100)}%</span>
            </div>
            <md-linear-progress value={profileCompleteness(draft)} aria-label="Profile completeness" />
          </div>
          <p className="md-typescale-body-small muted">
            A complete profile improves the accuracy of your match scores.
          </p>
        </md-filled-card>
      </aside>

      <div className="profile-sections">
        <FormSection title="Personal information" description="How we identify you and where you are applying from.">
          <div className="field-grid">
            <md-outlined-text-field label="First name" value={draft.firstName} oninput={text('firstName')} required />
            <md-outlined-text-field label="Last name" value={draft.lastName} oninput={text('lastName')} required />
            <md-outlined-text-field label="Email" type="email" value={draft.email} oninput={text('email')} required />
            <FilterSelect
              label="Country of citizenship"
              value={draft.country}
              options={toOptions(HOME_COUNTRIES)}
              onChange={(v) => set('country', v)}
            />
          </div>
        </FormSection>

        <FormSection title="Academic information" description="Used to match you with eligible programs.">
          <div className="field-grid">
            <FilterSelect
              label="Degree level"
              value={draft.degreeLevel}
              options={toOptions(DEGREE_LEVELS)}
              onChange={(v) => set('degreeLevel', v as StudentProfile['degreeLevel'])}
            />
            <FilterSelect
              label="Field of study"
              value={draft.fieldOfStudy}
              options={toOptions(FIELDS_OF_STUDY.filter((f) => f !== 'Any field'))}
              onChange={(v) => set('fieldOfStudy', v as StudentProfile['fieldOfStudy'])}
            />
            <md-outlined-text-field label="Current or last institution" value={draft.institution} oninput={text('institution')} />
            <md-outlined-text-field label="GPA" value={draft.gpa} oninput={text('gpa')} supporting-text="e.g. 3.8 / 4.0" />
            <md-outlined-text-field label="Graduation year" type="number" value={draft.graduationYear} oninput={text('graduationYear')} />
            <md-outlined-text-field label="English proficiency" value={draft.englishTest} oninput={text('englishTest')} supporting-text="e.g. IELTS 7.5 or TOEFL 105" />
          </div>
          <md-outlined-text-field
            class="full-width"
            label="Short bio"
            type="textarea"
            rows={3}
            value={draft.bio}
            oninput={text('bio')}
            supporting-text="Your goals and interests, in a sentence or two"
          />
        </FormSection>

        <FormSection title="Preferred countries" description="Select the destinations you would like to study in.">
          <md-chip-set aria-label="Preferred countries">
            {destinations.map((c) => (
              <md-filter-chip
                key={c}
                label={c}
                selected={draft.preferredCountries.includes(c) || undefined}
                onClick={() => toggleCountry(c)}
              />
            ))}
          </md-chip-set>
        </FormSection>

        <FormSection title="Preferences" description="Control notifications and how we filter recommendations.">
          <div className="switch-list">
            <SwitchRow
              label="Email alerts for new matches"
              description="Weekly digest of newly listed scholarships that fit your profile."
              selected={draft.preferences.emailAlerts}
              onChange={(v) => setPref('emailAlerts', v)}
            />
            <md-divider />
            <SwitchRow
              label="Deadline reminders"
              description="Reminders 30, 7 and 1 day before saved scholarships close."
              selected={draft.preferences.deadlineReminders}
              onChange={(v) => setPref('deadlineReminders', v)}
            />
            <md-divider />
            <SwitchRow
              label="Fully funded only"
              description="Only recommend scholarships that cover full tuition and living costs."
              selected={draft.preferences.fullyFundedOnly}
              onChange={(v) => setPref('fullyFundedOnly', v)}
            />
          </div>
        </FormSection>

        <div className="profile-actions">
          <md-text-button type="button" disabled={!dirty || undefined} onClick={() => setDraft(initial)}>
            Discard changes
          </md-text-button>
          <md-filled-button type="submit" disabled={!dirty || saving || undefined}>
            {saving ? 'Saving…' : 'Save changes'}
          </md-filled-button>
        </div>
      </div>
    </form>
  )
}

function SwitchRow({
  label,
  description,
  selected,
  onChange,
}: {
  label: string
  description: string
  selected: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="switch-row">
      <span className="switch-copy">
        <span className="md-typescale-body-large">{label}</span>
        <span className="md-typescale-body-medium muted">{description}</span>
      </span>
      <md-switch
        selected={selected || undefined}
        onchange={(e: Event) => onChange((e.target as unknown as { selected: boolean }).selected)}
      />
    </label>
  )
}
