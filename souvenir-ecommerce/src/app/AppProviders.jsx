import { AuthProvider } from "../context/AuthContext.jsx";
import { CartProvider } from "../context/CartContext.jsx";
import { CatalogueProvider } from "../context/CatalogueContext.jsx";

function AppProviders({ children }) {
  return (
    <AuthProvider>
      <CatalogueProvider><CartProvider>{children}</CartProvider></CatalogueProvider>
    </AuthProvider>
  );
}

export default AppProviders;
