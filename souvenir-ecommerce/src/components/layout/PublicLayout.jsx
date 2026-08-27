import { Outlet } from "react-router-dom";

import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";


function PublicLayout() {
  const { authenticated } = useAuth();
  const { cartCount } = useCart();

  return (
    <>
      <Header
        authenticated={authenticated}
        cartCount={cartCount}
      />

      <main id="main-content">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}

export default PublicLayout;