const CART_KEY = "campusecom.previewCart.v1";

export function readPreviewCart() {
  try {
    const value = JSON.parse(window.localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function writePreviewCart(items) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  return items;
}

export function toCartSummary(items) {
  const totalItems = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const total = items.reduce((sum, item) => {
    const unitPrice = Number(item.product?.price ?? item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + unitPrice * quantity;
  }, 0);
  return { items, total, count: totalItems };
}
