import { NavLink } from "react-router-dom";

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
      <NavLink
        className={getNavClass}
        to="/about"
        onClick={onNavigate}
      >
        About Us
      </NavLink>

      <NavLink
        className={getNavClass}
        to="/books"
        onClick={onNavigate}
      >
        Books
      </NavLink>

      <NavLink
        className={getNavClass}
        to="/digital-learning"
        onClick={onNavigate}
      >
        Digital Learning
      </NavLink>

      <NavLink
        className={getNavClass}
        to="/help"
        onClick={onNavigate}
      >
        Help
      </NavLink>

      <NavLink
        className={getNavClass}
        to="/track-order"
        onClick={onNavigate}
      >
        Track Order
      </NavLink>
    </nav>
  );
}

export default PublicNavigation;
