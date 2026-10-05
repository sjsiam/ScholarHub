"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { FilterSelect } from "@/components/filter-select";
import {
  ScholarshipCard,
  ScholarshipCardSkeleton,
} from "@/components/scholarship-card";
import { useScholarshipSearch } from "@/lib/hooks";
import { DEFAULT_FILTERS } from "@/lib/services/scholarship-service";
import type { ScholarshipFilters, SortOption } from "@/lib/types";
import { DEADLINE_OPTIONS, FilterPanel } from "./filter-panel";
import { Pagination } from "./pagination";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "deadline", label: "Deadline (soonest)" },
  { value: "amount", label: "Funding (highest)" },
  { value: "newest", label: "Recently added" },
  { value: "title", label: "Name (A–Z)" },
];

type FilterKey =
  | "country"
  | "degreeLevel"
  | "field"
  | "fundingType"
  | "deadlineWithinDays";
const FILTER_KEYS: FilterKey[] = [
  "country",
  "degreeLevel",
  "field",
  "fundingType",
  "deadlineWithinDays",
];

function chipLabel(key: FilterKey, value: string) {
  if (key === "deadlineWithinDays") {
    return DEADLINE_OPTIONS.find((o) => o.value === value)?.label ?? value;
  }
  return value;
}

export function ScholarshipExplorer() {
  const [filters, setFilters] = useState<ScholarshipFilters>(DEFAULT_FILTERS);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setFilters((f) => ({ ...f, query: q, page: 1 }));
  }, []);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const deferredFilters = useDeferredValue(filters);
  const { data, isLoading } = useScholarshipSearch(deferredFilters);

  const update = (patch: Partial<ScholarshipFilters>) =>
    setFilters((f) => ({ ...f, page: 1, ...patch }));
  const reset = () =>
    setFilters((f) => ({ ...DEFAULT_FILTERS, query: f.query, sort: f.sort }));

  const activeFilters = FILTER_KEYS.filter((k) => filters[k] !== "");

  function changePage(page: number) {
    setFilters((f) => ({ ...f, page }));
    document
      .getElementById("results-title")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="explorer">
      <div className="explorer-search">
        <md-outlined-text-field
          class="explorer-search-field"
          label="Search by name, organization, country or field"
          type="search"
          value={filters.query}
          oninput={(e: Event) =>
            update({ query: (e.target as HTMLInputElement).value })
          }
        >
          <md-icon slot="leading-icon">search</md-icon>
        </md-outlined-text-field>
        <md-outlined-button
          class="filters-toggle"
          aria-expanded={filtersOpen}
          aria-controls="filter-panel"
          onClick={() => setFiltersOpen((o) => !o)}
          has-icon
        >
          {activeFilters.length
            ? `Filters (${activeFilters.length})`
            : "Filters"}
          <md-icon slot="icon">tune</md-icon>
        </md-outlined-button>
      </div>

      <div className="explorer-body">
        <div
          id="filter-panel"
          className={`filter-panel-wrap${filtersOpen ? " is-open" : ""}`}
        >
          <md-outlined-card class="filter-card">
            <FilterPanel
              filters={filters}
              onChange={update}
              onReset={reset}
              activeCount={activeFilters.length}
            />
          </md-outlined-card>
        </div>

        <section className="explorer-results" aria-labelledby="results-title">
          <div className="results-toolbar">
            <h2
              id="results-title"
              className="md-typescale-title-medium"
              aria-live="polite"
            >
              {data
                ? `${data.total} scholarship${data.total === 1 ? "" : "s"} found`
                : "Loading scholarships"}
            </h2>
            <FilterSelect
              label="Sort by"
              className="sort-select"
              value={filters.sort}
              options={SORT_OPTIONS}
              onChange={(v) => update({ sort: v as SortOption })}
            />
          </div>

          {activeFilters.length ? (
            <md-chip-set aria-label="Active filters">
              {activeFilters.map((key) => (
                <md-input-chip
                  key={key}
                  label={chipLabel(key, filters[key])}
                  remove-only
                  onremove={(e: Event) => {
                    e.preventDefault();
                    update({ [key]: "" });
                  }}
                />
              ))}
            </md-chip-set>
          ) : null}

          {isLoading && !data ? (
            <div className="cards-grid results-grid">
              {Array.from({ length: 6 }, (_, i) => (
                <ScholarshipCardSkeleton key={i} />
              ))}
            </div>
          ) : data && data.items.length > 0 ? (
            <div className="cards-grid results-grid">
              {data.items.map((s) => (
                <ScholarshipCard key={s.id} scholarship={s} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="search_off"
              title="No scholarships match your filters"
              description="Try removing a filter or searching with a broader keyword."
              action={
                <md-filled-tonal-button
                  onClick={() => setFilters({ ...DEFAULT_FILTERS })}
                >
                  Clear search and filters
                </md-filled-tonal-button>
              }
            />
          )}

          {data ? (
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              onPageChange={changePage}
            />
          ) : null}
        </section>
      </div>
    </div>
  );
}
