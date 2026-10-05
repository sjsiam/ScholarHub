'use client'

import { useRouter } from 'next/navigation'
import { useSaved } from '@/lib/hooks'
import { useSnackbar } from './snackbar-provider'

interface SaveButtonProps {
  id: string
  title: string
  variant?: 'icon' | 'button'
}

export function SaveButton({ id, title, variant = 'icon' }: SaveButtonProps) {
  const router = useRouter()
  const { isSaved, toggle, isSignedIn } = useSaved()
  const showSnackbar = useSnackbar()
  const saved = isSaved(id)

  async function handleToggle() {
    // Guests are asked to sign in, and nothing is saved
    if (!isSignedIn) {
      showSnackbar('Sign in to save scholarships', {
        label: 'Sign in',
        onAction: () =>
          router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`),
      })
      return
    }

    try {
      await toggle(id)
      showSnackbar(saved ? `Removed "${title}" from saved` : `Saved "${title}"`, {
        label: 'Undo',
        onAction: () => {
          toggle(id).catch(() => showSnackbar('Could not undo. Please try again.'))
        },
      })
    } catch {
      // Optimistic update is rolled back automatically by SWR
      showSnackbar(
        saved ? `Could not remove "${title}". Please try again.` : `Could not save "${title}". Please try again.`
      )
    }
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