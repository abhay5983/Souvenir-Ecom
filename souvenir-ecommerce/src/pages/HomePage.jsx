import { Link } from "react-router-dom";

import { useCatalogue } from "../context/CatalogueContext.jsx";

import SeriesCard from "../components/catalogue/SeriesCard";

function HomePage() {
  const { catalogue, meta: catalogueMeta, filters } = useCatalogue();
  const featuredSeries = catalogue
    .filter((series) => {
      return series.featured && series.publicVisibility;
    })
    .slice(0, 4);

  const browseSubjects = filters.subjects.slice(0, 6);

  return (
    <>
      <section className="hero">
        <div
          className="hero-background"
          role="img"
          aria-label="Indian teacher standing with four school students in a bright classroom."
        />

        <div className="hero-inner container">
          <picture className="hero-mobile-picture">
            <source
              media="(max-width: 900px)"
              type="image/webp"
              srcSet="
                /assets/souvenir-classroom-hero-960.png 960w,
                /assets/souvenir-classroom-hero-1672.jpg 1672w
              "
              sizes="100vw"
            />

            <source
              media="(max-width: 900px)"
              type="image/jpeg"
              srcSet="
                /assets/souvenir-classroom-hero-960.jpg 960w,
                /assets/souvenir-classroom-hero-1672.jpg 1672w
              "
              sizes="100vw"
            />

            <img
              className="hero-mobile-image"
              src="/assets/souvenir-classroom-hero-960.jpg"
              srcSet="/assets/souvenir-classroom-hero-960.jpg 960w, /assets/souvenir-classroom-hero-1672.jpg 1672w"
              sizes="100vw"
              alt="Indian teacher standing with four school students in a bright classroom."
              width="1672"
              height="941"
              fetchPriority="high"
            />
          </picture>

          <div className="hero-copy">
            <p className="eyebrow">
              Redefining learning for a new generation
            </p>

            <h1>
              Learning, Reimagined for Every Classroom
            </h1>

            <p>
              Curriculum-aligned books, interactive resources
              and digital support designed to help teachers
              teach better and students learn with confidence.
            </p>

            <div className="hero-actions">
              <Link className="button" to="/books">
                Explore our books{" "}
                <span aria-hidden="true">→</span>
              </Link>

              <Link
                className="button secondary"
                to="/login"
              >
                Account holder login
              </Link>
            </div>

            <div
              className="trust-row"
              aria-label="Platform highlights"
            >
              <span>Curriculum aligned</span>
              <span>Print + digital</span>
              <span>School focused</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                Trusted educational solutions
              </p>

              <h2>
                Built around how classrooms learn
              </h2>

              <p>
                Clear programmes, useful teacher support
                and secure account services connect discovery
                with day-to-day adoption.
              </p>
            </div>
          </div>

          <div className="grid three">
            <article className="card value-card">
              <span
                className="card-icon"
                aria-hidden="true"
              >
                B
              </span>

              <h3>Thoughtful print programmes</h3>

              <p>
                Structured series across learning stages,
                subjects and curricula—presented clearly
                for educators and buyers.
              </p>
            </article>

            <article className="card value-card">
              <span
                className="card-icon"
                aria-hidden="true"
              >
                D
              </span>

              <h3>Digital support with purpose</h3>

              <p>
                E-books, audio, activities and teacher
                resources are linked to products and governed
                by access policy.
              </p>
            </article>

            <article className="card value-card">
              <span
                className="card-icon"
                aria-hidden="true"
              >
                A
              </span>

              <h3>Account-aware service</h3>

              <p>
                Schools, families and distributors can explore
                the catalogue, choose books and continue through
                a clear, guided ordering journey.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section muted home-catalogue-browse">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                Browse the catalogue
              </p>

              <h2>Start with the way you teach</h2>

              <p>
                Explore by learning stage or subject.
                Catalogue fields shown in this prototype
                remain in editorial review.
              </p>
            </div>

            <Link className="text-link" to="/books">
              View all books →
            </Link>
          </div>

          <div className="grid three browse-grid">
            {browseSubjects.map((subject) => (
              <Link
                className="category-card"
                key={subject}
                to={`/books?subject=${encodeURIComponent(
                  subject,
                )}`}
              >
                {subject}
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                Featured series
              </p>

              <h2>
                Learning journeys worth exploring
              </h2>

              <p>
                Selected source-verified families from the{" "}
                {catalogueMeta.title}. ISBNs and account
                pricing remain hidden from public cards.
              </p>
            </div>

            <Link
              className="button secondary small"
              to="/books"
            >
              Browse catalogue
            </Link>
          </div>

          <div className="series-grid">
            {featuredSeries.map((series) => (
              <SeriesCard
                key={series.id}
                series={series}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section blue-tint">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                Souvenir Digital
              </p>

              <h2>
                More than icons on a book cover
              </h2>

              <p>
                Digital features support specific teaching
                and learning moments. Access depends on role,
                entitlement and resource sensitivity.
              </p>
            </div>

            <Link
              className="text-link"
              to="/digital-learning"
            >
              Explore digital learning →
            </Link>
          </div>

          <div className="grid four digital-feature-grid">
            <article className="card feature-card">
              <span
                className="card-icon"
                aria-hidden="true"
              >
                ▶
              </span>

              <h3>Watch &amp; listen</h3>

              <p>
                Audio books, videos, speaking and listening
                practice.
              </p>
            </article>

            <article className="card feature-card">
              <span
                className="card-icon"
                aria-hidden="true"
              >
                ✦
              </span>

              <h3>Interact</h3>

              <p>
                Activities, QR-linked support and guided
                home learning.
              </p>
            </article>

            <article className="card feature-card">
              <span
                className="card-icon"
                aria-hidden="true"
              >
                ✓
              </span>

              <h3>Assess</h3>

              <p>
                Question banks, test-yourself tools and
                Exam Pro resources.
              </p>
            </article>

            <article className="card feature-card">
              <span
                className="card-icon"
                aria-hidden="true"
              >
                T
              </span>

              <h3>Teach</h3>

              <p>
                Controlled teacher resources and curriculum
                support.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                One platform, focused journeys
              </p>

              <h2>
                Designed for education partnerships
              </h2>
            </div>
          </div>

          <div className="grid three">
            <article className="card audience-card">
              <span className="status success">
                For schools
              </span>

              <h3 className="space-top-md">
                Evaluate, adopt and order
              </h3>

              <p>
                Request eligible samples, place approved
                orders and track school resources from one
                account.
              </p>
            </article>

            <article className="card audience-card">
              <span className="status success">
                For distributors
              </span>

              <h3 className="space-top-md">
                Order efficiently
              </h3>

              <p>
                Quick-order by SKU or ISBN, reuse saved lists
                and follow fulfilment across branches.
              </p>
            </article>

            <article className="card audience-card">
              <span className="status success">
                For educators
              </span>

              <h3 className="space-top-md">
                Find the right support
              </h3>

              <p>
                Discover teaching features and request
                resources through an authorized school
                relationship.
              </p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;
