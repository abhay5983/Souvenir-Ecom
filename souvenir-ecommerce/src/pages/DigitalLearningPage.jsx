import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { AUTH_UI_ENABLED } from "../config/features.js";
import { ecommerceService } from "../services/ecommerceService.js";

const digitalResources = [
  {
    code: "EBOOK",
    displayName: "E-Book",
    shortDescription:
      "Read a supported Souvenir title in a secure digital format. Access may be a preview, selected chapters or time-bound full-book access.",
    audience:
      "Students · Educators · Approved Partners",
    category: "LEARN",
    teacherTool: false,
    physicalResource: false,
  },
  {
    code: "AUDIO_BOOK",
    displayName: "Audio Book",
    shortDescription:
      "Listen to narrated lessons, stories, pronunciation support and chapter-linked audio for supported titles.",
    audience: "Students · Educators",
    category: "LEARN",
    teacherTool: false,
    physicalResource: false,
  },
  {
    code: "PODCAST",
    displayName: "Podcast",
    shortDescription:
      "Explore short audio explainers, listening episodes, stories and series-linked learning discussions.",
    audience: "Students · Educators",
    category: "LEARN",
    teacherTool: false,
    physicalResource: false,
  },
  {
    code: "VIDEO",
    displayName: "Videos",
    shortDescription:
      "Watch chapter-linked concept explanations, demonstrations, experiments, stories and animated learning videos.",
    audience: "Students · Educators",
    category: "LEARN",
    teacherTool: false,
    physicalResource: false,
  },
  {
    code: "INTERACTIVE_ACTIVITY",
    displayName: "Interactive Activities",
    shortDescription:
      "Learn through clickable exercises, games, guided practice and activity-based reinforcement.",
    audience: "Students · Educators",
    category: "PRACTISE",
    teacherTool: false,
    physicalResource: false,
  },
  {
    code: "QUIZ",
    displayName: "Quiz",
    shortDescription:
      "Use short topic- or chapter-based quizzes for quick practice and feedback where available.",
    audience: "Students · Educators",
    category: "PRACTISE",
    teacherTool: false,
    physicalResource: false,
  },
  {
    code: "TEST_YOURSELF",
    displayName: "Test Yourself",
    shortDescription:
      "Check understanding through self-paced questions, MCQ practice and instant scores for supported series.",
    audience: "Students · Educators",
    category: "PRACTISE",
    teacherTool: false,
    physicalResource: false,
  },
  {
    code: "QUESTION_BANK",
    displayName: "Question Bank",
    shortDescription:
      "Access curated chapter-wise questions. Student-safe and educator editions may differ.",
    audience: "Availability depends on version",
    category: "ASSESS",
    teacherTool: false,
    physicalResource: false,
  },
  {
    code: "TEACHER_RESOURCE",
    displayName: "Teacher Resources",
    shortDescription:
      "Lesson plans, teaching notes, worksheets, presentation aids and implementation guidance for verified educators.",
    audience: "Verified Educators",
    category: "TEACH",
    teacherTool: true,
    physicalResource: false,
  },
  {
    code: "QUESTION_PAPER_GENERATOR",
    displayName: "Question Paper Generator",
    shortDescription:
      "Create customised question papers by class, chapter, question type and difficulty.",
    audience: "Verified Educators",
    category: "ASSESS",
    teacherTool: true,
    physicalResource: false,
  },
  {
    code: "EXAM_PRO",
    displayName: "Exam Pro",
    shortDescription:
      "Use structured assessment, revision and examination tools for academic planning.",
    audience: "Verified Educators",
    category: "ASSESS",
    teacherTool: true,
    physicalResource: false,
  },
  {
    code: "ANSWER_KEY",
    displayName: "Answer Key",
    shortDescription:
      "Access verified solutions, marking guidance and answer support after educator verification.",
    audience: "Verified Educators",
    category: "TEACH",
    teacherTool: true,
    physicalResource: false,
  },
  {
    code: "OFFLINE_SMARTBOARD_PENDRIVE",
    displayName:
      "Offline Smart Board Pen Drive",
    shortDescription:
      "Request a licensed offline package for a compatible smart board or interactive panel.",
    audience:
      "Schools · Educators · Authorised Partners",
    category: "TEACH",
    teacherTool: false,
    physicalResource: true,
  },
];

const learningGroups = [
  {
    number: "01",
    title: "Learn and revisit",
    description:
      "E-books, audio books, podcasts and videos help learners return to a lesson in the format that works best for them.",
    chips: [
      "E-Book",
      "Audio Book",
      "Podcast",
      "Videos",
    ],
  },
  {
    number: "02",
    title: "Practise and understand",
    description:
      "Interactive activities, quizzes and Test Yourself exercises provide guided practice, revision and feedback.",
    chips: [
      "Interactive Activities",
      "Quiz",
      "Test Yourself",
    ],
  },
  {
    number: "03",
    title: "Assess and plan",
    description:
      "Question banks and verified assessment tools help educators prepare structured evaluations.",
    chips: [
      "Question Bank",
      "Exam Pro",
      "Question Paper Generator",
    ],
    teacherTool: true,
  },
  {
    number: "04",
    title: "Teach and present",
    description:
      "Teaching notes, answer support and licensed offline smart-board packages help educators plan and present.",
    chips: [
      "Teacher Resources",
      "Answer Key",
      "Offline Pen Drive",
    ],
  },
];

function FaqItem({ question, answer }) {
  return (
    <details className="card faq-card">
      <summary>{question}</summary>
      <p>{answer}</p>
    </details>
  );
}

function ResourceModal({ mode, onClose }) {
  const teacherMode = mode === "teacher";
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("All");
  const [series, setSeries] = useState("All");
  const [feature, setFeature] = useState("All");
  const [sortBy, setSortBy] = useState("title");
  const [isbn, setIsbn] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [teacherUnlocked, setTeacherUnlocked] = useState(false);
  const [selectedStudentBook, setSelectedStudentBook] = useState(null);
  const [studentIsbn, setStudentIsbn] = useState("");
  const [loading, setLoading] = useState(!teacherMode);
  const [error, setError] = useState("");

  useEffect(() => {
    function closeOnEscape(event) { if (event.key === "Escape") onClose(); }
    document.body.classList.add("menu-open");
    window.addEventListener("keydown", closeOnEscape);
    if (!teacherMode) {
      ecommerceService.studentResources()
        .then((payload) => setBooks(payload.books ?? []))
        .catch((requestError) => setError(requestError.message))
        .finally(() => setLoading(false));
    }
    return () => {
      document.body.classList.remove("menu-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose, teacherMode]);

  const subjects = useMemo(() => [...new Set(books.map((book) => book.subject).filter(Boolean))].sort(), [books]);
  const seriesOptions = useMemo(() => [...new Set(books.map((book) => book.series).filter(Boolean))].sort(), [books]);
  const features = useMemo(() => [...new Set(books.flatMap((book) => book.digitalFeatures ?? []))].sort(), [books]);
  const filteredBooks = useMemo(() => {
    const search = query.trim().toLowerCase();
    const normalizedSearch = search.replace(/[\s-]/g, "");
    return books.filter((book) => {
      const matchesSubject = subject === "All" || book.subject === subject;
      const matchesSeries = series === "All" || book.series === series;
      const matchesFeature = feature === "All" || (book.digitalFeatures ?? []).includes(feature);
      const matchesSearch = !search || [book.title, book.series, book.subject, book.isbn]
        .some((value) => {
          const candidate = String(value ?? "").toLowerCase();
          return candidate.includes(search) || candidate.replace(/[\s-]/g, "").includes(normalizedSearch);
        });
      return matchesSubject && matchesSeries && matchesFeature && matchesSearch;
    }).sort((left, right) => {
      const compare = (first, second) => String(first ?? "").localeCompare(String(second ?? ""));
      if (sortBy === "series") return compare(left.series, right.series) || compare(left.title, right.title);
      if (sortBy === "subject") return compare(left.subject, right.subject) || compare(left.title, right.title);
      return compare(left.title, right.title);
    });
  }, [books, feature, query, series, sortBy, subject]);

  const filtersActive = Boolean(query || subject !== "All" || series !== "All" || feature !== "All");

  function clearFilters() {
    setQuery("");
    setSubject("All");
    setSeries("All");
    setFeature("All");
  }

  async function openTeacherResource(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await ecommerceService.teacherResource(isbn, teacherPassword);
      if (result.accessMode === "CATALOGUE") {
        setBooks(result.books ?? []);
        setTeacherUnlocked(true);
        setLoading(false);
        return;
      }
      window.location.assign(result.resourceUrl);
    } catch (requestError) {
      setError(requestError.message);
      setLoading(false);
    }
  }

  async function openStudentResource(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await ecommerceService.studentResourceAccess(selectedStudentBook.isbn, studentIsbn);
      window.location.assign(result.resourceUrl);
    } catch (requestError) {
      setError(requestError.message);
      setLoading(false);
    }
  }

  return (
    <div className="resource-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={`resource-modal${teacherMode ? " teacher-resource-modal" : ""}${teacherUnlocked ? " teacher-catalogue-modal" : ""}`} role="dialog" aria-modal="true" aria-labelledby="resource-modal-title">
        <button className="resource-modal-close" type="button" aria-label="Close resource finder" onClick={onClose}>×</button>
        <header className="resource-modal-header">
          <p className="eyebrow">{teacherMode ? "Teacher access" : "Student resources"}</p>
          <h2 id="resource-modal-title">{teacherMode ? teacherUnlocked ? "Teacher resource catalogue" : "Find resources by ISBN" : "Find your book"}</h2>
          <p>{teacherMode ? teacherUnlocked ? "Search or filter the available books, then open the required teacher resources." : "Use the ISBN on your book to open its complete teacher resource collection." : "Search the catalogue or narrow the results using the filters below."}</p>
        </header>
        {teacherMode ? (
          teacherUnlocked ? <>
            <button className="text-link resource-back-button" type="button" onClick={() => { setTeacherUnlocked(false); setBooks([]); setIsbn(""); setTeacherPassword(""); clearFilters(); }}>← Back to ISBN access</button>
            <div className="resource-search-field form-field">
              <label htmlFor="teacher-resource-search">Search teacher resources</label>
              <div className="resource-search-input"><input id="teacher-resource-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by book, series, subject or ISBN" autoFocus />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search">×</button>}</div>
            </div>
            <div className="resource-filters teacher-resource-filters" aria-label="Teacher resource filters">
              <div className="form-field"><label htmlFor="teacher-resource-subject">Subject</label><select id="teacher-resource-subject" value={subject} onChange={(event) => setSubject(event.target.value)}><option value="All">All subjects</option>{subjects.map((item) => <option key={item}>{item}</option>)}</select></div>
              <div className="form-field"><label htmlFor="teacher-resource-series">Series</label><select id="teacher-resource-series" value={series} onChange={(event) => setSeries(event.target.value)}><option value="All">All series</option>{seriesOptions.map((item) => <option key={item}>{item}</option>)}</select></div>
              <div className="form-field"><label htmlFor="teacher-resource-sort">Sort by</label><select id="teacher-resource-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="title">Book title</option><option value="series">Series</option><option value="subject">Subject</option></select></div>
            </div>
            <div className="resource-results-bar" aria-live="polite"><span><strong>{filteredBooks.length}</strong> {filteredBooks.length === 1 ? "book" : "books"} found</span>{filtersActive && <button type="button" onClick={clearFilters}>Clear all filters</button>}</div>
            <div className="resource-book-list teacher-resource-book-list">{filteredBooks.map((book) => <article className="resource-book-result" key={book.isbn}>{book.coverPhotoLink ? <img src={book.coverPhotoLink} alt="" loading="lazy" /> : <div className="resource-cover-placeholder" aria-hidden="true">{book.title.slice(0, 1)}</div>}<div className="resource-book-copy"><small>{book.subject}</small><h3>{book.title}</h3><p>{book.series}</p></div><button className="button small" type="button" onClick={() => window.location.assign(book.resourceUrl)}>Open resources</button></article>)}{!filteredBooks.length && <div className="empty-state resource-empty-state"><h3>No matching books</h3><p>Try a shorter search or remove one of the filters.</p>{filtersActive && <button className="button secondary small" type="button" onClick={clearFilters}>Clear all filters</button>}</div>}</div>
          </> : <form className="teacher-resource-form" onSubmit={openTeacherResource}>
            <div className="teacher-isbn-guide" aria-hidden="true"><span>ISBN</span><i /></div>
            {error && <div className="notice danger" role="alert">{error}</div>}
            <div className="form-field">
              <label htmlFor="teacher-isbn">Book ISBN</label>
              <input id="teacher-isbn" value={isbn} onChange={(event) => { setIsbn(event.target.value); setError(""); }} inputMode="numeric" autoComplete="off" placeholder="For example, 9781234567890" aria-describedby="teacher-isbn-help" autoFocus required />
              <small id="teacher-isbn-help">You’ll find the 10 or 13-digit ISBN above the barcode on the back cover.</small>
            </div>
            <div className="form-field">
              <label htmlFor="teacher-password">Password</label>
              <input id="teacher-password" type="password" value={teacherPassword} onChange={(event) => { setTeacherPassword(event.target.value); setError(""); }} inputMode="numeric" autoComplete="off" placeholder="Enter teacher password" required />
            </div>
            <button className="button green full-width" type="submit" disabled={loading}>{loading ? "Checking ISBN..." : "Explore teacher resources"}</button>
          </form>
        ) : (
          <>
            {selectedStudentBook ? (
              <form className="student-resource-access teacher-resource-form" onSubmit={openStudentResource}>
                <button className="text-link resource-back-button" type="button" onClick={() => { setSelectedStudentBook(null); setStudentIsbn(""); setError(""); }}>← Back to books</button>
                <div className="student-access-book">
                  {selectedStudentBook.coverPhotoLink ? <img src={selectedStudentBook.coverPhotoLink} alt="" /> : <div className="resource-cover-placeholder" aria-hidden="true">{selectedStudentBook.title.slice(0, 1)}</div>}
                  <div><small>{selectedStudentBook.subject}</small><h3>{selectedStudentBook.title}</h3><p>{selectedStudentBook.series}</p></div>
                </div>
                <p>Enter the ISBN printed on this book to unlock its student resources.</p>
                {error && <div className="notice danger" role="alert">{error}</div>}
                <div className="form-field">
                  <label htmlFor="student-isbn">Book ISBN</label>
                  <input id="student-isbn" value={studentIsbn} onChange={(event) => { setStudentIsbn(event.target.value); setError(""); }} inputMode="numeric" autoComplete="off" placeholder="Enter ISBN-10 or ISBN-13" autoFocus required />
                  <small>You’ll find it above the barcode on the back cover.</small>
                </div>
                <button className="button green full-width" type="submit" disabled={loading}>{loading ? "Checking ISBN..." : "Unlock student resources"}</button>
              </form>
            ) : (
              <>
                <div className="resource-search-field form-field">
                  <label htmlFor="resource-search">Search the catalogue</label>
                  <div className="resource-search-input">
                    <input id="resource-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by book, series, subject or ISBN" autoFocus />
                    {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search">×</button>}
                  </div>
                </div>
                <div className="resource-filters" aria-label="Book filters">
                  <div className="form-field"><label htmlFor="resource-subject">Subject</label><select id="resource-subject" value={subject} onChange={(event) => setSubject(event.target.value)}><option value="All">All subjects</option>{subjects.map((item) => <option key={item}>{item}</option>)}</select></div>
                  <div className="form-field"><label htmlFor="resource-series">Series</label><select id="resource-series" value={series} onChange={(event) => setSeries(event.target.value)}><option value="All">All series</option>{seriesOptions.map((item) => <option key={item}>{item}</option>)}</select></div>
                  <div className="form-field"><label htmlFor="resource-feature">Resource type</label><select id="resource-feature" value={feature} onChange={(event) => setFeature(event.target.value)}><option value="All">All resources</option>{features.map((item) => <option key={item}>{item}</option>)}</select></div>
                  <div className="form-field"><label htmlFor="resource-sort">Sort by</label><select id="resource-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="title">Book title</option><option value="series">Series</option><option value="subject">Subject</option></select></div>
                </div>
                {error && <div className="notice danger" role="alert">{error}</div>}
                {loading ? <div className="notice neutral">Loading books...</div> : (
                  <><div className="resource-results-bar" aria-live="polite"><span><strong>{filteredBooks.length}</strong> {filteredBooks.length === 1 ? "book" : "books"} found</span>{filtersActive && <button type="button" onClick={clearFilters}>Clear all filters</button>}</div>
                    <div className="resource-book-list">{filteredBooks.map((book) => <article className="resource-book-result" key={book.isbn}>{book.coverPhotoLink ? <img src={book.coverPhotoLink} alt="" loading="lazy" /> : <div className="resource-cover-placeholder" aria-hidden="true">{book.title.slice(0, 1)}</div>}<div className="resource-book-copy"><small>{book.subject}</small><h3>{book.title}</h3><p>{book.series}</p>{!!book.digitalFeatures?.length && <div className="resource-feature-chips">{book.digitalFeatures.slice(0, 3).map((item) => <span key={item}>{item}</span>)}</div>}</div><button className="button small" type="button" onClick={() => { setSelectedStudentBook(book); setStudentIsbn(""); setError(""); }}>Explore resources</button></article>)}{!filteredBooks.length && <div className="empty-state resource-empty-state"><h3>No matching books</h3><p>Try a shorter search or remove one of the filters.</p>{filtersActive && <button className="button secondary small" type="button" onClick={clearFilters}>Clear all filters</button>}</div>}</div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function DigitalLearningPage() {
  const [resourceMode, setResourceMode] = useState(null);
  return (
    <>
      <section className="page-hero digital-page-hero">
        <div className="container">
          <p className="eyebrow">
            Souvenir Digital
          </p>

          <h1>
            Print at the centre. Digital where
            it helps.
          </h1>

          <p className="lede">
            Explore series-linked e-books,
            audio, podcasts, videos,
            interactive practice, assessment
            tools, teacher support and offline
            smart-board resources.
          </p>

          <div className="hero-actions">
            <Link
              className="button green"
              to="/digital-learning/request"
            >
              Request a Digital Resource
            </Link>
      
            <button className="button secondary" type="button" onClick={() => setResourceMode("student")}>
              Explore the Resources
            </button>

            <button className="button green" type="button" onClick={() => setResourceMode("teacher")}>
              Explore Resources as Teacher
            </button>
          </div>

          <p className="availability-note">
            <span aria-hidden="true">✓</span>

            Resource availability varies by
            series, class, user role and
            licence. Every request is verified
            before fulfilment.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                Purposeful support
              </p>

              <h2>
                Digital support with a clear
                learning purpose
              </h2>
            </div>
          </div>

          <div className="grid four digital-value-grid">
            {learningGroups.map((group) => (
              <article
                key={group.number}
                className="card feature-card"
              >
                <span
                  className="card-icon"
                  aria-hidden="true"
                >
                  {group.number}
                </span>

                <h3>{group.title}</h3>

                <p>{group.description}</p>

                <div className="chips">
                  {group.chips.map((chip) => (
                    <span
                      key={chip}
                      className="chip"
                    >
                      {chip}
                    </span>
                  ))}
                </div>

                {group.teacherTool && (
                  <span className="resource-badge teacher">
                    Teacher’s Tools apply
                  </span>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="section muted"
        id="digital-resource-library"
      >
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                Digital resource library
              </p>

              <h2>
                One series. Multiple ways to
                learn and teach.
              </h2>

              <p>
                Explore what each resource
                provides, then submit a verified
                request for the relevant series
                and class.
              </p>
            </div>
          </div>

          <div className="digital-resource-grid">
            {digitalResources.map(
              (resource, index) => (
                <article
                  key={resource.code}
                  className="card digital-resource-card"
                >
                  <div className="digital-resource-card-head">
                    <span
                      className="resource-icon"
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(
                        2,
                        "0",
                      )}
                    </span>

                    {resource.teacherTool && (
                      <span className="resource-badge teacher">
                        Teacher’s Tool
                      </span>
                    )}

                    {resource.physicalResource && (
                      <span className="resource-badge offline">
                        Licensed offline
                        resource
                      </span>
                    )}
                  </div>

                  <h3>
                    {resource.displayName}
                  </h3>

                  <p>
                    {resource.shortDescription}
                  </p>

                  <div className="resource-card-foot">
                    <span>
                      {resource.audience}
                    </span>

                    <small>
                      Series and class
                      availability applies
                    </small>
                  </div>
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="teacher-tools-panel">
            <div>
              <p className="eyebrow eyebrow-light">
                Protected educator access
              </p>

              <h2>Teacher’s Tools</h2>

              <p>
                Planning, assessment and
                answer-support tools are
                protected resources for
                verified educators and
                institutions.
              </p>
            </div>

            <div className="chips teacher-tools-chips">
              {[
                "Verified educator",
                "Role-based access",
                "Time-limited licence",
                "OTP when required",
                "Revocable access",
              ].map((item) => (
                <span
                  key={item}
                  className="chip"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section blue-tint">
        <div className="container offline-feature">
          <div>
            <p className="eyebrow">
              Offline classroom support
            </p>

            <h2>
              Bring Souvenir Digital to the
              smart board—even offline.
            </h2>

            <p className="lede">
              Schools can request an approved
              Offline Smart Board Pen Drive for
              a supported Souvenir series.
            </p>

            <ul className="check-list">
              <li>
                Works without continuous
                internet after authorised setup
              </li>

              <li>
                Series- and class-specific
                package
              </li>

              <li>
                Suitable for supported smart
                boards
              </li>

              <li>
                Licensed to the approved
                institution
              </li>

              <li>
                Physical fulfilment review
                required
              </li>
            </ul>
          </div>

          <div className="offline-action-card card">
            <span className="resource-badge offline">
              Licensed offline resource
            </span>

            <h3>
              Offline Smart Board Pen Drive
            </h3>

            <p>
              This is a physical fulfilment
              request, not an instant digital
              download.
            </p>

            <Link
              className="button"
              to="/digital-learning/request?resource=offline-smartboard-pendrive"
            >
              Request an Offline Package
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-panel digital-request-cta">
            <div>
              <p className="eyebrow eyebrow-light">
                Verified public request
              </p>

              <h2>
                Need a digital resource for a
                Souvenir series?
              </h2>

              <p>
                Students, educators, authorised
                sales personnel and approved
                distribution partners can
                submit a request.
              </p>

              <div className="trust-row digital-trust-row">
                <span>Public request form</span>
                <span>
                  Verified fulfilment
                </span>
                <span>
                  Role-based access
                </span>
              </div>
            </div>

            <div className="actions-row">
              <Link
                className="button green"
                to="/digital-learning/request"
              >
                Start Resource Request
              </Link>

              {AUTH_UI_ENABLED && <Link
                className="button secondary"
                to="/login"
              >
                Partner Login
              </Link>}

            </div>
          </div>
        </div>
      </section>

      <section className="section muted">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                Four clear steps
              </p>

              <h2>
                How a resource request works
              </h2>
            </div>
          </div>

          <ol className="how-it-works-grid">
            <li>
              <span>1</span>
              <h3>Tell us who you are</h3>
              <p>
                Choose the requester role that
                matches your educational need.
              </p>
            </li>

            <li>
              <span>2</span>
              <h3>
                Select the book correctly
              </h3>
              <p>
                Choose Subject, Series and the
                available Class.
              </p>
            </li>

            <li>
              <span>3</span>
              <h3>
                Choose the resources
              </h3>
              <p>
                See only the options allowed
                for the selected requester and
                series.
              </p>
            </li>

            <li>
              <span>4</span>
              <h3>Verify and submit</h3>
              <p>
                Verify the required contact and
                submit for review.
              </p>
            </li>
          </ol>

          <div className="faq-list digital-faq">
            <h2>Digital Learning FAQs</h2>

            <FaqItem
              question="Is access automatic after I submit?"
              answer="No. Submission confirms receipt only. Access depends on the series, class, requester role, verification, availability and licence."
            />

            <FaqItem
              question="Why do you ask for a phone number and email address?"
              answer="They help Souvenir verify genuine requests and contact the requester about approval or fulfilment."
            />

            <FaqItem
              question="Can a student request an Answer Key or Exam Pro?"
              answer="No. These are protected Teacher’s Tools available only to verified educators or institutions."
            />

            <FaqItem
              question="Can I request all classes?"
              answer="Teachers, school administrators and authorised partners may select multiple available classes. Students select only their own class."
            />

            <FaqItem
              question="How is the Offline Smart Board Pen Drive supplied?"
              answer="It is a physical licensed resource. Souvenir verifies the institution and compatibility before fulfilment."
            />
          </div>
        </div>
      </section>
      {resourceMode && <ResourceModal mode={resourceMode} onClose={() => setResourceMode(null)} />}
    </>
  );
}

export default DigitalLearningPage;
