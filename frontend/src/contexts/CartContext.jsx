import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { readPreviewCart, toCartSummary, writePreviewCart } from "../services/previewCart";

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => readPreviewCart());

  useEffect(() => {
    const syncCart = () => setItems(readPreviewCart());
    window.addEventListener("storage", syncCart);
    return () => window.removeEventListener("storage", syncCart);
  }, []);

  const commit = useCallback((nextItems) => {
    writePreviewCart(nextItems);
    setItems(nextItems);
  }, []);

  const addItem = useCallback((product, quantity = 1) => {
    const current = readPreviewCart();
    const found = current.find((item) => String(item.product.id) === String(product.id));
    const next = found
      ? current.map((item) => String(item.product.id) === String(product.id) ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock || 99) } : item)
      : [...current, { id: String(product.id), product, quantity: Math.min(quantity, product.stock || 99) }];
    commit(next);
  }, [commit]);

  const updateQuantity = useCallback((productId, quantity) => {
    const next = readPreviewCart()
      .map((item) => String(item.product.id) === String(productId) ? { ...item, quantity } : item)
      .filter((item) => item.quantity > 0);
    commit(next);
  }, [commit]);

  const removeItem = useCallback((productId) => {
    commit(readPreviewCart().filter((item) => String(item.product.id) !== String(productId)));
  }, [commit]);

  const clearCart = useCallback(() => commit([]), [commit]);
  const refreshCart = useCallback(() => setItems(readPreviewCart()), []);
  const cart = useMemo(() => toCartSummary(items), [items]);

  return <CartContext.Provider value={{ cart, items, addItem, updateQuantity, removeItem, clearCart, refreshCart, loading: false }}>{children}</CartContext.Provider>;
};
