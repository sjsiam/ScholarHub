import type { Metadata, Viewport } from 'next'
import { Roboto } from 'next/font/google'
import { MaterialWebLoader } from '@/components/material-web-loader'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { SnackbarProvider } from '@/components/snackbar-provider'
import './globals.css'
import './app.css'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'ScholarHub — Find Scholarships That Fit Your Future',
    template: '%s · ScholarHub',
  },
  description:
    'Discover, compare and track international scholarships by country, degree level, field of study and funding type.',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fef7ff' },
    { media: '(prefers-color-scheme: dark)', color: '#141218' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={roboto.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        {/* Apply stored theme before first paint to avoid a flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`,
          }}
        />
      </head>
      <body>
        <MaterialWebLoader />
        <SnackbarProvider>
          <div className="app-shell">
            <SiteHeader />
            <div className="app-content">{children}</div>
            <SiteFooter />
          </div>
        </SnackbarProvider>
      </body>
    </html>
  )
}
