import type { Metadata } from 'next'
import { ProfileView } from '@/components/profile/profile-form'
import './profile.css'

export const metadata: Metadata = { title: 'Profile' }

export default function ProfilePage() {
  return (
    <main className="page">
      <header className="page-header">
        <span className="md-typescale-label-large eyebrow">Account</span>
        <h1 className="md-typescale-headline-large">Student profile</h1>
        <p className="md-typescale-body-large muted">
          Keep your details current so we can recommend the right scholarships.
        </p>
      </header>
      <ProfileView />
    </main>
  )
}
