function PageHero({
  eyebrow,
  title,
  body,
  children,
}) {
  return (
    <section className="page-hero">
      <div className="container">
        {children}

        <p className="eyebrow">
          {eyebrow}
        </p>

        <h1>{title}</h1>

        <p className="lede">
          {body}
        </p>
      </div>
    </section>
  );
}

export default PageHero;