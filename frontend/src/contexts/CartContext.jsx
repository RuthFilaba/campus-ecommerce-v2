import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import api from "../services/api";

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    refreshCart();
  }, [user?.id]);

  const applyCart = useCallback((data) => {
    setItems((data.items || []).map((item) => ({
      id: String(item.product_detail.id),
      cartItemId: item.id,
      product: item.product_detail,
      quantity: item.quantity,
    })));
  }, []);

  const refreshCart = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await api.get("/cart/");
      applyCart(response.data);
    } finally {
      setLoading(false);
    }
  }, [applyCart, user]);

  const addItem = useCallback(async (product, quantity = 1) => {
    const response = await api.post("/cart/add/", { product_id: product.id, quantity });
    applyCart(response.data.cart);
  }, [applyCart]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    const item = items.find((entry) => String(entry.product.id) === String(productId));
    if (!item) return;
    const response = await api.put(`/cart/item/${item.cartItemId}/`, { quantity });
    applyCart(response.data.cart);
  }, [applyCart, items]);

  const removeItem = useCallback(async (productId) => {
    const item = items.find((entry) => String(entry.product.id) === String(productId));
    if (!item) return;
    const response = await api.delete(`/cart/remove/${item.cartItemId}/`);
    applyCart(response.data.cart);
  }, [applyCart, items]);

  const clearCart = useCallback(async () => {
    if (!user) return;
    const response = await api.delete("/cart/clear/");
    applyCart(response.data.cart);
  }, [applyCart, user]);
  const cart = useMemo(() => ({
    items,
    count: items.reduce((count, item) => count + item.quantity, 0),
    total: items.reduce((total, item) => total + Number(item.product.price) * item.quantity, 0),
  }), [items]);

  return <CartContext.Provider value={{ cart, items, addItem, updateQuantity, removeItem, clearCart, refreshCart, loading }}>{children}</CartContext.Provider>;
};
