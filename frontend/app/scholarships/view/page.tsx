import type { Metadata } from 'next'
import { ScholarshipDetailRoute } from '@/components/details/scholarship-detail-route'
import './details.css'

export const metadata: Metadata = {
  title: 'Scholarship',
}

// One static page shows any scholarship: /scholarships/view/?id=<id>
export default function ScholarshipViewPage() {
  return (
    <main className="page">
      <ScholarshipDetailRoute />
    </main>
  )
}