'use client'

interface Option {
  value: string
  label: string
}

interface FilterSelectProps {
  label: string
  value: string
  options: readonly Option[]
  onChange: (value: string) => void
  allLabel?: string
  className?: string
  required?: boolean
}

export function FilterSelect({
  label,
  value,
  options,
  onChange,
  allLabel,
  className,
  required,
}: FilterSelectProps) {
  return (
    <md-outlined-select
      label={label}
      value={value}
      class={className}
      required={required || undefined}
      onchange={(e: Event) => onChange((e.target as HTMLSelectElement).value)}
    >
      {allLabel !== undefined ? (
        <md-select-option value="" selected={value === '' || undefined}>
          <div slot="headline">{allLabel}</div>
        </md-select-option>
      ) : null}
      {options.map((o) => (
        <md-select-option key={o.value} value={o.value} selected={value === o.value || undefined}>
          <div slot="headline">{o.label}</div>
        </md-select-option>
      ))}
    </md-outlined-select>
  )
}

export const toOptions = (values: readonly string[]): Option[] =>
  values.map((v) => ({ value: v, label: v }))
