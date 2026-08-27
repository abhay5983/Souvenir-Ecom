import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";

import Brand from "../common/Brand";
import PublicNavigation from "./PublicNavigation";

function Header({
  authenticated = false,
  cartCount = 0,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const accountLabel = authenticated
    ? "My Souvenir"
    : "Partner Portal";

  const accountPath = authenticated
    ? "/app"
    : "/login";

  function openMenu() {
    setMenuOpen(true);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);

    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Brand onClick={closeMenu} />

          <PublicNavigation />

          <div className="header-actions">
            <NavLink
              className="cart-link"
              to="/cart"
              aria-label={`Cart with ${cartCount} ${
                cartCount === 1 ? "book" : "books"
              }`}
            >
              <span aria-hidden="true">▣</span>
              <span>Cart</span>
              <strong>{cartCount}</strong>
            </NavLink>

            {authenticated && <Link
              className="button small secondary"
              to={accountPath}
              aria-label={accountLabel}
            >
              ◎ {accountLabel}
            </Link>}

            <button
              className="icon-button"
              type="button"
              aria-controls="mobile-menu"
              aria-expanded={menuOpen}
              aria-label="Open navigation menu"
              onClick={openMenu}
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      <button
        className={`drawer-backdrop ${menuOpen ? "open" : ""}`}
        type="button"
        tabIndex={-1}
        aria-label="Close navigation menu"
        onClick={closeMenu}
      />

     <aside
  className={`mobile-drawer ${menuOpen ? "open" : ""}`}
  id="mobile-menu"
  role={menuOpen ? "dialog" : undefined}
  aria-modal={menuOpen ? true : undefined}
  aria-label="Mobile navigation"
  aria-hidden={!menuOpen}
  inert={!menuOpen}
>
        <div className="drawer-head">
          <Brand onClick={closeMenu} />

          <button
            className="icon-button"
            type="button"
            aria-label="Close navigation menu"
            onClick={closeMenu}
          >
            ×
          </button>
        </div>

        <PublicNavigation
          className="drawer-nav"
          onNavigate={closeMenu}
        />

        <Link
          className="cart-link drawer-cart-link"
          to="/cart"
          onClick={closeMenu}
        >
          <span aria-hidden="true">▣</span>
          <span>Cart</span>
          <strong>{cartCount}</strong>
        </Link>

        {authenticated && <Link
          className="button"
          to={accountPath}
          onClick={closeMenu}
        >
          {accountLabel}
        </Link>}
      </aside>
    </>
  );
}

export default Header;
