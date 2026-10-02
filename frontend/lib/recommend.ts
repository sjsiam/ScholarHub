import { daysUntil } from '@/lib/format'
import type { Scholarship, StudentProfile } from '@/lib/types'

export function matchScore(s: Scholarship, p: StudentProfile) {
  let score = 0
  if (s.degreeLevels.includes(p.degreeLevel)) score += 40
  if (s.fields.includes(p.fieldOfStudy)) score += 30
  else if (s.fields.includes('Any field')) score += 20
  if (p.preferredCountries.includes(s.country)) score += 20
  if (s.fundingType === 'Full funding') score += 10
  return Math.min(score, 100)
}

export function profileCompleteness(p: StudentProfile) {
  const checks = [
    p.firstName,
    p.lastName,
    p.email,
    p.country,
    p.degreeLevel,
    p.fieldOfStudy,
    p.preferredCountries.length > 0,
    p.institution,
    p.gpa,
    p.graduationYear,
    p.englishTest,
    p.bio,
  ]
  return checks.filter(Boolean).length / checks.length
}

export function recommend(all: Scholarship[], profile: StudentProfile, limit = 4) {
  return all
    .filter((s) => daysUntil(s.deadline) >= 0)
    .filter((s) => !profile.preferences.fullyFundedOnly || s.fundingType === 'Full funding')
    .map((s) => ({ scholarship: s, score: matchScore(s, profile) }))
    .filter((r) => r.score >= 60)
    .sort((a, b) => b.score - a.score || a.scholarship.deadline.localeCompare(b.scholarship.deadline))
    .slice(0, limit)
}
