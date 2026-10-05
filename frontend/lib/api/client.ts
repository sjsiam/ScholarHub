const API_URL = process.env.NEXT_PUBLIC_API_URL

// Cognito will plug in here in the next phase; until then authenticated calls fail clearly.
let tokenProvider: () => Promise<string | null> = async () => null

export function setTokenProvider(fn: () => Promise<string | null>) {
  tokenProvider = fn
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
  opts: { auth?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  }

  if (opts.auth) {
    const token = await tokenProvider()
    if (!token) throw new ApiError(401, 'Not signed in')
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, { ...init, headers, cache: 'no-store' })

  if (!res.ok) {
    throw new ApiError(res.status, `API ${res.status}: ${await res.text()}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// Our services wrap responses, e.g. { scholarships: [...] } or { scholarship: {...} }
export function unwrap<T>(data: unknown, key: string): T {
  if (data && typeof data === 'object' && key in (data as Record<string, unknown>)) {
    return (data as Record<string, unknown>)[key] as T
  }
  return data as T
}