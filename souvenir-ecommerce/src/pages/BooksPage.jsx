import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useSearchParams,
} from "react-router-dom";

import PageHero from "../components/common/PageHero";
import CatalogueIcon from "../components/common/CatalogueIcon";
import SeriesCard from "../components/catalogue/SeriesCard";

import { useCatalogue } from "../context/CatalogueContext.jsx";

const FILTER_KEYS = [
  "query",
  "classLevel",
  "subject",
  "series",
  "resources",
  "sort",
];

const PARAMETER_NAMES = {
  query: "q",
  classLevel: "class",
};

function getFiltersFromSearchParams(searchParams) {
  const filters = {};

  FILTER_KEYS.forEach((key) => {
    const parameterName = PARAMETER_NAMES[key] ?? key;

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

function getVariantClassLevel(variant) {
  const savedLevel = String(variant.level ?? "").trim();
  if (savedLevel) return savedLevel;

  const match = String(variant.title ?? "").match(
    /\b(?:class|grade)\s*[-:]?\s*(nursery|lkg|ukg|[1-9]|1[0-2])\b/i,
  );
  if (!match) return "";

  const value = match[1].toUpperCase();
  return `Class ${value}`;
}

function getActiveFilterLabel(name, value) {
  if (name === "query") return `Search: ${value}`;
  if (name === "classLevel") return `Class: ${value}`;
  if (name === "subject") return `Subject: ${value}`;
  if (name === "series") return `Series: ${value}`;
  if (name === "resources") return value === "available" ? "Digital resources" : "Print only";
  if (name === "sort") return ({
    title: "Book name A–Z",
    "price-low": "Price: low to high",
    "price-high": "Price: high to low",
  })[value] ?? value;
  return value;
}

function searchCatalogue(catalogue, filters) {
  const filtered = catalogue.filter((series) => {
    if (!series.publicVisibility) {
      return false;
    }

    if (filters.query) {
      const queryMatches = [
        series.title,
        series.subject,
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
      filters.classLevel &&
      !(series.variants ?? []).some(
        (variant) => getVariantClassLevel(variant) === filters.classLevel,
      )
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
      filters.series &&
      series.title !== filters.series
    ) {
      return false;
    }

    if (
      filters.resources === "available" &&
      !series.hasResources
    ) {
      return false;
    }

    if (
      filters.resources === "print-only" &&
      series.hasResources
    ) {
      return false;
    }

    return true;
  });

  if (filters.sort === "title") {
    return [...filtered].sort((left, right) =>
      left.title.localeCompare(right.title, undefined, { sensitivity: "base" }),
    );
  }

  if (filters.sort === "price-low" || filters.sort === "price-high") {
    const minimumPrice = (series) => Math.min(
      ...(series.variants ?? []).map((variant) => variant.priceINR).filter(Number.isFinite),
      Number.MAX_SAFE_INTEGER,
    );
    const direction = filters.sort === "price-low" ? 1 : -1;
    return [...filtered].sort((left, right) =>
      (minimumPrice(left) - minimumPrice(right)) * direction,
    );
  }

  return filtered;
}

function SelectFilter({
  name,
  label,
  options,
  value,
  onChange,
  formatOption = (option) => option,
  allLabel = "All",
  icon = "filters",
}) {
  return (
    <div className="form-field">
      <label htmlFor={`filter-${name}`}>
        <span className="filter-label"><CatalogueIcon name={icon} />{label}</span>
      </label>

      <select
        id={`filter-${name}`}
        name={name}
        value={value ?? "All"}
        onChange={(event) => {
          onChange(name, event.target.value);
        }}
      >
        <option value="All">{allLabel}</option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {formatOption(option)}
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
  const { subjects } = catalogueFilters;
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

  const classLevels = useMemo(() => [...new Set(
    catalogue.flatMap((series) =>
      (series.variants ?? []).map(getVariantClassLevel).filter(Boolean),
    ),
  )].sort((left, right) => left.localeCompare(right, undefined, { numeric: true })), [catalogue]);

  const seriesOptions = useMemo(() => [...new Set(
    catalogue.map((series) => series.title).filter(Boolean),
  )].sort((left, right) => left.localeCompare(right, undefined, { sensitivity: "base" })), [catalogue]);

  const visibleBookCount = useMemo(() => results.reduce(
    (total, series) => total + (series.variants?.length ?? 0),
    0,
  ), [results]);

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

    ["classLevel", "subject", "series", "resources", "sort"].forEach((key) => {
      const value = nextFilters[key];

      if (value && value !== "All") {
        nextSearchParams.set(PARAMETER_NAMES[key] ?? key, value);
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

  function removeFilter(name) {
    handleFilterChange(name, "All");
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
              <span aria-hidden="true"><CatalogueIcon name="search" /></span>

              <span className="sr-only">
                Search catalogue
              </span>

              <input
                name="query"
                type="search"
                value={filters.query ?? ""}
                placeholder="Search by book, series, subject or ISBN"
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
              <CatalogueIcon name="filters" /> Filters
            </button>
          </form>

          {Object.keys(filters).length > 0 && (
            <div className="active-catalogue-filters" aria-label="Active catalogue filters">
              {Object.entries(filters).map(([name, value]) => (
                <button
                  className="active-filter-chip"
                  type="button"
                  key={name}
                  onClick={() => removeFilter(name)}
                  aria-label={`Remove ${getActiveFilterLabel(name, value)} filter`}
                >
                  {getActiveFilterLabel(name, value)} <span aria-hidden="true">×</span>
                </button>
              ))}
              <button className="clear-filter-link" type="button" onClick={clearFilters}>Clear all</button>
            </div>
          )}

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
                <h2><CatalogueIcon name="filters" /> Filter books</h2>

                <button
                  className="button ghost small"
                  type="button"
                  onClick={clearFilters}
                >
                  Clear all
                </button>
              </div>

              {classLevels.length > 0 && (
                <SelectFilter
                  name="classLevel"
                  label="Class/Grade"
                  options={classLevels}
                  value={filters.classLevel}
                  onChange={handleFilterChange}
                  allLabel="All classes"
                  icon="class"
                />
              )}

              <SelectFilter
                name="subject"
                label="Subject"
                options={subjects}
                value={filters.subject}
                onChange={handleFilterChange}
                allLabel="All subjects"
                icon="subject"
                formatOption={(option) => option.trim().toLowerCase() === "amber" ? "Semester Series" : option}
              />

              <SelectFilter
                name="series"
                label="Series"
                options={seriesOptions}
                value={filters.series}
                onChange={handleFilterChange}
                allLabel="All series"
                icon="series"
              />

              <SelectFilter
                name="resources"
                label="Resource availability"
                options={["available", "print-only"]}
                value={filters.resources}
                onChange={handleFilterChange}
                allLabel="All books"
                icon="resources"
                formatOption={(option) => option === "available" ? "Digital resources available" : "Print only"}
              />

              <SelectFilter
                name="sort"
                label="Sort by"
                options={["title", "price-low", "price-high"]}
                value={filters.sort}
                onChange={handleFilterChange}
                allLabel="Recommended order"
                icon="sort"
                formatOption={(option) => ({
                  title: "Book name A–Z",
                  "price-low": "Price: low to high",
                  "price-high": "Price: high to low",
                })[option]}
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
                  <CatalogueIcon name="books" />
                  {results.length}{" "}
                  {results.length === 1
                    ? "series"
                    : "series"}
                </strong>

                <span>{visibleBookCount} books available</span>
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
                    filter or browse all classes and
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
