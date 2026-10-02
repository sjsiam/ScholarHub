import type { Metadata } from 'next'
import { ScholarshipExplorer } from '@/components/discover/scholarship-explorer'
import './scholarships.css'

export const metadata: Metadata = {
  title: 'Discover scholarships',
  description: 'Search and filter international scholarships by country, degree, field and funding.',
}

export default async function ScholarshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams

  return (
    <main className="page">
      <header className="page-header">
        <span className="md-typescale-label-large eyebrow">Discover</span>
        <h1 className="md-typescale-headline-large">Explore scholarships</h1>
        <p className="md-typescale-body-large muted">
          Filter by destination, degree, field and funding to find awards you qualify for.
        </p>
      </header>
      <ScholarshipExplorer initialQuery={q} />
    </main>
  )
}
