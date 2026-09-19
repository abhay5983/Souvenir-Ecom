import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  helpGuides,
  helpFaqs,
  outreachForms,
  searchHelpContent,
} from "../services/help-centre.js";

import HelpGuideCard from "../components/help/HelpGuideCard.jsx";
import OutreachCard from "../components/help/OutreachCard.jsx";
import FaqCard from "../components/help/FaqCard.jsx";

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg
      className="help-line-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h16v13H9l-5 4zM8 9h8M8 13h5" />
    </svg>
  );
}

function highlightText(text, query) {
  const value = String(text ?? "");
  const search = query.trim();

  if (!search) {
    return value;
  }

  const lowerValue = value.toLowerCase();
  const lowerSearch = search.toLowerCase();

  const index = lowerValue.indexOf(lowerSearch);

  if (index === -1) {
    return value;
  }

  const before = value.slice(0, index);
  const match = value.slice(index, index + search.length);
  const after = value.slice(index + search.length);

  return (
    <>
      {before}
      <mark>{match}</mark>
      {after}
    </>
  );
}

function HelpSearchResults({ query }) {
  const results = useMemo(() => {
    if (!query.trim()) {
      return {
        guides: [],
        faqs: [],
        forms: [],
      };
    }

    return searchHelpContent(query);
  }, [query]);

  if (!query.trim()) {
    return null;
  }

  const count =
    results.guides.length +
    results.faqs.length +
    results.forms.length;

  if (!count) {
    return (
      <section
        className="help-search-results"
        aria-live="polite"
      >
        <div className="empty-state">
          <h2>No exact match</h2>

          <p>
            We could not find an exact match. Try another
            term or choose the most relevant outreach form
            below.
          </p>

          <a className="text-link" href="#outreach">
            View outreach forms{" "}
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>
    );
  }

  return (
    <section
      className="help-search-results"
      aria-live="polite"
      aria-label="Help search results"
    >
      <p className="results-count">
        {count} {count === 1 ? "result" : "results"}
      </p>

      {results.guides.length > 0 && (
        <div className="help-result-group">
          <h2>Guides</h2>

          {results.guides.map((guide) => (
            <Link
              key={guide.slug}
              to={`/help/guides/${guide.slug}`}
            >
              <strong>
                {highlightText(guide.title, query)}
              </strong>

              <span>
                {highlightText(guide.summary, query)}
              </span>
            </Link>
          ))}
        </div>
      )}

      {results.faqs.length > 0 && (
        <div className="help-result-group">
          <h2>FAQs</h2>

          {results.faqs.map((faq) => (
            <a key={faq.id} href={`#faq-${faq.id}`}>
              <strong>
                {highlightText(faq.question, query)}
              </strong>

              <span>
                {highlightText(faq.answer, query)}
              </span>
            </a>
          ))}
        </div>
      )}

      {results.forms.length > 0 && (
        <div className="help-result-group">
          <h2>Outreach Forms</h2>

          {results.forms.map((form) => (
            <Link
              key={form.slug}
              to={`/help/forms/${form.slug}`}
            >
              <strong>
                {highlightText(form.title, query)}
              </strong>

              <span>
                {highlightText(form.summary, query)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const featuredForms = useMemo(
    () => outreachForms.filter((form) => form.featured),
    [],
  );

  const secondaryForms = useMemo(
    () => outreachForms.filter((form) => !form.featured),
    [],
  );

  const handleSearchSubmit = (event) => {
    event.preventDefault();
  };

  const quickTopics = ["Orders", "Returns", "Digital resources", "Book issue"];

  return (
    <>
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="help-hero">
        <div className="container help-hero-inner">
          <div>
            <p className="eyebrow">
              SOUVENIR HELP CENTRE
            </p>

            <h1>How can we help?</h1>

            <p className="lede">
              Browse helpful guides or send your enquiry
              directly to the appropriate Souvenir team.
              Get support with books, editorial feedback,
              samples, orders, digital resources,
              authorship, school requirements and
              publishing partnerships.
            </p>

            <div className="hero-actions">
              <a className="button" href="#outreach">
                View Outreach Forms
              </a>

              <a
                className="text-link"
                href="#popular-guides"
              >
                Browse Popular Guides{" "}
                <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>

          <div
            className="help-hero-assurance"
            aria-label="Help Centre commitments"
          >
            <span>
              <MessageIcon />
            </span>

            <h2>Open to everyone</h2>

            <p>
              No Souvenir account is required for public
              outreach forms.
            </p>

            <ul className="check-list">
              <li>Clear routing</li>
              <li>Privacy-conscious forms</li>
              <li>No public ticket portal</li>
            </ul>
          </div>
        </div>
      </section>

      {/* =====================================================
          SEARCH
      ====================================================== */}

      <section className="section compact help-search-section">
        <div className="container">
          <form
            id="help-search-form"
            role="search"
            onSubmit={handleSearchSubmit}
          >
            <label className="search-field help-search">
              <span aria-hidden="true">
                <SearchIcon />
              </span>

              <span className="sr-only">
                Search guides, FAQs and support topics
              </span>

              <input
                id="help-search"
                name="helpQuery"
                type="search"
                value={searchQuery}
                placeholder="Search guides, FAQs and support topics"
                autoComplete="off"
                aria-controls="help-search-results"
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
              />
            </label>
          </form>

          <div id="help-search-results">
            <HelpSearchResults query={searchQuery} />
          </div>

          <div className="help-quick-topics" aria-label="Popular help topics">
            <span>Popular:</span>
            {quickTopics.map((topic) => <button key={topic} type="button" onClick={() => setSearchQuery(topic)}>{topic}</button>)}
            {searchQuery && <button className="help-clear-search" type="button" onClick={() => setSearchQuery("")}>Clear search</button>}
          </div>
        </div>
      </section>

      {/* =====================================================
          GUIDES
      ====================================================== */}

      <section
        className="section"
        id="popular-guides"
      >
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                GUIDES &amp; FAQs
              </p>

              <h2>Popular guides</h2>

              <p>
                Find clear information about Souvenir
                products, delivery, digital access and ordering
                before submitting an enquiry.
              </p>
            </div>
          </div>

          <div className="grid three help-guide-grid">
            {helpGuides.map((guide) => (
              <HelpGuideCard
                key={guide.slug}
                guide={guide}
              />
            ))}
          </div>

          {/* =================================================
              FAQ
          ================================================== */}

          <div
            className="faq-list help-faqs"
            id="faqs"
          >
            <h2>Frequently asked questions</h2>

            {helpFaqs.map((faq) => (
              <div
                key={faq.id}
                id={`faq-${faq.id}`}
              >
                <FaqCard faq={faq} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          OUTREACH
      ====================================================== */}

      <section
        className="section blue-tint"
        id="outreach"
      >
        <div className="container">
          <div className="section-heading outreach-heading">
            <div>
              <p className="eyebrow">
                PUBLIC OUTREACH FORMS
              </p>

              <h2>Reach the right Souvenir team</h2>

              <p>
                Choose the form that best matches your
                requirement. All forms are open to public
                visitors, and no Souvenir account is
                required.
              </p>
            </div>
          </div>

          <div className="notice neutral outreach-trust-note">
            <strong>Privacy note:</strong>{" "}
            Information is collected only to review and
            respond to your submission. Relevant contact
            details may be verified to protect educational
            resources, publishing rights and business
            records.
          </div>

          {/* Featured Forms */}

          <div className="grid three outreach-featured-grid">
            {featuredForms.map((form) => (
              <OutreachCard
                key={form.slug}
                definition={form}
              />
            ))}
          </div>

          {/* Secondary Forms */}

          <div className="section-heading secondary-outreach-heading">
            <div>
              <h2>More ways to contact Souvenir</h2>
            </div>
          </div>

          <div className="grid three outreach-secondary-grid">
            {secondaryForms.map((form) => (
              <OutreachCard
                key={form.slug}
                definition={form}
                compact
              />
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          GENERAL CONTACT
      ====================================================== */}

      <section className="section compact">
        <div className="container">
          <div className="help-contact-panel">
            <div>
              <p className="eyebrow">
                GENERAL CONTACT INFORMATION
              </p>

              <h2>Not sure where to begin?</h2>

              <p>
                Use the General Enquiry form and choose the
                closest topic. Never send a password, OTP,
                or complete payment-card details.
              </p>
            </div>

            <Link
              className="button secondary"
              to="/help/forms/general-enquiry"
            >
              Open General Enquiry
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default HelpPage;
