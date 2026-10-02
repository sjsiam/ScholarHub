'use client'

import { useSaved } from '@/lib/hooks'
import { useSnackbar } from './snackbar-provider'

interface SaveButtonProps {
  id: string
  title: string
  variant?: 'icon' | 'button'
}

export function SaveButton({ id, title, variant = 'icon' }: SaveButtonProps) {
  const { isSaved, toggle } = useSaved()
  const showSnackbar = useSnackbar()
  const saved = isSaved(id)

  function handleToggle() {
    toggle(id)
    showSnackbar(saved ? `Removed "${title}" from saved` : `Saved "${title}"`, {
      label: 'Undo',
      onAction: () => toggle(id),
    })
  }

  if (variant === 'button') {
    const Tag = saved ? 'md-filled-tonal-button' : 'md-outlined-button'
    return (
      <Tag onClick={handleToggle} aria-pressed={saved} has-icon>
        {saved ? 'Saved' : 'Save scholarship'}
        <md-icon slot="icon" class={saved ? 'icon-filled' : undefined}>
          bookmark
        </md-icon>
      </Tag>
    )
  }

  return (
    <md-icon-button
      onClick={handleToggle}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
    >
      <md-icon class={saved ? 'icon-filled icon-primary' : undefined}>bookmark</md-icon>
    </md-icon-button>
  )
}
