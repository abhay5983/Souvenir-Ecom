function PageHero({
  eyebrow,
  title,
  body,
  breadcrumbs,
}) {
  return (
    <section className="page-hero">
      <div className="container">
        {breadcrumbs && (
          <nav
            className="breadcrumbs"
            aria-label="Breadcrumb"
          >
            {breadcrumbs}
          </nav>
        )}

        <p className="eyebrow">{eyebrow}</p>

        <h1>{title}</h1>

        <p className="lede">{body}</p>
      </div>
    </section>
  );
}

export default PageHero;