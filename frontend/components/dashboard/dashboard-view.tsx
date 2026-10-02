'use client'

import { EmptyState } from '@/components/empty-state'
import { LinkButton } from '@/components/link-button'
import { ScholarshipCard, ScholarshipCardSkeleton } from '@/components/scholarship-card'
import { ScholarshipList } from '@/components/scholarship-list'
import { daysUntil, initials } from '@/lib/format'
import { useAllScholarships, useProfile, useRecentlyViewed, useSaved } from '@/lib/hooks'
import { profileCompleteness, recommend } from '@/lib/recommend'
import type { Scholarship, StudentProfile } from '@/lib/types'

function byIds(all: Scholarship[], ids: string[]) {
  return ids.map((id) => all.find((s) => s.id === id)).filter((s): s is Scholarship => Boolean(s))
}

export function DashboardView() {
  const { data: profile } = useProfile()
  const { data: all } = useAllScholarships()
  const { data: recentIds = [] } = useRecentlyViewed()
  const { savedIds } = useSaved()

  if (!profile || !all) {
    return (
      <div className="cards-grid">
        {Array.from({ length: 3 }, (_, i) => (
          <ScholarshipCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  const recommendations = recommend(all, profile, 4)
  const saved = byIds(all, savedIds)
  const recent = byIds(all, recentIds).slice(0, 4)
  const upcoming = saved
    .filter((s) => daysUntil(s.deadline) >= 0)
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 5)
  const closingSoon = saved.filter((s) => {
    const d = daysUntil(s.deadline)
    return d >= 0 && d <= 30
  }).length
  const completeness = profileCompleteness(profile)

  const stats = [
    { icon: 'bookmark', label: 'Saved', value: saved.length },
    { icon: 'auto_awesome', label: 'Top matches', value: recommendations.length },
    { icon: 'alarm', label: 'Due in 30 days', value: closingSoon },
    { icon: 'person_check', label: 'Profile complete', value: `${Math.round(completeness * 100)}%` },
  ]

  return (
    <>
      <header className="page-header-row">
        <div className="page-header">
          <span className="md-typescale-label-large eyebrow">Student dashboard</span>
          <h1 className="md-typescale-headline-large">Welcome back, {profile.firstName}</h1>
          <p className="md-typescale-body-large muted">
            {closingSoon > 0
              ? `You have ${closingSoon} saved scholarship${closingSoon === 1 ? '' : 's'} closing in the next 30 days.`
              : 'Here is what we found for you this week.'}
          </p>
        </div>
        <LinkButton href="/scholarships" icon="travel_explore">
          Find scholarships
        </LinkButton>
      </header>

      <section className="stat-grid" aria-label="Your activity">
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

      <div className="dashboard-layout">
        <section className="section" aria-labelledby="recommended-title">
          <div className="section-heading">
            <h2 id="recommended-title" className="md-typescale-title-large">
              Recommended for you
            </h2>
            <LinkButton href="/scholarships" variant="text">
              See all
            </LinkButton>
          </div>
          {recommendations.length ? (
            <div className="recommend-grid">
              {recommendations.map(({ scholarship, score }) => (
                <ScholarshipCard key={scholarship.id} scholarship={scholarship} matchScore={score} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="person_search"
              title="Complete your profile for matches"
              description="Add your degree level, field and preferred countries to get recommendations."
              action={<LinkButton href="/profile">Update profile</LinkButton>}
            />
          )}
        </section>

        <aside className="dashboard-aside" aria-label="Profile and activity">
          <ProfileSummary profile={profile} completeness={completeness} />

          <md-outlined-card class="panel">
            <div className="section-heading">
              <h2 className="md-typescale-title-medium">Upcoming deadlines</h2>
              <md-icon aria-hidden="true" class="muted">
                calendar_month
              </md-icon>
            </div>
            {upcoming.length ? (
              <ScholarshipList items={upcoming} label="Upcoming deadlines" variant="deadline" />
            ) : (
              <p className="md-typescale-body-medium muted">
                Save scholarships to track their deadlines here.
              </p>
            )}
          </md-outlined-card>

          <md-outlined-card class="panel">
            <h2 className="md-typescale-title-medium">Recently viewed</h2>
            {recent.length ? (
              <ScholarshipList items={recent} label="Recently viewed" />
            ) : (
              <p className="md-typescale-body-medium muted">Scholarships you open will appear here.</p>
            )}
          </md-outlined-card>
        </aside>
      </div>
    </>
  )
}

function ProfileSummary({ profile, completeness }: { profile: StudentProfile; completeness: number }) {
  const name = `${profile.firstName} ${profile.lastName}`
  return (
    <md-elevated-card class="panel profile-summary">
      <div className="profile-summary-head">
        <span className="profile-avatar md-typescale-title-large" aria-hidden="true">
          {initials(name)}
        </span>
        <div>
          <h2 className="md-typescale-title-medium">{name}</h2>
          <p className="md-typescale-body-medium muted">{profile.institution}</p>
        </div>
      </div>
      <dl className="profile-facts md-typescale-body-medium">
        <div>
          <dt className="muted">Degree</dt>
          <dd>{profile.degreeLevel}</dd>
        </div>
        <div>
          <dt className="muted">Field</dt>
          <dd>{profile.fieldOfStudy}</dd>
        </div>
        <div>
          <dt className="muted">Country</dt>
          <dd>{profile.country}</dd>
        </div>
        <div>
          <dt className="muted">GPA</dt>
          <dd>{profile.gpa}</dd>
        </div>
      </dl>
      <div className="completeness">
        <div className="section-heading md-typescale-label-large">
          <span>Profile strength</span>
          <span>{Math.round(completeness * 100)}%</span>
        </div>
        <md-linear-progress value={completeness} aria-label="Profile completeness" />
      </div>
      <LinkButton href="/profile" variant="tonal" icon="edit">
        Edit profile
      </LinkButton>
    </md-elevated-card>
  )
}
