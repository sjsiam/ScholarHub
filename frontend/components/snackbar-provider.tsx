'use client'

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

interface SnackbarAction {
  label: string
  onAction: () => void
}

interface SnackbarState {
  id: number
  message: string
  action?: SnackbarAction
}

const SnackbarContext = createContext<(message: string, action?: SnackbarAction) => void>(() => {})

export function useSnackbar() {
  return useContext(SnackbarContext)
}

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const show = useCallback((message: string, action?: SnackbarAction) => {
    clearTimeout(timer.current)
    setSnackbar({ id: Date.now(), message, action })
    timer.current = setTimeout(() => setSnackbar(null), 4000)
  }, [])

  return (
    <SnackbarContext.Provider value={show}>
      {children}
      <div className="snackbar-region" role="status" aria-live="polite">
        {snackbar ? (
          <div className="snackbar" key={snackbar.id}>
            <span className="md-typescale-body-medium">{snackbar.message}</span>
            {snackbar.action ? (
              <md-text-button
                class="snackbar-action"
                onClick={() => {
                  snackbar.action?.onAction()
                  setSnackbar(null)
                }}
              >
                {snackbar.action.label}
              </md-text-button>
            ) : null}
          </div>
        ) : null}
      </div>
    </SnackbarContext.Provider>
  )
}
