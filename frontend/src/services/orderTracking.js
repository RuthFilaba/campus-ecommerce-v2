export const previewTrackingSteps = [
  { key: "pending", label: "Order placed" },
  { key: "confirmed", label: "Seller confirmed" },
  { key: "processing", label: "Preparing" },
  { key: "ready", label: "Ready for pickup" },
  { key: "completed", label: "Completed" },
];

export function getTrackingStepIndex(status) {
  const value = String(status || "").toLowerCase();
  if (value.includes("cancel")) return -1;
  if (value.includes("pending") || value.includes("await")) return 0;
  if (value.includes("complete") || value.includes("deliver")) return 4;
  if (value.includes("ready") || value.includes("pickup")) return 3;
  if (value.includes("process") || value.includes("prepar")) return 2;
  if (value.includes("confirm")) return 1;
  return 0;
}

export function getPreviewSellerTracking(order, ownerEmail) {
  const email = String(ownerEmail || "").toLowerCase();
  const status = order?.sellerStatuses?.[email] || order?.sellerTracking?.[email]?.status || order?.status || "Pending seller confirmation";
  const tracking = order?.sellerTracking?.[email] || {};
  return {
    status,
    note: tracking.note || "",
    updatedAt: tracking.updatedAt || order?.createdAt,
    events: Array.isArray(tracking.events) && tracking.events.length
      ? tracking.events
      : [{ status, note: "Order placed", at: order?.createdAt }],
  };
}

export function groupPreviewOrderItems(order) {
  const groups = new Map();
  (order?.items || []).forEach((item) => {
    const product = item.product || {};
    const ownerEmail = String(product.owner_email || "").toLowerCase();
    const key = ownerEmail || `seller:${product.seller_name || "seller"}`;
    const group = groups.get(key) || {
      key,
      ownerEmail,
      sellerName: product.seller_name || "Campus seller",
      items: [],
    };
    group.items.push(item);
    groups.set(key, group);
  });
  return [...groups.values()].map((group) => ({
    ...group,
    tracking: getPreviewSellerTracking(order, group.ownerEmail),
  }));
}
