'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

const SUGGESTIONS = ['Computer Science', 'Germany', 'Full funding', 'PhD']

export function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function search(q: string) {
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    router.push(`/scholarships${params.size ? `?${params}` : ''}`)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    search(query)
  }

  return (
    <div className="hero-search">
      <form className="hero-search-form" role="search" onSubmit={handleSubmit}>
        <md-outlined-text-field
          class="hero-search-field"
          label="Search scholarships"
          placeholder="Try “data science in Germany”"
          value={query}
          oninput={(e: Event) => setQuery((e.target as HTMLInputElement).value)}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key !== 'Enter' || e.nativeEvent.isComposing || e.keyCode === 229) return
            e.preventDefault()
            search(query)
          }}
        >
          <md-icon slot="leading-icon">search</md-icon>
        </md-outlined-text-field>
        <md-filled-button type="submit" class="hero-search-button">
          Search
        </md-filled-button>
      </form>
      <md-chip-set aria-label="Popular searches">
        {SUGGESTIONS.map((s) => (
          <md-suggestion-chip key={s} label={s} onClick={() => search(s)} />
        ))}
      </md-chip-set>
    </div>
  )
}
