/**
 * Integration seam for the AWS microservices.
 *
 * Every service module in `lib/services/*` currently resolves against in-memory
 * mock data. To go live, replace each function body with a call to `apiFetch`
 * against the matching base URL below (e.g. API Gateway stages per service).
 * Component code only talks to the hooks in `lib/hooks.ts`, so no UI changes
 * are required.
 */
export const SERVICE_ENDPOINTS = {
  scholarships: process.env.NEXT_PUBLIC_SCHOLARSHIP_SERVICE_URL ?? '',
  users: process.env.NEXT_PUBLIC_USER_SERVICE_URL ?? '',
  saved: process.env.NEXT_PUBLIC_SAVED_SERVICE_URL ?? '',
  auth: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? '',
} as const

export type ServiceName = keyof typeof SERVICE_ENDPOINTS

export async function apiFetch<T>(
  service: ServiceName,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${SERVICE_ENDPOINTS[service]}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!response.ok) {
    throw new Error(`${service} service responded with ${response.status}`)
  }
  return response.json() as Promise<T>
}

/** Simulates network latency so loading states behave like the real services. */
export function simulateLatency<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}
