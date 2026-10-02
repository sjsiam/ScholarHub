'use client'

import { LinkButton } from '@/components/link-button'
import { ScholarshipCard, ScholarshipCardSkeleton } from '@/components/scholarship-card'
import { useFeaturedScholarships } from '@/lib/hooks'

export function FeaturedScholarships() {
  const { data, isLoading } = useFeaturedScholarships()

  return (
    <section className="section landing-section" aria-labelledby="featured-title">
      <div className="section-heading">
        <div className="page-header">
          <span className="md-typescale-label-large eyebrow">Featured</span>
          <h2 id="featured-title" className="md-typescale-headline-medium">
            Scholarships closing in the coming months
          </h2>
        </div>
        <LinkButton href="/scholarships" variant="text" icon="arrow_forward" trailingIcon className="hide-compact">
          View all
        </LinkButton>
      </div>
      <div className="cards-grid">
        {isLoading || !data
          ? Array.from({ length: 6 }, (_, i) => <ScholarshipCardSkeleton key={i} />)
          : data.map((s) => <ScholarshipCard key={s.id} scholarship={s} />)}
      </div>
    </section>
  )
}
