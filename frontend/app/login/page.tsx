import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth/auth-form'
import { AuthLayout } from '@/components/auth/auth-layout'
import '../auth.css'

export const metadata: Metadata = { title: 'Sign in' }

export default function LoginPage() {
  return (
    <AuthLayout>
      <AuthForm mode="login" />
    </AuthLayout>
  )
}
