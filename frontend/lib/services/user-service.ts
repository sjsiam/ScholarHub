import '@/lib/auth/amplify'
import {
  confirmSignUp,
  fetchAuthSession,
  resendSignUpCode,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  signUp as amplifySignUp,
  updateUserAttributes,
} from 'aws-amplify/auth'
import { apiFetch, ApiError, unwrap } from '@/lib/api/client'
import { simulateLatency } from '@/lib/api/config'
import { MOCK_PROFILE, MOCK_RECENTLY_VIEWED_IDS } from '@/lib/mock/profile'
import type { Session, StudentProfile } from '@/lib/types'

// ---------- Auth (Amazon Cognito) ----------

async function currentSession(): Promise<Session | null> {
  try {
    const { tokens } = await fetchAuthSession()
    const claims = tokens?.idToken?.payload
    if (!claims) return null
    const groups = (claims['cognito:groups'] as string[] | undefined) ?? []
    return {
      userId: String(claims.sub),
      name: String(claims.name ?? claims.email ?? ''),
      email: String(claims.email ?? ''),
      role: groups.includes('admin') ? 'admin' : 'student',
    }
  } catch {
    return null
  }
}

async function signInWithCognito(email: string, password: string): Promise<Session> {
  // Clear any stale session so Cognito doesn't reject a second sign-in
  if (await currentSession()) await amplifySignOut()

  const result = await amplifySignIn({ username: email, password })
  if (!result.isSignedIn) {
    throw new Error(`Additional sign-in step required: ${result.nextStep.signInStep}`)
  }

  const session = await currentSession()
  if (!session) throw new Error('Signed in, but no session was returned')
  return session
}

export const authService = {
  async getSession(): Promise<Session | null> {
    return currentSession()
  },

  async signIn(email: string, password: string): Promise<Session> {
    return signInWithCognito(email, password)
  },

  // Creates the Cognito user. If email verification is required, throws
  // CONFIRMATION_REQUIRED and the UI asks for the emailed code.
  async register(input: { firstName: string; lastName: string; email: string; password: string }) {
    const result = await amplifySignUp({
      username: input.email,
      password: input.password,
      options: {
        userAttributes: {
          email: input.email,
          name: `${input.firstName} ${input.lastName}`,
        },
      },
    })

    if (result.isSignUpComplete) {
      return signInWithCognito(input.email, input.password)
    }
    throw new Error('CONFIRMATION_REQUIRED')
  },

  // Called with the 6-digit code Cognito emails after registration
  async confirmRegistration(email: string, code: string, password: string): Promise<Session> {
    await confirmSignUp({ username: email, confirmationCode: code })
    return signInWithCognito(email, password)
  },

  async resendCode(email: string): Promise<void> {
    await resendSignUpCode({ username: email })
  },

  async signOut(): Promise<void> {
    await amplifySignOut()
  },
}

// ---------- Profile (User microservice) ----------

// Starting profile for a user who hasn't saved one yet, prefilled from Cognito
function defaultProfile(session: Session): StudentProfile {
  const [firstName = '', ...rest] = session.name.split(' ')
  return {
    id: session.userId,
    firstName,
    lastName: rest.join(' '),
    email: session.email,
    country: '',
    degreeLevel: 'Masters',
    fieldOfStudy: 'Any field',
    preferredCountries: [],
    institution: '',
    gpa: '',
    graduationYear: '',
    englishTest: '',
    bio: '',
    preferences: {
      emailAlerts: true,
      deadlineReminders: true,
      fullyFundedOnly: false,
    },
  }
}

export const profileService = {
  // GET /users/:id
  async get(): Promise<StudentProfile> {
    const session = await currentSession()
    if (!session) return MOCK_PROFILE // signed-out fallback so pages still render

    try {
      const data = await apiFetch(
        `/users/${encodeURIComponent(session.userId)}`,
        {},
        { auth: true }
      )
      const user = unwrap<Partial<StudentProfile>>(data, 'user')
      return { ...defaultProfile(session), ...user, id: session.userId }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return defaultProfile(session)
      throw err
    }
  },

  // PUT /users/:id  (creates or updates)
  async update(next: StudentProfile): Promise<StudentProfile> {
    const session = await currentSession()
    if (!session) throw new Error('Please sign in to update your profile')

    const name = `${next.firstName} ${next.lastName}`.trim()

    const data = await apiFetch(
      `/users/${encodeURIComponent(session.userId)}`,
      { method: 'PUT', body: JSON.stringify({ ...next, id: session.userId, name }) },
      { auth: true }
    )

    // Keep the Cognito display name in sync, then refresh tokens so the header updates
    if (name && name !== session.name) {
      try {
        await updateUserAttributes({ userAttributes: { name } })
        await fetchAuthSession({ forceRefresh: true })
      } catch (err) {
        console.warn('Could not update Cognito name:', err)
      }
    }

    const user = unwrap<Partial<StudentProfile>>(data, 'user')
    return { ...defaultProfile(session), ...user, id: session.userId }
  },
}

// ---------- Saved scholarships (Saved Scholarship microservice) ----------

interface SavedItem {
  userId: string
  scholarshipId: string
}

// Our services wrap lists in an object, e.g. { savedScholarships: [...] }; take the first array found
function firstArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === 'object') {
    const arr = Object.values(data as Record<string, unknown>).find(Array.isArray)
    if (arr) return arr as T[]
  }
  return []
}

export const savedService = {
  // GET /saved-scholarships/:userId
  async list(): Promise<string[]> {
    const session = await currentSession()
    if (!session) return []
    const data = await apiFetch(
      `/saved-scholarships/${encodeURIComponent(session.userId)}`,
      {},
      { auth: true }
    )
    return firstArray<SavedItem>(data).map((s) => s.scholarshipId)
  },

  // POST /saved-scholarships  |  DELETE /saved-scholarships/:userId/:scholarshipId
  async toggle(id: string): Promise<string[]> {
    const session = await currentSession()
    if (!session) throw new Error('Please sign in to save scholarships')

    const current = await savedService.list()

    if (current.includes(id)) {
      await apiFetch(
        `/saved-scholarships/${encodeURIComponent(session.userId)}/${encodeURIComponent(id)}`,
        { method: 'DELETE' },
        { auth: true }
      )
      return current.filter((x) => x !== id)
    }

    await apiFetch(
      '/saved-scholarships',
      { method: 'POST', body: JSON.stringify({ userId: session.userId, scholarshipId: id }) },
      { auth: true }
    )
    return [id, ...current]
  },
}

// ---------- Recently viewed (kept client-side) ----------

let recentlyViewedIds: string[] = [...MOCK_RECENTLY_VIEWED_IDS]

export const activityService = {
  async recentlyViewed(): Promise<string[]> {
    return simulateLatency(recentlyViewedIds, 0)
  },

  async recordView(id: string): Promise<string[]> {
    recentlyViewedIds = [id, ...recentlyViewedIds.filter((x) => x !== id)].slice(0, 6)
    return simulateLatency(recentlyViewedIds, 0)
  },
}