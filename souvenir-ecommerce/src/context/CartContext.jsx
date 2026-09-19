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
import { DEFAULT_DELIVERY_OPTION, DELIVERY_OPTIONS } from "../services/deliveryOptions.js";

const CART_STORAGE_KEY = "souvenir-cart";
const DELIVERY_STORAGE_KEY = "souvenir-delivery-option";

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
  const [deliveryOption, setDeliveryOptionState] = useState(() => {
    try {
      const stored = sessionStorage.getItem(DELIVERY_STORAGE_KEY);
      return DELIVERY_OPTIONS[stored] ? stored : DEFAULT_DELIVERY_OPTION;
    } catch {
      return DEFAULT_DELIVERY_OPTION;
    }
  });

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

  useEffect(() => {
    try { sessionStorage.setItem(DELIVERY_STORAGE_KEY, deliveryOption); }
    catch { /* Delivery choice remains available in memory. */ }
  }, [deliveryOption]);

  const setDeliveryOption = useCallback((option) => {
    if (DELIVERY_OPTIONS[option]) setDeliveryOptionState(option);
  }, []);

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
    setDeliveryOptionState(DEFAULT_DELIVERY_OPTION);
  }, []);

  const cartCount = useMemo(() => {
    return cartUnitCount(cart);
  }, [cart]);

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      deliveryOption,
      setDeliveryOption,
      addToCart,
      addItems,
      updateQuantity,
      removeFromCart,
      clearCart,
    }),
    [
      cart,
      cartCount,
      deliveryOption,
      setDeliveryOption,
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
