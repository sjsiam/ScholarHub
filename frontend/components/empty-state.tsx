import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon" aria-hidden="true">
        <md-icon>{icon}</md-icon>
      </span>
      <h2 className="md-typescale-title-large">{title}</h2>
      <p className="md-typescale-body-medium muted">{description}</p>
      {action}
    </div>
  )
}
