export const DEGREE_LEVELS = [
  'Undergraduate',
  'Masters',
  'PhD',
  'Postdoctoral',
] as const
export type DegreeLevel = (typeof DEGREE_LEVELS)[number]

export const FUNDING_TYPES = [
  'Full funding',
  'Partial funding',
  'Tuition waiver',
  'Stipend',
] as const
export type FundingType = (typeof FUNDING_TYPES)[number]

export const FIELDS_OF_STUDY = [
  'Computer Science',
  'Engineering',
  'Business',
  'Public Policy',
  'Medicine & Health',
  'Natural Sciences',
  'Social Sciences',
  'Arts & Humanities',
  'Any field',
] as const
export type FieldOfStudy = (typeof FIELDS_OF_STUDY)[number]

export interface Scholarship {
  id: string
  title: string
  organization: string
  country: string
  degreeLevels: DegreeLevel[]
  fields: FieldOfStudy[]
  fundingType: FundingType
  /** Approximate annual value in USD, used for sorting and statistics. */
  amountUsd: number
  /** Human-readable funding summary, e.g. "Full tuition + monthly stipend". */
  amountLabel: string
  /** ISO date (YYYY-MM-DD). */
  deadline: string
  eligibility: string[]
  benefits: string[]
  description: string
  applicationUrl: string
  featured: boolean
  /** ISO date the listing was published. */
  createdAt: string
}

export type ScholarshipInput = Omit<Scholarship, 'id' | 'createdAt'>

export type SortOption = 'deadline' | 'amount' | 'newest' | 'title'

export type DeadlineWindow = '' | '30' | '90' | '180'

export interface ScholarshipFilters {
  query: string
  country: string
  degreeLevel: DegreeLevel | ''
  field: FieldOfStudy | ''
  fundingType: FundingType | ''
  deadlineWithinDays: DeadlineWindow
  sort: SortOption
  page: number
  pageSize: number
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface StudentProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  country: string
  degreeLevel: DegreeLevel
  fieldOfStudy: FieldOfStudy
  preferredCountries: string[]
  institution: string
  gpa: string
  graduationYear: string
  englishTest: string
  bio: string
  preferences: {
    emailAlerts: boolean
    deadlineReminders: boolean
    fullyFundedOnly: boolean
  }
}

export interface Session {
  userId: string
  name: string
  email: string
  role: 'student' | 'admin'
}
