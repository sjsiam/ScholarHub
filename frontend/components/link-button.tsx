'use client'

import { useRouter } from 'next/navigation'
import type { MouseEvent, ReactNode } from 'react'

const TAGS = {
  filled: 'md-filled-button',
  tonal: 'md-filled-tonal-button',
  outlined: 'md-outlined-button',
  text: 'md-text-button',
  elevated: 'md-elevated-button',
} as const

interface LinkButtonProps {
  href: string
  variant?: keyof typeof TAGS
  icon?: string
  trailingIcon?: boolean
  className?: string
  children: ReactNode
}

/**
 * Material button that renders a real link (via the element's `href`) but
 * navigates client-side so in-memory app state survives route changes.
 */
export function LinkButton({
  href,
  variant = 'filled',
  icon,
  trailingIcon,
  className,
  children,
}: LinkButtonProps) {
  const router = useRouter()
  const Tag = TAGS[variant]

  function handleClick(event: MouseEvent) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
    event.preventDefault()
    router.push(href)
  }

  return (
    <Tag
      href={href}
      class={className}
      onClick={handleClick}
      onMouseEnter={() => router.prefetch(href)}
      trailing-icon={trailingIcon || undefined}
      has-icon={icon ? true : undefined}
    >
      {children}
      {icon ? <md-icon slot="icon">{icon}</md-icon> : null}
    </Tag>
  )
}
