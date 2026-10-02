import type { Metadata } from 'next'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import './admin.css'

export const metadata: Metadata = { title: 'Admin console' }

export default function AdminPage() {
  return (
    <main className="page">
      <AdminDashboard />
    </main>
  )
}
