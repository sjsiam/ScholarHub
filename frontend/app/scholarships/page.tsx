import type { Metadata } from 'next'
import { ScholarshipDetail } from '@/components/details/scholarship-detail'
import { scholarshipService } from '@/lib/services/scholarship-service'
import './details.css'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  try {
    const scholarship = await scholarshipService.getById(id)
    return {
      title: scholarship?.title ?? 'Scholarship',
      description: scholarship?.description,
    }
  } catch {
    return { title: 'Scholarship' }
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