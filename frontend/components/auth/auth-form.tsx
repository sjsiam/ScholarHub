'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { mutate } from 'swr'
import { authService } from '@/lib/services/user-service'
import type { Session } from '@/lib/types'

type Mode = 'login' | 'register'
type Stage = 'form' | 'confirm'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface Fields {
  firstName: string
  lastName: string
  email: string
  password: string
  confirm: string
  terms: boolean
}

type Errors = Partial<Record<keyof Fields, string>>

function validate(mode: Mode, f: Fields): Errors {
  const errors: Errors = {}
  if (mode === 'register') {
    if (!f.firstName.trim()) errors.firstName = 'Enter your first name'
    if (!f.lastName.trim()) errors.lastName = 'Enter your last name'
    if (f.confirm !== f.password) errors.confirm = 'Passwords do not match'
    if (!f.terms) errors.terms = 'You must accept the terms to continue'
  }
  if (!EMAIL_PATTERN.test(f.email)) errors.email = 'Enter a valid email address'
  if (f.password.length < 8) errors.password = 'Use at least 8 characters'
  return errors
}

// Turns Cognito error names into messages a student can act on
function friendlyError(err: unknown): string {
  const e = err as { name?: string; message?: string }
  switch (e?.name) {
    case 'NotAuthorizedException':
      return 'Incorrect email or password.'
    case 'UserNotFoundException':
      return 'No account found with this email.'
    case 'UsernameExistsException':
      return 'An account with this email already exists. Try signing in instead.'
    case 'InvalidPasswordException':
      return 'Password must include uppercase and lowercase letters, a number and a symbol.'
    case 'CodeMismatchException':
      return 'That code is incorrect. Check your email and try again.'
    case 'ExpiredCodeException':
      return 'That code has expired. Request a new one below.'
    case 'LimitExceededException':
    case 'TooManyRequestsException':
      return 'Too many attempts. Please wait a few minutes and try again.'
    default:
      return e?.message || 'Something went wrong. Please try again.'
  }
}

function needsConfirmation(err: unknown): boolean {
  const msg = (err as Error)?.message ?? ''
  return msg === 'CONFIRMATION_REQUIRED' || msg.includes('CONFIRM_SIGN_UP')
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const [fields, setFields] = useState<Fields>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirm: '',
    terms: false,
  })
  const [errors, setErrors] = useState<Errors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [stage, setStage] = useState<Stage>('form')
  const [code, setCode] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const set = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setFields((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
    setFormError(null)
  }

  const textInput = (key: keyof Fields) => (e: Event) =>
    set(key, (e.target as HTMLInputElement).value as never)

  async function finish(session: Session) {
    await mutate('session', session, false)
    if (mode === 'register') await mutate('profile')
    router.push(mode === 'login' ? '/dashboard' : '/profile')
  }

  async function goToConfirm(resend: boolean) {
    if (resend) {
      try {
        await authService.resendCode(fields.email)
      } catch {
        // Ignore: the user can press "Resend code" on the next screen
      }
    }
    setStage('confirm')
    setFormError(null)
    setInfo(`We sent a 6-digit verification code to ${fields.email}.`)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const nextErrors = validate(mode, fields)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    setFormError(null)
    try {
      const session =
        mode === 'login'
          ? await authService.signIn(fields.email, fields.password)
          : await authService.register(fields)
      await finish(session)
    } catch (err) {
      if (needsConfirmation(err)) {
        // After registering, Cognito already sent a code; on login we request a fresh one
        await goToConfirm(mode === 'login')
      } else {
        setFormError(friendlyError(err))
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleConfirm(event: FormEvent) {
    event.preventDefault()
    if (!/^\d{6}$/.test(code.trim())) {
      setFormError('Enter the 6-digit code from your email.')
      return
    }

    setSubmitting(true)
    setFormError(null)
    try {
      const session = await authService.confirmRegistration(
        fields.email,
        code.trim(),
        fields.password
      )
      await finish(session)
    } catch (err) {
      setFormError(friendlyError(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResend() {
    setFormError(null)
    try {
      await authService.resendCode(fields.email)
      setInfo(`A new code was sent to ${fields.email}.`)
    } catch (err) {
      setFormError(friendlyError(err))
    }
  }

  const isLogin = mode === 'login'

  // ---------- Verification code screen ----------
  if (stage === 'confirm') {
    return (
      <md-outlined-card class="auth-card">
        <div className="auth-card-header">
          <h1 className="md-typescale-headline-medium">Verify your email</h1>
          {info ? <p className="md-typescale-body-medium muted">{info}</p> : null}
        </div>

        <form className="auth-form" onSubmit={handleConfirm} noValidate>
          <md-outlined-text-field
            label="Verification code"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength={6}
            value={code}
            oninput={(e: Event) => {
              setCode((e.target as HTMLInputElement).value)
              setFormError(null)
            }}
          >
            <md-icon slot="leading-icon">pin</md-icon>
          </md-outlined-text-field>

          {formError ? (
            <span className="md-typescale-body-medium field-error" role="alert">
              {formError}
            </span>
          ) : null}

          <md-filled-button type="submit" class="auth-submit" disabled={submitting || undefined}>
            {submitting ? 'Verifying…' : 'Verify and continue'}
          </md-filled-button>
        </form>

        <p className="md-typescale-body-medium muted auth-switch">
          {"Didn't get it? Check your spam folder or "}
          <md-text-button type="button" onClick={handleResend}>
            Resend code
          </md-text-button>
        </p>
        <p className="md-typescale-body-medium muted auth-switch">
          <md-text-button
            type="button"
            onClick={() => {
              setStage('form')
              setCode('')
              setFormError(null)
            }}
          >
            Back
          </md-text-button>
        </p>
      </md-outlined-card>
    )
  }

  // ---------- Login / register form ----------
  return (
    <md-outlined-card class="auth-card">
      <div className="auth-card-header">
        <h1 className="md-typescale-headline-medium">
          {isLogin ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="md-typescale-body-medium muted">
          {isLogin
            ? 'Sign in to see your matches, saved scholarships and deadlines.'
            : 'Get personalized scholarship matches in under two minutes.'}
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {!isLogin ? (
          <div className="auth-row">
            <md-outlined-text-field
              label="First name"
              autocomplete="given-name"
              value={fields.firstName}
              oninput={textInput('firstName')}
              error={errors.firstName ? true : undefined}
              error-text={errors.firstName}
            />
            <md-outlined-text-field
              label="Last name"
              autocomplete="family-name"
              value={fields.lastName}
              oninput={textInput('lastName')}
              error={errors.lastName ? true : undefined}
              error-text={errors.lastName}
            />
          </div>
        ) : null}

        <md-outlined-text-field
          label="Email"
          type="email"
          autocomplete="email"
          value={fields.email}
          oninput={textInput('email')}
          error={errors.email ? true : undefined}
          error-text={errors.email}
        >
          <md-icon slot="leading-icon">mail</md-icon>
        </md-outlined-text-field>

        <md-outlined-text-field
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autocomplete={isLogin ? 'current-password' : 'new-password'}
          value={fields.password}
          oninput={textInput('password')}
          error={errors.password ? true : undefined}
          error-text={errors.password}
          supporting-text={
            isLogin ? undefined : 'At least 8 characters, with upper and lowercase, a number and a symbol'
          }
        >
          <md-icon slot="leading-icon">lock</md-icon>
          <md-icon-button
            slot="trailing-icon"
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((s) => !s)}
          >
            <md-icon>{showPassword ? 'visibility_off' : 'visibility'}</md-icon>
          </md-icon-button>
        </md-outlined-text-field>

        {!isLogin ? (
          <md-outlined-text-field
            label="Confirm password"
            type={showPassword ? 'text' : 'password'}
            autocomplete="new-password"
            value={fields.confirm}
            oninput={textInput('confirm')}
            error={errors.confirm ? true : undefined}
            error-text={errors.confirm}
          >
            <md-icon slot="leading-icon">lock</md-icon>
          </md-outlined-text-field>
        ) : null}

        {isLogin ? (
          <div className="auth-options">
            <label className="checkbox-row md-typescale-body-medium">
              <md-checkbox touch-target="wrapper" checked />
              Remember me
            </label>
            <md-text-button type="button">Forgot password?</md-text-button>
          </div>
        ) : (
          <div className="terms-field">
            <label className="checkbox-row md-typescale-body-medium">
              <md-checkbox
                touch-target="wrapper"
                checked={fields.terms || undefined}
                onchange={(e: Event) => set('terms', (e.target as HTMLInputElement).checked)}
              />
              I agree to the Terms of Service and Privacy Policy
            </label>
            {errors.terms ? (
              <span className="md-typescale-body-small field-error" role="alert">
                {errors.terms}
              </span>
            ) : null}
          </div>
        )}

        {formError ? (
          <span className="md-typescale-body-medium field-error" role="alert">
            {formError}
          </span>
        ) : null}

        <md-filled-button type="submit" class="auth-submit" disabled={submitting || undefined}>
          {submitting ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
        </md-filled-button>
      </form>

      <p className="md-typescale-body-medium muted auth-switch">
        {isLogin ? 'New to ScholarHub? ' : 'Already have an account? '}
        <Link href={isLogin ? '/register' : '/login'}>
          {isLogin ? 'Create an account' : 'Sign in'}
        </Link>
      </p>
    </md-outlined-card>
  )
}