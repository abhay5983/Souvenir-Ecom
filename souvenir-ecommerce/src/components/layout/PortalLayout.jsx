import {
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

import RoleNavigation from "../portal/RoleNavigation.jsx";

import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";

function PortalLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    user,
    authenticated,
    logout,
  } = useAuth();

  const {
    cartCount,
  } = useCart();

  function handleSignOut() {
    logout();

    navigate("/login", {
      replace: true,
    });
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Header
        authenticated={authenticated}
        cartCount={cartCount}
      />

      <main
        id="main-content"
        className="portal-shell"
      >
        <div className="portal-topbar">
          <div className="container">
            <RoleNavigation
              role={user.role}
              pathname={location.pathname}
            />

            <button
              className="button ghost small"
              type="button"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </div>
        </div>

        <Outlet />
      </main>

      <Footer />
    </>
  );
}

export default PortalLayout;