import { deadlineLabel, deadlineStatus } from '@/lib/format'

export function DeadlineBadge({ deadline }: { deadline: string }) {
  const status = deadlineStatus(deadline)
  return (
    <span className={`badge badge-${status} md-typescale-label-medium`}>
      <md-icon aria-hidden="true">{status === 'urgent' ? 'alarm' : 'event'}</md-icon>
      {deadlineLabel(deadline)}
    </span>
  )
}
