import { NavLink } from "react-router-dom";
import CatalogueIcon from "../common/CatalogueIcon";

const NAVIGATION = [
  { label: "About Us", to: "/about", icon: "about" },
  { label: "Books", to: "/books", icon: "books" },
  { label: "Digital Learning", to: "/digital-learning", icon: "digital" },
  { label: "Help", to: "/help", icon: "help" },
  { label: "Track Order", to: "/track-order", icon: "track" },
];

function PublicNavigation({
  className = "primary-nav",
  onNavigate,
}) {
  function getNavClass({ isActive }) {
    return isActive
      ? "nav-link active"
      : "nav-link";
  }

  return (
    <nav
      className={className}
      aria-label="Primary navigation"
    >
      {NAVIGATION.map((item) => (
        <NavLink
          className={getNavClass}
          to={item.to}
          onClick={onNavigate}
          key={item.to}
        >
          <CatalogueIcon name={item.icon} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default PublicNavigation;
