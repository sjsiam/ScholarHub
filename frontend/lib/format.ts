const DAY_MS = 24 * 60 * 60 * 1000

function startOfToday() {
  const now = new Date()
  return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
}

export function daysUntil(isoDate: string) {
  const [y, m, d] = isoDate.split('-').map(Number)
  return Math.round((Date.UTC(y, m - 1, d) - startOfToday()) / DAY_MS)
}

export function formatDate(isoDate: string) {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)))
}

export function formatUsd(value: number, compact = false) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? 'compact' : 'standard',
  }).format(value)
}

export type DeadlineStatus = 'closed' | 'urgent' | 'soon' | 'open'

export function deadlineStatus(isoDate: string): DeadlineStatus {
  const days = daysUntil(isoDate)
  if (days < 0) return 'closed'
  if (days <= 14) return 'urgent'
  if (days <= 45) return 'soon'
  return 'open'
}

export function deadlineLabel(isoDate: string) {
  const days = daysUntil(isoDate)
  if (days < 0) return 'Closed'
  if (days === 0) return 'Closes today'
  if (days === 1) return '1 day left'
  if (days <= 60) return `${days} days left`
  return `Due ${formatDate(isoDate)}`
}

export function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
