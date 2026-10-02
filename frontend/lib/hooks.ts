'use client'

import useSWR, { useSWRConfig } from 'swr'
import { scholarshipService } from '@/lib/services/scholarship-service'
import {
  activityService,
  authService,
  profileService,
  savedService,
} from '@/lib/services/user-service'
import type { ScholarshipFilters } from '@/lib/types'

export function useScholarshipSearch(filters: ScholarshipFilters) {
  return useSWR(['scholarships', 'search', filters], () => scholarshipService.search(filters), {
    keepPreviousData: true,
  })
}

export function useAllScholarships() {
  return useSWR(['scholarships', 'all'], () => scholarshipService.list())
}

export function useFeaturedScholarships() {
  return useSWR(['scholarships', 'featured'], () => scholarshipService.featured())
}

export function useScholarship(id: string) {
  return useSWR(['scholarships', 'detail', id], () => scholarshipService.getById(id))
}

export function useCountries() {
  return useSWR(['scholarships', 'countries'], () => scholarshipService.countries())
}

export function useSession() {
  return useSWR('session', () => authService.getSession())
}

export function useProfile() {
  return useSWR('profile', () => profileService.get())
}

export function useRecentlyViewed() {
  return useSWR('recently-viewed', () => activityService.recentlyViewed())
}

export function useSaved() {
  const { data: savedIds = [], mutate, isLoading } = useSWR('saved', () => savedService.list())
  const toggle = (id: string) =>
    mutate(() => savedService.toggle(id), {
      optimisticData: savedIds.includes(id)
        ? savedIds.filter((x) => x !== id)
        : [id, ...savedIds],
      revalidate: false,
    })
  return { savedIds, isSaved: (id: string) => savedIds.includes(id), toggle, isLoading }
}

/** Revalidates every cached scholarship query after an admin mutation. */
export function useInvalidateScholarships() {
  const { mutate } = useSWRConfig()
  return () =>
    mutate((key) => Array.isArray(key) && key[0] === 'scholarships', undefined, {
      revalidate: true,
    })
}
