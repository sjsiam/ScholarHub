import type { Metadata } from 'next'
import { RequireAuth } from '@/components/auth/require-auth'
import { DashboardView } from '@/components/dashboard/dashboard-view'
import './dashboard.css'

export const metadata: Metadata = { title: 'Dashboard' }

export default function DashboardPage() {
  return (
    <main className="page">
      <RequireAuth>
        <DashboardView />
      </RequireAuth>
    </main>
  )
}