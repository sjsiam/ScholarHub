import type { Metadata } from 'next'
import { RequireAuth } from '@/components/auth/require-auth'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import './admin.css'

export const metadata: Metadata = { title: 'Admin console' }

export default function AdminPage() {
  return (
    <main className="page">
      <RequireAuth role="admin">
        <AdminDashboard />
      </RequireAuth>
    </main>
  )
}