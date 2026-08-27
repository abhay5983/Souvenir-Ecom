import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  addCartItem,
  cartUnitCount,
  clearCartItems,
  mergeCartItems,
  removeCartItem,
  setCartQuantity,
} from "../services/cartService";

const CART_STORAGE_KEY = "souvenir-cart";

const CartContext = createContext(null);

function loadStoredCart() {
  try {
    const stored = JSON.parse(
      sessionStorage.getItem(
        CART_STORAGE_KEY,
      ) ?? "[]",
    );

    if (!Array.isArray(stored)) {
      return [];
    }

    return stored.filter((item) => {
      return (
        typeof item?.id === "string" &&
        typeof item?.seriesId === "string" &&
        Number.isInteger(item?.quantity) &&
        item.quantity > 0
      );
    });
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(
    loadStoredCart,
  );

  useEffect(() => {
    try {
      sessionStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart),
      );
    } catch {
      // Cart remains available in memory.
    }
  }, [cart]);

  const addToCart = useCallback((item) => {
    setCart((current) => {
      return addCartItem(
        current,
        item,
      );
    });
  }, []);

  const addItems = useCallback((items) => {
    setCart((current) => {
      return mergeCartItems(
        current,
        items,
      );
    });
  }, []);

  const updateQuantity = useCallback(
    (id, quantity) => {
      setCart((current) => {
        return setCartQuantity(
          current,
          id,
          quantity,
        );
      });
    },
    [],
  );

  const removeFromCart = useCallback(
    (id) => {
      setCart((current) => {
        return removeCartItem(
          current,
          id,
        );
      });
    },
    [],
  );

  const clearCart = useCallback(() => {
    setCart(clearCartItems());
  }, []);

  const cartCount = useMemo(() => {
    return cartUnitCount(cart);
  }, [cart]);

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      addToCart,
      addItems,
      updateQuantity,
      removeFromCart,
      clearCart,
    }),
    [
      cart,
      cartCount,
      addToCart,
      addItems,
      updateQuantity,
      removeFromCart,
      clearCart,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider.",
    );
  }

  return context;
}