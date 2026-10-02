'use client'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav className="pagination" aria-label="Pagination">
      <md-icon-button
        aria-label="Previous page"
        disabled={page <= 1 || undefined}
        onClick={() => onPageChange(page - 1)}
      >
        <md-icon>chevron_left</md-icon>
      </md-icon-button>
      {pages.map((p) =>
        p === page ? (
          <md-filled-tonal-button key={p} aria-current="page" class="page-button">
            {p}
          </md-filled-tonal-button>
        ) : (
          <md-text-button
            key={p}
            class="page-button"
            aria-label={`Page ${p}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </md-text-button>
        ),
      )}
      <md-icon-button
        aria-label="Next page"
        disabled={page >= totalPages || undefined}
        onClick={() => onPageChange(page + 1)}
      >
        <md-icon>chevron_right</md-icon>
      </md-icon-button>
    </nav>
  )
}
