'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import { useSession } from '@/lib/hooks'

// Client-side guard: the real protection is API Gateway + Cognito; this keeps the UI consistent
export function RequireAuth({ children, role }: { children: ReactNode; role?: 'admin' }) {
  const router = useRouter()
  const { data: session, isLoading } = useSession()

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`)
    }
  }, [isLoading, session, router])

  if (isLoading || !session) {
    return (
      <div className="detail-loading" aria-label="Checking sign-in">
        <md-circular-progress indeterminate />
      </div>
    )
  }

  if (role === 'admin' && session.role !== 'admin') {
    return (
      <md-outlined-card class="auth-card">
        <div className="auth-card-header">
          <h1 className="md-typescale-headline-medium">Admins only</h1>
          <p className="md-typescale-body-medium muted">
            Your account doesn&apos;t have access to the admin console.
          </p>
        </div>
        <Link href="/dashboard">Go to your dashboard</Link>
      </md-outlined-card>
    )
  }

  return <>{children}</>
}