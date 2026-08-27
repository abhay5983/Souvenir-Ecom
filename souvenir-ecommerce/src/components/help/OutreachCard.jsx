import { Link } from "react-router-dom";

const iconPaths = {
  "book-pencil": (
    <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H12v18H7.5A3.5 3.5 0 0 0 4 23.5zM20 12V2h-4.5A3.5 3.5 0 0 0 12 5.5M16 19l5.5-5.5 2 2L18 21l-3 .5z" />
  ),

  "book-chat": (
    <path d="M4 4h12v14H8l-4 4zM19 7h2v13l-3-3M7 8h6M7 12h5" />
  ),

  manuscript: (
    <path d="M5 3h11l3 3v15H5zM15 3v5h5M8 11h8M8 15h6M17 20l4-4 2 2-4 4-3 1z" />
  ),

  "book-check": (
    <path d="M4 4h7a3 3 0 0 1 3 3v14a3 3 0 0 0-3-3H4zM20 11V4h-3a3 3 0 0 0-3 3M17 17l2 2 4-5" />
  ),

  "package-alert": (
    <path d="M3 7l9-4 9 4-9 4zM3 7v10l9 4 5-2.2M21 7v6M12 11v10M20 16v3M20 22v.01" />
  ),

  "books-delivery": (
    <path d="M3 5h10v5H3zM4 10h10v5H4zM3 15h10v5H3zM15 10h4l3 4v6h-8V10zM16 20a2 2 0 1 0 4 0M4 20a2 2 0 1 0 4 0" />
  ),

  "qr-cursor": (
    <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM15 14h2M21 14v3M14 21h3M20 20h1M8 17l6-4 1 8 2-2 3 3" />
  ),

  school: (
    <path d="M3 10l9-6 9 6M5 10v10h14V10M9 20v-6h6v6M2 22h20" />
  ),

  accessibility: (
    <>
      <circle cx="12" cy="4" r="2" />
      <path d="M5 8h14M12 8v6M8 22l4-8 4 8M8 12l-3 5M16 12l3 5" />
    </>
  ),

  handshake: (
    <path d="M3 12l5-5 4 2 4-2 5 5-4 4-5-4-4 4zM8 7L5 4 2 7l5 5M16 7l3-3 3 3-5 5M9 15l2 2M12 14l2 2" />
  ),

  "document-shield": (
    <path d="M5 3h10l4 4v14H5zM14 3v5h5M9 11h6M9 15h3M17 14l4 2v3c0 2-1.6 3.5-4 4-2.4-.5-4-2-4-4v-3z" />
  ),

  "shield-alert": (
    <path d="M12 3l8 3v6c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6zM12 8v6M12 18v.01" />
  ),

  message: (
    <path d="M4 4h16v13H9l-5 4zM8 9h8M8 13h5" />
  ),
};

function HelpIcon({ name }) {
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
      {iconPaths[name] || iconPaths.message}
    </svg>
  );
}

function OutreachCard({
  definition,
  compact = false,
}) {
  if (!definition) {
    return null;
  }

  return (
    <article
      className={`card outreach-card${
        compact ? " compact" : ""
      }`}
    >
      <span className="help-icon-wrap">
        <HelpIcon name={definition.icon} />
      </span>

      <p className="eyebrow">
        {definition.category}
      </p>

      <h3>
        <Link
          to={`/help/forms/${definition.slug}`}
        >
          {definition.title}
        </Link>
      </h3>

      <p>{definition.summary}</p>

      <Link
        className="text-link"
        to={`/help/forms/${definition.slug}`}
      >
        {definition.cta}{" "}
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}

export default OutreachCard;