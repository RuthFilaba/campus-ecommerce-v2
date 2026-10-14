const ORDERS_KEY = "campusecom.previewOrders.v1";

export function readPreviewOrders() {
  try {
    const value = JSON.parse(window.localStorage.getItem(ORDERS_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function getPreviewBuyerOrderStatus(order) {
  const sellerEmails = [...new Set((order?.items || []).map(({ product }) => product?.owner_email).filter(Boolean))];
  if (!sellerEmails.length) return order?.status || "Pending seller confirmation";
  const statuses = sellerEmails.map((email) => order.sellerStatuses?.[email] || order.status);
  const normalized = statuses.map((status) => String(status).toLowerCase());
  if (normalized.every((status) => status === "completed")) return "Completed";
  if (normalized.every((status) => status === "cancelled")) return "Cancelled";
  if (normalized.some((status) => status === "cancelled")) return "Partially cancelled";
  if (normalized.some((status) => status === "confirmed" || status === "completed")) return "Seller confirmed";
  return order.status;
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
    discount: Number(details.discount) || 0,
    total: Number.isFinite(Number(details.total)) ? Number(details.total) : cart.total,
    couponCode: details.couponCode || "",
    meetupLocation: details.meetupLocation,
    meetupNotes: details.meetupNotes,
    paymentPreference: details.paymentPreference,
    buyerEmail: details.buyerEmail || "",
    buyerName: details.buyerName || "",
  };
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...orders]));
  return order;
}

export function updatePreviewOrderStatus(orderId, status) {
  const orders = readPreviewOrders();
  const updated = orders.map((order) => String(order.id) === String(orderId)
    ? { ...order, status, sellerStatuses: {} }
    : order);
  if (!orders.some((order) => String(order.id) === String(orderId))) return false;
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  return true;
}
