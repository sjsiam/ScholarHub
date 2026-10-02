import { simulateLatency } from '@/lib/api/config'
import {
  MOCK_PROFILE,
  MOCK_RECENTLY_VIEWED_IDS,
  MOCK_SAVED_IDS,
  MOCK_SESSION,
} from '@/lib/mock/profile'
import type { Session, StudentProfile } from '@/lib/types'

// In-memory stores standing in for the Auth, User and Saved-items microservices.
let session: Session | null = MOCK_SESSION
let profile: StudentProfile = MOCK_PROFILE
let savedIds: string[] = [...MOCK_SAVED_IDS]
let recentlyViewedIds: string[] = [...MOCK_RECENTLY_VIEWED_IDS]

export const authService = {
  // GET /auth/session
  async getSession(): Promise<Session | null> {
    return simulateLatency(session, 0)
  },

  // POST /auth/login
  async signIn(email: string, _password: string): Promise<Session> {
    session = { ...MOCK_SESSION, email }
    return simulateLatency(session, 500)
  },

  // POST /auth/register
  async register(input: { firstName: string; lastName: string; email: string; password: string }) {
    profile = { ...profile, firstName: input.firstName, lastName: input.lastName, email: input.email }
    session = {
      ...MOCK_SESSION,
      name: `${input.firstName} ${input.lastName}`,
      email: input.email,
    }
    return simulateLatency(session, 600)
  },

  // POST /auth/logout
  async signOut(): Promise<void> {
    session = null
    return simulateLatency(undefined, 0)
  },
}

export const profileService = {
  // GET /users/me
  async get(): Promise<StudentProfile> {
    return simulateLatency(profile)
  },

  // PUT /users/me
  async update(next: StudentProfile): Promise<StudentProfile> {
    profile = next
    if (session) session = { ...session, name: `${next.firstName} ${next.lastName}`, email: next.email }
    return simulateLatency(profile, 500)
  },
}

export const savedService = {
  // GET /users/me/saved
  async list(): Promise<string[]> {
    return simulateLatency(savedIds, 0)
  },

  // PUT /users/me/saved/:id  |  DELETE /users/me/saved/:id
  async toggle(id: string): Promise<string[]> {
    savedIds = savedIds.includes(id) ? savedIds.filter((x) => x !== id) : [id, ...savedIds]
    return simulateLatency(savedIds, 0)
  },
}

export const activityService = {
  // GET /users/me/recently-viewed
  async recentlyViewed(): Promise<string[]> {
    return simulateLatency(recentlyViewedIds, 0)
  },

  // POST /users/me/recently-viewed
  async recordView(id: string): Promise<string[]> {
    recentlyViewedIds = [id, ...recentlyViewedIds.filter((x) => x !== id)].slice(0, 6)
    return simulateLatency(recentlyViewedIds, 0)
  },
}
