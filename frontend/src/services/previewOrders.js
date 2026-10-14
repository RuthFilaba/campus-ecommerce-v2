const ORDERS_KEY = "campusecom.previewOrders.v1";

export function readPreviewOrders() {
  try {
    const value = JSON.parse(window.localStorage.getItem(ORDERS_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function createPreviewOrder(cart, details) {
  const orders = readPreviewOrders();
  const now = new Date();
  const order = {
    id: `CE-${now.getTime().toString().slice(-8)}`,
    createdAt: now.toISOString(),
    status: "Pending seller confirmation",
    items: cart.items.map(({ product, quantity }) => ({ product, quantity })),
    itemCount: cart.count,
    subtotal: cart.total,
    meetupLocation: details.meetupLocation,
    meetupNotes: details.meetupNotes,
    paymentPreference: details.paymentPreference,
  };
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...orders]));
  return order;
}
