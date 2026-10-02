import type { DetailedHTMLProps, HTMLAttributes } from 'react'

type MdElementProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  class?: string
  onchange?: (event: Event) => void
  oninput?: (event: Event) => void
  onclose?: (event: Event) => void
  onclosed?: (event: Event) => void
  onremove?: (event: Event) => void
  // Custom elements accept arbitrary kebab-case attributes (supporting-text, error-text, ...)
  [attribute: string]: unknown
}

type MdTag =
  | 'md-elevated-button'
  | 'md-filled-button'
  | 'md-filled-tonal-button'
  | 'md-outlined-button'
  | 'md-text-button'
  | 'md-icon-button'
  | 'md-filled-icon-button'
  | 'md-filled-tonal-icon-button'
  | 'md-outlined-icon-button'
  | 'md-fab'
  | 'md-icon'
  | 'md-filled-text-field'
  | 'md-outlined-text-field'
  | 'md-outlined-select'
  | 'md-filled-select'
  | 'md-select-option'
  | 'md-checkbox'
  | 'md-radio'
  | 'md-switch'
  | 'md-slider'
  | 'md-divider'
  | 'md-list'
  | 'md-list-item'
  | 'md-elevated-card'
  | 'md-filled-card'
  | 'md-outlined-card'
  | 'md-chip-set'
  | 'md-assist-chip'
  | 'md-filter-chip'
  | 'md-input-chip'
  | 'md-suggestion-chip'
  | 'md-dialog'
  | 'md-menu'
  | 'md-menu-item'
  | 'md-tabs'
  | 'md-primary-tab'
  | 'md-secondary-tab'
  | 'md-linear-progress'
  | 'md-circular-progress'
  | 'md-elevation'
  | 'md-ripple'
  | 'md-focus-ring'

declare module 'react' {
  namespace JSX {
    type MdIntrinsicElements = { [K in MdTag]: MdElementProps }
    interface IntrinsicElements extends MdIntrinsicElements {}
  }
}
