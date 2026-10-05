'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { mutate } from 'swr'
import { useSession } from '@/lib/hooks'
import { authService } from '@/lib/services/user-service'
import { initials } from '@/lib/format'
import { LinkButton } from './link-button'
import { ThemeToggle } from './theme-toggle'

const NAV = [
  { href: '/scholarships', label: 'Discover' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/saved', label: 'Saved' },
  { href: '/admin', label: 'Admin' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [navOpen, setNavOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  const navItems = NAV.filter((item) => item.href !== '/admin' || session?.role === 'admin')

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  async function signOut() {
    await authService.signOut()
    await mutate('session')
    router.push('/')
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <span className="mobile-nav-anchor">
          <md-icon-button
            id="mobile-nav-button"
            aria-label="Open navigation menu"
            onClick={() => setNavOpen((o) => !o)}
          >
            <md-icon>menu</md-icon>
          </md-icon-button>
          <md-menu
            anchor="mobile-nav-button"
            positioning="popover"
            open={navOpen || undefined}
            onclosed={() => setNavOpen(false)}
          >
            {navItems.map((item) => (
              <md-menu-item key={item.href} onClick={() => router.push(item.href)}>
                <div slot="headline">{item.label}</div>
              </md-menu-item>
            ))}
          </md-menu>
        </span>

        <Link href="/" className="wordmark" aria-label="ScholarHub home">
          <span className="wordmark-mark" aria-hidden="true">
            <md-icon>school</md-icon>
          </span>
          <span className="md-typescale-title-large">
            Scholar<span className="wordmark-accent">Hub</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Main">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`site-nav-link md-typescale-label-large${isActive(item.href) ? ' is-active' : ''}`}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-header-actions">
          <ThemeToggle />
          {session ? (
            <span className="account-anchor">
              <button
                id="account-button"
                type="button"
                className="avatar-button md-typescale-label-large"
                aria-label={`Account menu for ${session.name}`}
                onClick={() => setAccountOpen((o) => !o)}
              >
                <md-ripple />
                <md-focus-ring />
                {initials(session.name)}
              </button>
              <md-menu
                anchor="account-button"
                positioning="popover"
                open={accountOpen || undefined}
                onclosed={() => setAccountOpen(false)}
              >
                <md-menu-item type="text" disabled>
                  <div slot="headline">{session.name}</div>
                  <div slot="supporting-text">{session.email}</div>
                </md-menu-item>
                <md-divider />
                <md-menu-item onClick={() => router.push('/profile')}>
                  <md-icon slot="start">person</md-icon>
                  <div slot="headline">Profile</div>
                </md-menu-item>
                <md-menu-item onClick={() => router.push('/saved')}>
                  <md-icon slot="start">bookmark</md-icon>
                  <div slot="headline">Saved scholarships</div>
                </md-menu-item>
                <md-menu-item onClick={signOut}>
                  <md-icon slot="start">logout</md-icon>
                  <div slot="headline">Sign out</div>
                </md-menu-item>
              </md-menu>
            </span>
          ) : (
            <>
              <LinkButton href="/login" variant="text" className="hide-compact">
                Sign in
              </LinkButton>
              <LinkButton href="/register">Get started</LinkButton>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
