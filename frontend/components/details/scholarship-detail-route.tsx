'use client'

import { useEffect, useState } from 'react'
import { ScholarshipDetail } from '@/components/details/scholarship-detail'

// Reads ?id= from the browser URL so a single static page can display any scholarship
export function ScholarshipDetailRoute() {
  const [id, setId] = useState<string | null>(null)

  useEffect(() => {
    setId(new URLSearchParams(window.location.search).get('id') ?? '')
  }, [])

  if (id === null) return null
  return <ScholarshipDetail id={id} />
}