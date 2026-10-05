import { apiFetch, ApiError, unwrap } from '@/lib/api/client'
import { daysUntil } from '@/lib/format'
import {
  DEGREE_LEVELS,
  FIELDS_OF_STUDY,
  FUNDING_TYPES,
  type DegreeLevel,
  type FieldOfStudy,
  type FundingType,
  type PaginatedResult,
  type Scholarship,
  type ScholarshipFilters,
  type ScholarshipInput,
} from '@/lib/types'

// ---------- Backend shape (Scholarship microservice / DynamoDB) ----------

interface BackendScholarship {
  id: string
  title: string
  organization: string
  country: string
  degreeLevel?: string
  fieldOfStudy?: string
  fundingType?: string
  amount?: string
  deadline: string
  eligibility?: string[]
  description?: string
  applicationUrl?: string
  createdAt?: string
  updatedAt?: string
  // Richer optional fields (present on seeded items)
  degreeLevels?: string[]
  fields?: string[]
  amountUsd?: number
  amountLabel?: string
  benefits?: string[]
  featured?: boolean
}

// ---------- Mapping backend → frontend ----------

function toDegree(v: string): DegreeLevel {
  if ((DEGREE_LEVELS as readonly string[]).includes(v)) return v as DegreeLevel
  const s = v.toLowerCase()
  if (s.includes('bachelor') || s.includes('undergrad')) return 'Undergraduate'
  if (s.includes('postdoc')) return 'Postdoctoral'
  if (s.includes('phd') || s.includes('doctor')) return 'PhD'
  return 'Masters'
}

function toField(v: string): FieldOfStudy {
  if ((FIELDS_OF_STUDY as readonly string[]).includes(v)) return v as FieldOfStudy
  const s = v.toLowerCase()
  if (s.includes('computer') || s.includes('data') || s.includes('software')) return 'Computer Science'
  if (s.includes('engineer')) return 'Engineering'
  if (s.includes('business') || s.includes('management') || s.includes('finance')) return 'Business'
  if (s.includes('policy')) return 'Public Policy'
  if (s.includes('medic') || s.includes('health')) return 'Medicine & Health'
  if (s.includes('social')) return 'Social Sciences'
  if (s.includes('art') || s.includes('humanit') || s.includes('history')) return 'Arts & Humanities'
  if (s.includes('science')) return 'Natural Sciences'
  return 'Any field'
}

function toFunding(v: string): FundingType {
  if ((FUNDING_TYPES as readonly string[]).includes(v)) return v as FundingType
  const s = v.toLowerCase()
  if (s.includes('partial')) return 'Partial funding'
  if (s.includes('tuition')) return 'Tuition waiver'
  if (s.includes('stipend')) return 'Stipend'
  if (s.includes('full')) return 'Full funding'
  return 'Partial funding'
}

function fromBackend(b: BackendScholarship): Scholarship {
  return {
    id: b.id,
    title: b.title,
    organization: b.organization,
    country: b.country,
    degreeLevels: b.degreeLevels?.length
      ? b.degreeLevels.map(toDegree)
      : [toDegree(b.degreeLevel ?? '')],
    fields: b.fields?.length ? b.fields.map(toField) : [toField(b.fieldOfStudy ?? '')],
    fundingType: toFunding(b.fundingType ?? ''),
    amountUsd: typeof b.amountUsd === 'number' ? b.amountUsd : 0,
    amountLabel: b.amountLabel ?? b.amount ?? '',
    deadline: (b.deadline ?? '').slice(0, 10),
    eligibility: b.eligibility ?? [],
    benefits: b.benefits ?? [],
    description: b.description ?? '',
    applicationUrl: b.applicationUrl ?? '',
    featured: b.featured ?? false,
    createdAt: (b.createdAt ?? '').slice(0, 10),
  }
}

// Sends both the richer frontend fields and the backend's original fields
function toBackend(input: ScholarshipInput): Record<string, unknown> {
  return {
    ...input,
    degreeLevel: input.degreeLevels[0] ?? '',
    fieldOfStudy: input.fields[0] ?? '',
    amount: input.amountLabel,
  }
}

async function fetchAll(): Promise<Scholarship[]> {
  const data = await apiFetch('/scholarships')
  return unwrap<BackendScholarship[]>(data, 'scholarships').map(fromBackend)
}

// ---------- Filtering & sorting (client-side) ----------

export const DEFAULT_FILTERS: ScholarshipFilters = {
  query: '',
  country: '',
  degreeLevel: '',
  field: '',
  fundingType: '',
  deadlineWithinDays: '',
  sort: 'deadline',
  page: 1,
  pageSize: 6,
}

function matches(s: Scholarship, f: ScholarshipFilters) {
  const q = f.query.trim().toLowerCase()
  if (q) {
    const haystack = [s.title, s.organization, s.country, s.description, ...s.fields]
      .join(' ')
      .toLowerCase()
    // "unitedstates" should still match "United States"
    const compact = (v: string) => v.replace(/[^a-z0-9]/g, '')
    if (!haystack.includes(q) && !compact(haystack).includes(compact(q))) return false
  }
  if (f.country && s.country !== f.country) return false
  if (f.degreeLevel && !s.degreeLevels.includes(f.degreeLevel)) return false
  if (f.field && !s.fields.includes(f.field) && !s.fields.includes('Any field')) return false
  if (f.fundingType && s.fundingType !== f.fundingType) return false
  if (f.deadlineWithinDays) {
    const days = daysUntil(s.deadline)
    if (days < 0 || days > Number(f.deadlineWithinDays)) return false
  }
  return true
}

const sorters: Record<ScholarshipFilters['sort'], (a: Scholarship, b: Scholarship) => number> = {
  deadline: (a, b) => a.deadline.localeCompare(b.deadline),
  amount: (a, b) => b.amountUsd - a.amountUsd,
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  title: (a, b) => a.title.localeCompare(b.title),
}

// ---------- Service (backed by Scholarship microservice via API Gateway) ----------

export const scholarshipService = {
  async search(filters: ScholarshipFilters): Promise<PaginatedResult<Scholarship>> {
    const all = await fetchAll()
    const filtered = all.filter((s) => matches(s, filters)).sort(sorters[filters.sort])
    const totalPages = Math.max(1, Math.ceil(filtered.length / filters.pageSize))
    const page = Math.min(Math.max(1, filters.page), totalPages)
    const start = (page - 1) * filters.pageSize
    return {
      items: filtered.slice(start, start + filters.pageSize),
      total: filtered.length,
      page,
      pageSize: filters.pageSize,
      totalPages,
    }
  },

  async list(): Promise<Scholarship[]> {
    return (await fetchAll()).sort(sorters.deadline)
  },

  async featured(): Promise<Scholarship[]> {
    const all = await fetchAll()
    const featured = all.filter((s) => s.featured)
    // Fall back to soonest deadlines so the landing page is never empty
    return (featured.length ? featured : all.sort(sorters.deadline)).slice(0, 6)
  },

  async getById(id: string): Promise<Scholarship | null> {
    try {
      const data = await apiFetch(`/scholarships/${encodeURIComponent(id)}`)
      return fromBackend(unwrap<BackendScholarship>(data, 'scholarship'))
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null
      throw err
    }
  },

  async countries(): Promise<string[]> {
    const all = await fetchAll()
    return [...new Set(all.map((s) => s.country))].sort()
  },

  async create(input: ScholarshipInput): Promise<Scholarship> {
    const data = await apiFetch(
      '/scholarships',
      { method: 'POST', body: JSON.stringify(toBackend(input)) },
      { auth: true }
    )
    const created = fromBackend(unwrap<BackendScholarship>(data, 'scholarship'))
    return { ...created, ...input, id: created.id }
  },

  async update(id: string, input: ScholarshipInput): Promise<Scholarship> {
    const data = await apiFetch(
      `/scholarships/${encodeURIComponent(id)}`,
      { method: 'PUT', body: JSON.stringify(toBackend(input)) },
      { auth: true }
    )
    const updated = fromBackend(unwrap<BackendScholarship>(data, 'scholarship'))
    return { ...updated, ...input, id }
  },

  async remove(id: string): Promise<void> {
    await apiFetch(`/scholarships/${encodeURIComponent(id)}`, { method: 'DELETE' }, { auth: true })
  },
}