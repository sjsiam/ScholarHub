import type { Metadata } from 'next'
import { ScholarshipDetail } from '@/components/details/scholarship-detail'
import { MOCK_SCHOLARSHIPS } from '@/lib/mock/scholarships'
import './details.css'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const scholarship = MOCK_SCHOLARSHIPS.find((s) => s.id === id)
  return {
    title: scholarship?.title ?? 'Scholarship',
    description: scholarship?.description,
  }
}

export default async function ScholarshipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <main className="page">
      <ScholarshipDetail id={id} />
    </main>
  )
}
