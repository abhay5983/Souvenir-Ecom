import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useSearchParams,
} from "react-router-dom";

import PageHero from "../components/common/PageHero";
import SeriesCard from "../components/catalogue/SeriesCard";

import { useCatalogue } from "../context/CatalogueContext.jsx";

const FILTER_KEYS = [
  "query",
  "imprint",
  "category",
  "subject",
  "stage",
  "feature",
];

function getFiltersFromSearchParams(searchParams) {
  const filters = {};

  FILTER_KEYS.forEach((key) => {
    const parameterName =
      key === "query" ? "q" : key;

    const value = searchParams
      .get(parameterName)
      ?.trim();

    if (value && value !== "All") {
      filters[key] = value;
    }
  });

  return filters;
}

function matchesText(value, query) {
  return String(value ?? "")
    .toLocaleLowerCase()
    .includes(query.toLocaleLowerCase());
}

function searchCatalogue(catalogue, filters) {
  return catalogue.filter((series) => {
    if (!series.publicVisibility) {
      return false;
    }

    if (filters.query) {
      const queryMatches = [
        series.title,
        series.imprint,
        series.subject,
        series.category,
        series.stage,
        series.gradeRange,
        series.description,
        ...(series.digitalFeatures ?? []),
        ...(series.variants ?? []).flatMap((variant) => [
          variant.title,
          variant.level,
          variant.isbn,
        ]),
      ].some((value) => {
        return matchesText(value, filters.query);
      });

      if (!queryMatches) {
        return false;
      }
    }

    if (
      filters.imprint &&
      series.imprint !== filters.imprint
    ) {
      return false;
    }

    if (
      filters.category &&
      series.category !== filters.category
    ) {
      return false;
    }

    if (
      filters.subject &&
      series.subject !== filters.subject
    ) {
      return false;
    }

    if (
      filters.stage &&
      series.stage !== filters.stage
    ) {
      return false;
    }

    if (
      filters.feature &&
      !(series.digitalFeatures ?? []).includes(
        filters.feature,
      )
    ) {
      return false;
    }

    return true;
  });
}

function SelectFilter({
  name,
  label,
  options,
  value,
  onChange,
}) {
  return (
    <div className="form-field">
      <label htmlFor={`filter-${name}`}>
        {label}
      </label>

      <select
        id={`filter-${name}`}
        name={name}
        value={value ?? "All"}
        onChange={(event) => {
          onChange(name, event.target.value);
        }}
      >
        <option value="All">All</option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function BooksPage({
  authenticated = false,
}) {
  const { catalogue, meta: catalogueMeta, filters: catalogueFilters, loading, error } = useCatalogue();
  const { categories, features, imprints, stages, subjects } = catalogueFilters;
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [filtersOpen, setFiltersOpen] =
    useState(false);

  const filters = useMemo(() => {
    return getFiltersFromSearchParams(
      searchParams,
    );
  }, [searchParams]);

  const results = useMemo(() => {
    return searchCatalogue(catalogue, filters);
  }, [catalogue, filters]);

  const title = authenticated
    ? "Account catalogue"
    : "Explore our books";

  const body = authenticated
    ? "Browse account-visible series and verified catalogue MRP. Confidential net rates remain a service concern and are not fabricated in this prototype."
    : `Search ${catalogueMeta.publicSeriesCount} source-verified catalogue series. Verified book MRP is shown on series pages; partner rates require approval.`;

  function updateFilters(nextFilters) {
    const nextSearchParams =
      new URLSearchParams();

    if (nextFilters.query) {
      nextSearchParams.set(
        "q",
        nextFilters.query,
      );
    }

    [
      "imprint",
      "category",
      "subject",
      "stage",
      "feature",
    ].forEach((key) => {
      const value = nextFilters[key];

      if (value && value !== "All") {
        nextSearchParams.set(key, value);
      }
    });

    setSearchParams(nextSearchParams, {
      replace: true,
    });
  }

  function handleSearchChange(event) {
    const value = event.target.value;

    updateFilters({
      ...filters,
      query: value,
    });
  }

  function handleFilterChange(name, value) {
    const nextFilters = {
      ...filters,
    };

    if (!value || value === "All") {
      delete nextFilters[name];
    } else {
      nextFilters[name] = value;
    }

    updateFilters(nextFilters);
  }

  function clearFilters() {
    setSearchParams({}, { replace: true });
  }

  function openFilters() {
    setFiltersOpen(true);
  }

  function closeFilters() {
    setFiltersOpen(false);
  }

  useEffect(() => {
    document.body.classList.toggle(
      "menu-open",
      filtersOpen,
    );

    return () => {
      document.body.classList.remove(
        "menu-open",
      );
    };
  }, [filtersOpen]);

  useEffect(() => {
    if (!filtersOpen) {
      return undefined;
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        closeFilters();
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [filtersOpen]);

  const breadcrumbs = (
    <>
      <Link to="/">Home</Link>

      <span aria-hidden="true">/</span>

      <span>Books</span>
    </>
  );

  return (
    <>
      <PageHero
        eyebrow={
          authenticated
            ? "Your catalogue"
            : "Books & series"
        }
        title={title}
        body={body}
        breadcrumbs={breadcrumbs}
      />

      <section className="section compact">
        <div className="container">
          {loading && <div className="notice neutral">Loading catalogue...</div>}
          {error && <div className="notice danger">Catalogue could not be loaded: {error}</div>}
          <form
            className="catalogue-toolbar"
            id="catalogue-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
            }}
          >
            <label className="search-field">
              <span aria-hidden="true">⌕</span>

              <span className="sr-only">
                Search catalogue
              </span>

              <input
                name="query"
                type="search"
                value={filters.query ?? ""}
                placeholder="Search catalogue"
                autoComplete="off"
                onChange={handleSearchChange}
              />
            </label>

            <button
              className="button secondary filter-mobile-button"
              type="button"
              aria-expanded={filtersOpen}
              aria-controls="catalogue-filters"
              onClick={openFilters}
            >
              Filters
            </button>
          </form>

          <div className="catalogue-layout">
            <button
              className={`drawer-backdrop ${
                filtersOpen ? "open" : ""
              }`}
              type="button"
              tabIndex={-1}
              aria-label="Close catalogue filters"
              onClick={closeFilters}
            />

            <aside
              className={`filters ${
                filtersOpen ? "open" : ""
              }`}
              id="catalogue-filters"
              aria-label="Catalogue filters"
              aria-hidden={
                filtersOpen ? undefined : false
              }
              inert={!filtersOpen ? undefined : undefined}
              tabIndex={-1}
            >
              <div className="filters-header">
                <h2>Filter books</h2>

                <button
                  className="button ghost small"
                  type="button"
                  onClick={clearFilters}
                >
                  Clear all
                </button>
              </div>

              <SelectFilter
                name="imprint"
                label="Imprint"
                options={imprints}
                value={filters.imprint}
                onChange={handleFilterChange}
              />

              <SelectFilter
                name="category"
                label="Category"
                options={categories}
                value={filters.category}
                onChange={handleFilterChange}
              />

              <SelectFilter
                name="subject"
                label="Subject"
                options={subjects}
                value={filters.subject}
                onChange={handleFilterChange}
              />

              <SelectFilter
                name="stage"
                label="Learning stage"
                options={stages}
                value={filters.stage}
                onChange={handleFilterChange}
              />

              <SelectFilter
                name="feature"
                label="Digital feature"
                options={features}
                value={filters.feature}
                onChange={handleFilterChange}
              />

              <button
                className="button filter-mobile-button full-width"
                type="button"
                onClick={closeFilters}
              >
                Show {results.length} results
              </button>
            </aside>

            <div className="catalogue-results">
              <div className="results-head">
                <strong
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {results.length}{" "}
                  {results.length === 1
                    ? "series"
                    : "series"}
                </strong>

                <span>
                  {catalogueMeta.variantCount} verified
                  variants
                </span>
              </div>

              {results.length > 0 ? (
                <div className="series-grid">
                  {results.map((series) => (
                    <SeriesCard
                      key={series.id}
                      series={series}
                      authenticated={
                        authenticated
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <h2>No matching series</h2>

                  <p>
                    Try a broader search, remove a
                    filter or browse all categories and
                    subjects.
                  </p>

                  <button
                    className="button secondary"
                    type="button"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default BooksPage;
