import { simulateLatency } from '@/lib/api/config'
import { daysUntil } from '@/lib/format'
import { MOCK_SCHOLARSHIPS } from '@/lib/mock/scholarships'
import type {
  PaginatedResult,
  Scholarship,
  ScholarshipFilters,
  ScholarshipInput,
} from '@/lib/types'

// In-memory store standing in for the Scholarship microservice.
let scholarships: Scholarship[] = [...MOCK_SCHOLARSHIPS]

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
  if (
    q &&
    ![s.title, s.organization, s.country, s.description, ...s.fields]
      .join(' ')
      .toLowerCase()
      .includes(q)
  ) {
    return false
  }
  if (f.country && s.country !== f.country) return false
  if (f.degreeLevel && !s.degreeLevels.includes(f.degreeLevel)) return false
  if (f.field && !s.fields.includes(f.field) && !s.fields.includes('Any field')) {
    return false
  }
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

export const scholarshipService = {
  // GET /scholarships?query=&country=&degree=&field=&funding=&deadline=&sort=&page=&pageSize=
  async search(filters: ScholarshipFilters): Promise<PaginatedResult<Scholarship>> {
    const filtered = scholarships.filter((s) => matches(s, filters)).sort(sorters[filters.sort])
    const totalPages = Math.max(1, Math.ceil(filtered.length / filters.pageSize))
    const page = Math.min(Math.max(1, filters.page), totalPages)
    const start = (page - 1) * filters.pageSize
    return simulateLatency({
      items: filtered.slice(start, start + filters.pageSize),
      total: filtered.length,
      page,
      pageSize: filters.pageSize,
      totalPages,
    })
  },

  // GET /scholarships
  async list(): Promise<Scholarship[]> {
    return simulateLatency([...scholarships].sort(sorters.deadline))
  },

  // GET /scholarships/featured
  async featured(): Promise<Scholarship[]> {
    return simulateLatency(scholarships.filter((s) => s.featured).slice(0, 6))
  },

  // GET /scholarships/:id
  async getById(id: string): Promise<Scholarship | null> {
    return simulateLatency(scholarships.find((s) => s.id === id) ?? null)
  },

  // GET /scholarships/countries
  async countries(): Promise<string[]> {
    return simulateLatency([...new Set(scholarships.map((s) => s.country))].sort(), 0)
  },

  // POST /scholarships
  async create(input: ScholarshipInput): Promise<Scholarship> {
    const base = input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const id = scholarships.some((s) => s.id === base) ? `${base}-${Date.now()}` : base
    const created: Scholarship = {
      ...input,
      id,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    scholarships = [created, ...scholarships]
    return simulateLatency(created)
  },

  // PUT /scholarships/:id
  async update(id: string, input: ScholarshipInput): Promise<Scholarship> {
    const existing = scholarships.find((s) => s.id === id)
    if (!existing) throw new Error('Scholarship not found')
    const updated = { ...existing, ...input }
    scholarships = scholarships.map((s) => (s.id === id ? updated : s))
    return simulateLatency(updated)
  },

  // DELETE /scholarships/:id
  async remove(id: string): Promise<void> {
    scholarships = scholarships.filter((s) => s.id !== id)
    return simulateLatency(undefined)
  },
}
