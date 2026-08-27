import { Link } from "react-router-dom";

import PageHero from "../components/common/PageHero";

function AboutPage() {
  const priorities = [
    "Competency-based learning",
    "Foundational literacy & numeracy",
    "Teacher upskilling",
    "Assessment reform",
    "Learning outcomes",
    "Multidisciplinary thinking",
    "Value-based education",
    "Indian knowledge systems",
  ];

  return (
    <>
      <PageHero
        eyebrow="Souvenir Group · Since 1972"
        title="Five decades devoted to stronger learning"
        body="Souvenir Publishers is a legacy Indian education organisation with sustained contributions to curriculum development, pedagogy and institutional learning."
      />

      <section className="section about-legacy-section">
        <div className="container about-legacy">
          <div className="about-story">
            <p className="eyebrow">Our story</p>

            <h2>
              Built for continuity, scale and institutional
              trust
            </h2>

            <p className="lede">
              Established in 1972, Souvenir Publishers is a
              long-standing Indian education publishing
              institution focused on curriculum-aligned
              academic development.
            </p>

            <p>
              We create structured learning resources and
              teacher support systems grounded in national
              education frameworks. With an operational
              presence in India and academic partnerships in
              West Africa, we bring experience, reliability
              and a long-term view to education.
            </p>
          </div>

          <figure className="about-founder-quote">
            <blockquote>
              “Education must outlast generations. Our
              responsibility is not merely to publish books,
              but to strengthen the foundations of learning
              itself.”
            </blockquote>

            <figcaption>
              <strong>Late Shri O. P. Shastri</strong>

              <span>
                Founder, Souvenir Publishers · 1972
              </span>
            </figcaption>
          </figure>
        </div>

        <div
          className="container about-facts"
          aria-label="Souvenir at a glance"
        >
          <div>
            <strong>1972</strong>
            <span>Established in India</span>
          </div>

          <div>
            <strong>5+ decades</strong>
            <span>In education publishing</span>
          </div>

          <div>
            <strong>India</strong>
            <span>Operational presence</span>
          </div>

          <div>
            <strong>West Africa</strong>
            <span>Academic partnerships</span>
          </div>
        </div>
      </section>

      <section className="section blue-tint">
        <div className="container about-priorities">
          <div>
            <p className="eyebrow">
              National education priorities
            </p>

            <h2>
              Aligned with the direction of Indian education
            </h2>

            <p className="lede">
              Our work is closely aligned with NEP 2020 and
              NCF 2023, supporting learning that is
              purposeful, inclusive and connected to the
              classroom.
            </p>
          </div>

          <div
            className="about-priority-list"
            aria-label="Education priority areas"
          >
            {priorities.map((priority) => (
              <span key={priority}>{priority}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                Teacher-centric design
              </p>

              <h2>
                Empowering the people who make learning happen
              </h2>

              <p>
                We believe teacher empowerment is the
                strongest lever for education reform. Our
                resources are designed to strengthen everyday
                instruction as well as long-term teaching
                capability.
              </p>
            </div>
          </div>

          <div className="grid three about-pillars">
            <article className="card value-card">
              <span
                className="card-icon"
                aria-hidden="true"
              >
                01
              </span>

              <h3>Classroom readiness</h3>

              <p>
                Structured manuals, classroom-ready lesson
                frameworks, and clear assessment and feedback
                tools help teachers work with consistency and
                confidence.
              </p>
            </article>

            <article className="card value-card">
              <span
                className="card-icon"
                aria-hidden="true"
              >
                02
              </span>

              <h3>Teacher capacity building</h3>

              <p>
                Professional development, curriculum
                interpretation support, and classroom
                engagement strategies strengthen academic
                clarity and instructional effectiveness.
              </p>
            </article>

            <article className="card value-card">
              <span
                className="card-icon"
                aria-hidden="true"
              >
                03
              </span>

              <h3>Future readiness</h3>

              <p>
                Outcome-driven instruction, responsible
                educational technology, and culturally
                grounded, value-based teaching support
                long-term education goals.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section muted">
        <div className="container">
          <div className="section-heading about-recognition-heading">
            <div>
              <p className="eyebrow">
                Awards &amp; laurels
              </p>

              <h2>
                A continuing record of publishing recognition
              </h2>

              <p>
                The Souvenir Group profile records publishing
                and production honours across more than two
                decades, from 1999 through 2025.
              </p>
            </div>
          </div>

          <ol className="recognition-timeline">
            <li>
              <span className="recognition-year">
                2024–25
              </span>

              <div>
                <h3>Excellence in Book Production</h3>

                <p>
                  Recognition for <em>Prodigy Chemistry</em>{" "}
                  in 2025, and for{" "}
                  <em>Kalpvriksh Hindi Textbook</em> and{" "}
                  <em>Amber Semester Book</em> in 2024.
                </p>
              </div>
            </li>

            <li>
              <span className="recognition-year">
                2019–23
              </span>

              <div>
                <h3>
                  Primary &amp; upper-primary publishing
                </h3>

                <p>
                  Excellence in Book Production recognition
                  recorded in 2019, 2020, 2021 and 2023.
                </p>
              </div>
            </li>

            <li>
              <span className="recognition-year">
                2010–16
              </span>

              <div>
                <h3>Production excellence</h3>

                <p>
                  Best Production recognition in 2010,
                  followed by Excellence in Book Production
                  in 2016.
                </p>
              </div>
            </li>

            <li>
              <span className="recognition-year">
                1999–2009
              </span>

              <div>
                <h3>Early institutional laurels</h3>

                <p>
                  Distinguished Publishers in 1999; Best
                  Production recognition in 2000, 2001, 2006
                  and 2009; and Young Publisher of the Year
                  in 2001.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="section compact">
        <div className="container">
          <div className="cta-panel about-cta">
            <div>
              <p className="eyebrow eyebrow-light">
                Explore Souvenir
              </p>

              <h2>
                Find the right learning programme
              </h2>

              <p>
                Browse curriculum-aligned series or sign in
                to access Souvenir partner services.
              </p>
            </div>

            <div className="actions-row">
              <Link className="button green" to="/books">
                Explore books
              </Link>

              <Link
                className="button secondary"
                to="/login"
              >
                Partner login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default AboutPage;