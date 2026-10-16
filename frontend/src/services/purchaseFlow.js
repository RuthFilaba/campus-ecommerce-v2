const PENDING_PURCHASE_KEY = "campusecom.pendingPurchase.v1";
const DIRECT_CHECKOUT_KEY = "campusecom.directCheckout.v1";

export function savePendingPurchase(purchase) {
  window.localStorage.setItem(PENDING_PURCHASE_KEY, JSON.stringify(purchase));
}

export function readPendingPurchase() {
  try {
    return JSON.parse(window.localStorage.getItem(PENDING_PURCHASE_KEY) || "null");
  } catch {
    return null;
  }
}

export function clearPendingPurchase() {
  window.localStorage.removeItem(PENDING_PURCHASE_KEY);
}

export function saveDirectCheckout(product, quantity) {
  const item = { id: String(product.id), product, quantity };
  window.localStorage.setItem(DIRECT_CHECKOUT_KEY, JSON.stringify([item]));
}

export function readDirectCheckout() {
  try {
    const items = JSON.parse(window.localStorage.getItem(DIRECT_CHECKOUT_KEY) || "[]");
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export function clearDirectCheckout() {
  window.localStorage.removeItem(DIRECT_CHECKOUT_KEY);
}
