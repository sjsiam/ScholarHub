import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth/auth-form'
import { AuthLayout } from '@/components/auth/auth-layout'
import '../auth.css'

export const metadata: Metadata = { title: 'Create account' }

export default function RegisterPage() {
  return (
    <AuthLayout>
      <AuthForm mode="register" />
    </AuthLayout>
  )
}
