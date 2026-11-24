const ICON_PATHS = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  filters: <><path d="M4 6h16" /><path d="M7 12h10" /><path d="M10 18h4" /></>,
  class: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22Z" /><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22Z" /></>,
  subject: <><path d="M4 4h16v16H4z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  series: <><rect x="3" y="4" width="5" height="16" rx="1" /><rect x="10" y="4" width="5" height="16" rx="1" /><path d="m17 5 4 14M18.5 10.5l4-1.1" /></>,
  resources: <><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1" /><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1" /></>,
  sort: <><path d="M3 6h14M3 12h10M3 18h6" /><path d="m17 15 3 3 3-3M20 18V6" /></>,
  books: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></>,
  price: <><path d="M20 13 13 20l-9-9V4h7Z" /><circle cx="8.5" cy="8.5" r="1.25" /></>,
  cart: <><circle cx="9" cy="20" r="1" /><circle cx="19" cy="20" r="1" /><path d="M3 4h2l2.4 10.5a2 2 0 0 0 2 1.5h8.8a2 2 0 0 0 2-1.6L22 8H7" /></>,
  about: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5h.01" /></>,
  digital: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /><path d="m14.5 7 .7 1.5 1.5.7-1.5.7-.7 1.5-.7-1.5-1.5-.7 1.5-.7Z" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.4 2.4 0 1 1 3.5 2.1c-.9.5-1.3 1-1.3 1.9M12 17h.01" /></>,
  track: <><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>,
  account: <><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
};

function CatalogueIcon({ name, size = 18, className = "" }) {
  return (
    <svg
      className={`catalogue-icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICON_PATHS[name] ?? ICON_PATHS.books}
    </svg>
  );
}

export default CatalogueIcon;
