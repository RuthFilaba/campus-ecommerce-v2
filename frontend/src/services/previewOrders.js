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
    taxRate: Number(details.taxRate) || 0,
    taxAmount: Number(details.taxAmount) || 0,
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
  const target = orders.find((order) => String(order.id) === String(orderId));
  if (!target) return { error: "Order not found." };
  if (String(status).toLowerCase() === "refunded") {
    const deliveredAt = target.deliveredAt ? new Date(target.deliveredAt).getTime() : 0;
    const withinRefundWindow = deliveredAt > 0 && Date.now() - deliveredAt <= 14 * 24 * 60 * 60 * 1000;
    if (!String(target.status).toLowerCase().includes("deliver") && !String(target.status).toLowerCase().includes("complete")) {
      return { error: "Only delivered orders can be refunded." };
    }
    if (!withinRefundWindow) return { error: "The 14-day refund window has expired or delivery date is missing." };
  }
  const updated = orders.map((order) => String(order.id) === String(orderId)
    ? { ...order, status, sellerStatuses: {}, ...(String(status).toLowerCase() === "delivered" ? { deliveredAt: new Date().toISOString() } : {}) }
    : order);
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  return { order: updated.find((order) => String(order.id) === String(orderId)) };
}

export function cancelPreviewOrder(orderId, buyerEmail) {
  const orders = readPreviewOrders();
  const order = orders.find((item) => String(item.id) === String(orderId));
  if (!order || order.buyerEmail?.toLowerCase() !== String(buyerEmail || "").toLowerCase()) {
    return { error: "Order not found for this account." };
  }
  if (!getPreviewBuyerOrderStatus(order).toLowerCase().includes("pending")) {
    return { error: "Only orders awaiting seller confirmation can be cancelled." };
  }
  const updated = orders.map((item) => String(item.id) === String(orderId)
    ? { ...item, status: "Cancelled", cancelledAt: new Date().toISOString() }
    : item);
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  return { order: updated.find((item) => String(item.id) === String(orderId)) };
}
