import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ecommerceService } from "../services/ecommerceService.js";

const CatalogueContext = createContext(null);
const EMPTY = {
  catalogue: [],
  meta: { title: "Souvenir Publishers Catalogue", seriesCount: 0, publicSeriesCount: 0, variantCount: 0 },
  filters: { imprints: [], subjects: [], categories: [], stages: [], features: [] },
};

export function CatalogueProvider({ children }) {
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    ecommerceService.catalogue()
      .then((payload) => { if (active) setData(payload); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const value = useMemo(() => ({ ...data, loading, error }), [data, loading, error]);
  return <CatalogueContext.Provider value={value}>{children}</CatalogueContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCatalogue() {
  const context = useContext(CatalogueContext);
  if (!context) throw new Error("useCatalogue must be used inside CatalogueProvider.");
  return context;
}
