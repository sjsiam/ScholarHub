import type { Metadata } from 'next'
import { DashboardView } from '@/components/dashboard/dashboard-view'
import './dashboard.css'

export const metadata: Metadata = { title: 'Dashboard' }

export default function DashboardPage() {
  return (
    <main className="page">
      <DashboardView />
    </main>
  )
}
