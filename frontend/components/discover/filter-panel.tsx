'use client'

import { FilterSelect, toOptions } from '@/components/filter-select'
import { useCountries } from '@/lib/hooks'
import {
  DEGREE_LEVELS,
  FIELDS_OF_STUDY,
  FUNDING_TYPES,
  type ScholarshipFilters,
} from '@/lib/types'

export const DEADLINE_OPTIONS = [
  { value: '30', label: 'Within 30 days' },
  { value: '90', label: 'Within 3 months' },
  { value: '180', label: 'Within 6 months' },
] as const

interface FilterPanelProps {
  filters: ScholarshipFilters
  onChange: (patch: Partial<ScholarshipFilters>) => void
  onReset: () => void
  activeCount: number
}

export function FilterPanel({ filters, onChange, onReset, activeCount }: FilterPanelProps) {
  const { data: countries = [] } = useCountries()

  return (
    <aside className="filter-panel" aria-labelledby="filters-title">
      <div className="filter-panel-header">
        <h2 id="filters-title" className="md-typescale-title-medium">
          Filters
        </h2>
        <md-text-button disabled={activeCount === 0 || undefined} onClick={onReset}>
          Reset
        </md-text-button>
      </div>
      <FilterSelect
        label="Country"
        allLabel="All countries"
        value={filters.country}
        options={toOptions(countries)}
        onChange={(country) => onChange({ country })}
      />
      <FilterSelect
        label="Degree level"
        allLabel="All levels"
        value={filters.degreeLevel}
        options={toOptions(DEGREE_LEVELS)}
        onChange={(v) => onChange({ degreeLevel: v as ScholarshipFilters['degreeLevel'] })}
      />
      <FilterSelect
        label="Field of study"
        allLabel="All fields"
        value={filters.field}
        options={toOptions(FIELDS_OF_STUDY.filter((f) => f !== 'Any field'))}
        onChange={(v) => onChange({ field: v as ScholarshipFilters['field'] })}
      />
      <FilterSelect
        label="Funding type"
        allLabel="All funding types"
        value={filters.fundingType}
        options={toOptions(FUNDING_TYPES)}
        onChange={(v) => onChange({ fundingType: v as ScholarshipFilters['fundingType'] })}
      />
      <FilterSelect
        label="Deadline"
        allLabel="Any time"
        value={filters.deadlineWithinDays}
        options={DEADLINE_OPTIONS}
        onChange={(v) =>
          onChange({ deadlineWithinDays: v as ScholarshipFilters['deadlineWithinDays'] })
        }
      />
    </aside>
  )
}
