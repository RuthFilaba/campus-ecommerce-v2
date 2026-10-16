const ORDERS_KEY = "campusecom.previewOrders.v1";

function notifyPreviewOrdersChanged() {
  window.dispatchEvent(new Event("campusecom:preview-orders-change"));
}

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
  if (normalized.every((status) => status === "delivered" || status === "completed")) return "Delivered";
  if (normalized.every((status) => status === "cancelled")) return "Cancelled";
  if (normalized.some((status) => status === "cancelled")) return "Partially cancelled";
  if (normalized.some((status) => status.includes("ready")) && normalized.every((status) => status.includes("ready") || status === "delivered" || status === "completed")) return "Ready for pickup";
  if (normalized.some((status) => status.includes("deliver"))) return "Delivered";
  if (normalized.some((status) => status.includes("process") || status.includes("prepar"))) return "Being prepared";
  if (normalized.some((status) => status.includes("confirm") || status === "completed")) return "Seller confirmed";
  return order.status;
}

export function createPreviewOrder(cart, details) {
  const orders = readPreviewOrders();
  const now = new Date();
  const sellerTracking = Object.fromEntries([...new Set(cart.items.map(({ product }) => String(product.owner_email || "").toLowerCase()).filter(Boolean))].map((email) => [email, {
    status: "Pending seller confirmation",
    note: "",
    updatedAt: now.toISOString(),
    events: [{ status: "Pending seller confirmation", note: "Order placed", at: now.toISOString() }],
  }]));
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
    paymentStatus: details.paymentPreference === "meetup-cash" ? "Awaiting Collection" : "Awaiting Payment",
    paymentReference: "",
    paymentSubmittedAt: "",
    buyerEmail: details.buyerEmail || "",
    buyerName: details.buyerName || "",
    buyerPhone: details.buyerPhone || "",
    sellerTracking,
  };
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...orders]));
  notifyPreviewOrdersChanged();
  return order;
}

export function submitPreviewPaymentReference(orderId, buyerEmail, reference, evidence = []) {
  const normalizedReference = String(reference || "").trim();
  if (!normalizedReference) return { error: "Enter the transaction reference." };
  const orders = readPreviewOrders();
  const target = orders.find((order) => String(order.id) === String(orderId));
  if (!target || target.buyerEmail?.toLowerCase() !== String(buyerEmail || "").toLowerCase()) {
    return { error: "Order not found for this account." };
  }
  if (["Cancelled", "Refunded"].includes(target.status)) return { error: "Cancelled or refunded orders cannot accept payment references." };
  if (target.paymentPreference === "meetup-cash") return { error: "Cash on delivery does not require a payment reference." };
  if (!["Awaiting Payment", "Verification Failed", "Disputed"].includes(target.paymentStatus || "Awaiting Payment")) {
    return { error: "This payment is already awaiting review or has been verified." };
  }
  const reused = orders.some((order) => String(order.id) !== String(orderId) && order.paymentReference?.trim().toLowerCase() === normalizedReference.toLowerCase());
  if (reused) return { error: "That transaction reference is already attached to another order." };
  const updated = orders.map((order) => String(order.id) === String(orderId)
    ? { ...order, paymentReference: normalizedReference, paymentEvidence: Array.isArray(evidence) ? evidence : [], paymentStatus: "Awaiting Verification", paymentSubmittedAt: new Date().toISOString() }
    : order);
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  notifyPreviewOrdersChanged();
  return { order: updated.find((order) => String(order.id) === String(orderId)) };
}

export function updatePreviewPaymentStatus(orderId, status, actor = "Preview administrator", note = "") {
  const allowed = ["Verified", "Verification Failed", "Disputed", "Refunded"];
  if (!allowed.includes(status)) return { error: "Invalid payment decision." };
  const orders = readPreviewOrders();
  const target = orders.find((order) => String(order.id) === String(orderId));
  if (!target) return { error: "Order not found." };
  if (target.paymentPreference === "meetup-cash" && status === "Verified") return { error: "COD collection is confirmed by the seller." };
  if (status === "Refunded" && target.paymentStatus !== "Refund Pending") return { error: "Only an approved refund awaiting processing can be marked refunded." };
  if (status === "Refunded" ? target.paymentStatus !== "Refund Pending" : target.paymentStatus !== "Awaiting Verification" && target.paymentStatus !== "Disputed") return { error: status === "Refunded" ? "Only a requested refund can be completed." : "Only submitted or disputed payments can be reviewed." };
  const now = new Date().toISOString();
  const finalStatus = status === "Verified" && target.status === "Cancelled" ? "Refund Pending" : status;
  const reviewNote = String(note).trim() || (finalStatus === "Refund Pending" ? "Funds confirmed for a cancelled order; refund processing is required" : "");
  const paymentHistory = [...(target.paymentHistory || []), { status: finalStatus, note: reviewNote, actor, at: now }];
  const updated = orders.map((order) => String(order.id) === String(orderId)
    ? { ...order, paymentStatus: finalStatus, paymentHistory, ...(finalStatus === "Refunded" ? { status: "Refunded", refundedAt: now } : {}) }
    : order);
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  notifyPreviewOrdersChanged();
  return { order: updated.find((order) => String(order.id) === String(orderId)) };
}

export function raisePreviewPaymentDispute(orderId, buyerEmail, reason, details = {}) {
  const message = String(reason || "").trim();
  if (!message) return { error: "Describe the payment issue." };
  const orders = readPreviewOrders();
  const target = orders.find((order) => String(order.id) === String(orderId));
  if (!target || target.buyerEmail?.toLowerCase() !== String(buyerEmail || "").toLowerCase()) return { error: "Order not found for this account." };
  if (["open", "unresolved"].includes(target.paymentDispute?.status)) return { error: "This order already has an open report under review." };
  if (["Refund Pending", "Refunded"].includes(target.paymentStatus) || ["Cancelled", "Refunded"].includes(target.status)) return { error: "This payment cannot be disputed in its current state." };
  const now = new Date().toISOString();
  const category = details.category || "other";
  const isPaymentDispute = ["payment_not_received", "payment_amount_mismatch", "duplicate_payment", "cod_payment_disagreement"].includes(category);
  const updated = orders.map((order) => String(order.id) === String(orderId)
    ? { ...order, ...(isPaymentDispute ? { paymentStatus: "Disputed", paymentHistory: [...(order.paymentHistory || []), { status: "Disputed", note: message, actor: buyerEmail, at: now }] } : {}), paymentDispute: { id: `CE-D-${Date.now().toString().slice(-7)}`, reason: message, category, evidence: Array.isArray(details.evidence) ? details.evidence : [], raisedBy: buyerEmail, createdAt: now, status: "open", isPaymentDispute, previousPaymentStatus: order.paymentStatus || (order.paymentPreference === "meetup-cash" ? "Awaiting Collection" : "Awaiting Payment") } }
    : order);
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  notifyPreviewOrdersChanged();
  return { order: updated.find((order) => String(order.id) === String(orderId)) };
}

export function appendPreviewDisputeEvidence(orderId, buyerEmail, message, evidence = []) {
  const details = String(message || "").trim();
  if (!details && !evidence.length) return { error: "Add an update or attach evidence." };
  const orders = readPreviewOrders();
  const target = orders.find((order) => String(order.id) === String(orderId));
  if (!target || target.buyerEmail?.toLowerCase() !== String(buyerEmail || "").toLowerCase()) return { error: "Order not found for this account." };
  if (!["open", "unresolved"].includes(target.paymentDispute?.status)) return { error: "Additional information can only be sent while the case is open." };
  const now = new Date().toISOString();
  const updates = [...(target.paymentDispute.updates || []), { message: details, evidence: Array.isArray(evidence) ? evidence : [], submittedAt: now, submittedBy: buyerEmail }];
  const updated = orders.map((order) => String(order.id) === String(orderId) ? { ...order, paymentDispute: { ...order.paymentDispute, updates } } : order);
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  notifyPreviewOrdersChanged();
  return { order: updated.find((order) => String(order.id) === String(orderId)) };
}

export function submitPreviewSellerDisputeResponse(orderId, ownerEmail, response, evidence = []) {
  const message = String(response || "").trim();
  if (!message) return { error: "Enter a response for the buyer and administrator." };
  const normalizedEmail = String(ownerEmail || "").toLowerCase();
  const orders = readPreviewOrders();
  const target = orders.find((order) => String(order.id) === String(orderId));
  if (!target || !(target.items || []).some(({ product }) => String(product?.owner_email || "").toLowerCase() === normalizedEmail)) return { error: "Disputed order not found for this seller." };
  if (!target.paymentDispute || !["open", "unresolved"].includes(target.paymentDispute.status)) return { error: "This dispute is no longer open." };
  const now = new Date().toISOString();
  const updated = orders.map((order) => String(order.id) === String(orderId)
    ? { ...order, paymentDispute: { ...order.paymentDispute, sellerResponse: { message, evidence: Array.isArray(evidence) ? evidence : [], sellerEmail: normalizedEmail, submittedAt: now } } }
    : order);
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  notifyPreviewOrdersChanged();
  return { order: updated.find((order) => String(order.id) === String(orderId)) };
}

export function resolvePreviewDispute(orderId, outcome, reason, actor, partialAmount = 0) {
  const allowed = ["buyer_upheld", "seller_upheld", "partial_resolution", "unresolved"];
  if (!allowed.includes(outcome)) return { error: "Choose a valid dispute outcome." };
  const explanation = String(reason || "").trim();
  if (!explanation) return { error: "Record the decision reason and corrective action." };
  const orders = readPreviewOrders();
  const target = orders.find((order) => String(order.id) === String(orderId));
  if (!target?.paymentDispute || !["open", "unresolved"].includes(target.paymentDispute.status)) return { error: "Open dispute not found." };
  const amount = Number(partialAmount);
  if (outcome === "partial_resolution" && (!Number.isFinite(amount) || amount <= 0 || amount > Number(target.total ?? target.subtotal ?? 0))) return { error: "Enter a partial resolution amount within the order total." };
  const now = new Date().toISOString();
  const dispute = { ...target.paymentDispute, status: outcome === "unresolved" ? "unresolved" : "resolved", decision: outcome, decisionReason: explanation, decidedBy: actor, decidedAt: now, ...(outcome === "partial_resolution" ? { resolutionAmount: amount } : {}) };
  let paymentStatus = target.paymentStatus;
  if (dispute.isPaymentDispute) {
    if (outcome === "buyer_upheld" || outcome === "partial_resolution") {
      paymentStatus = target.paymentStatus === "Verified" || dispute.previousPaymentStatus === "Verified" ? "Refund Pending" : "Verification Failed";
    } else if (outcome === "seller_upheld") {
      paymentStatus = target.paymentPreference === "meetup-cash" ? "Awaiting Collection" : "Verified";
    }
  } else if ((outcome === "buyer_upheld" || outcome === "partial_resolution") && target.paymentStatus === "Verified") {
    paymentStatus = "Refund Pending";
  }
  const paymentHistory = paymentStatus !== target.paymentStatus
    ? [...(target.paymentHistory || []), { status: paymentStatus, note: `Dispute outcome: ${outcome}. ${explanation}`, actor, at: now }]
    : target.paymentHistory || [];
  const updated = orders.map((order) => String(order.id) === String(orderId)
    ? { ...order, paymentDispute: dispute, paymentStatus, paymentHistory }
    : order);
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  notifyPreviewOrdersChanged();
  return { order: updated.find((order) => String(order.id) === String(orderId)) };
}

export function confirmPreviewCodCollection(orderId, ownerEmail, collectedAmount) {
  const normalizedEmail = String(ownerEmail || "").toLowerCase();
  const orders = readPreviewOrders();
  const target = orders.find((order) => String(order.id) === String(orderId));
  if (!target || target.paymentPreference !== "meetup-cash") return { error: "COD order not found." };
  if (!(target.items || []).some(({ product }) => String(product?.owner_email || "").toLowerCase() === normalizedEmail)) return { error: "This order does not include your products." };
  const sellerStatus = target.sellerStatuses?.[normalizedEmail] || target.sellerTracking?.[normalizedEmail]?.status || target.status;
  if (!String(sellerStatus).toLowerCase().includes("deliver")) return { error: "Confirm collection after the buyer receives the order." };
  if (target.paymentStatus === "Verified" || target.codCollections?.[normalizedEmail]) return { error: "Your collection has already been confirmed." };
  const sellerSubtotal = (target.items || []).filter(({ product }) => String(product?.owner_email || "").toLowerCase() === normalizedEmail).reduce((sum, { product, quantity }) => sum + Number(product?.price || 0) * Number(quantity || 0), 0);
  if (!Number.isFinite(Number(collectedAmount)) || Math.abs(Number(collectedAmount) - sellerSubtotal) > 0.009) return { error: `Enter the full amount collected (${sellerSubtotal.toFixed(2)}). If collection differs, report a payment issue for admin review.` };
  const now = new Date().toISOString();
  const codCollections = { ...(target.codCollections || {}), [normalizedEmail]: { amount: Number(collectedAmount), collectedAt: now } };
  const sellerEmails = [...new Set((target.items || []).map(({ product }) => String(product?.owner_email || "").toLowerCase()).filter(Boolean))];
  const allCollected = sellerEmails.every((email) => codCollections[email]);
  const nextPaymentStatus = allCollected ? "Verified" : "Partially Collected";
  const updated = orders.map((order) => String(order.id) === String(orderId)
    ? { ...order, paymentStatus: nextPaymentStatus, codCollections, collectedAmount: Object.values(codCollections).reduce((sum, entry) => sum + Number(entry.amount || 0), 0), collectedBy: normalizedEmail, collectedAt: now, paymentHistory: [...(order.paymentHistory || []), { status: nextPaymentStatus, note: `COD collection confirmed: K${Number(collectedAmount).toFixed(2)}${allCollected ? " (all sellers collected)" : " (awaiting other sellers)"}`, actor: normalizedEmail, at: now }] }
    : order);
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  notifyPreviewOrdersChanged();
  return { order: updated.find((order) => String(order.id) === String(orderId)) };
}

export function updatePreviewOrderStatus(orderId, status) {
  const orders = readPreviewOrders();
  const target = orders.find((order) => String(order.id) === String(orderId));
  if (!target) return { error: "Order not found." };
  const normalizedStatus = String(status).toLowerCase();
  if (["cancelled", "refunded"].includes(String(target.status).toLowerCase()) && normalizedStatus !== String(target.status).toLowerCase()) return { error: "Cancelled or refunded orders cannot be reopened from this preview." };
  if (["shipped", "delivered"].includes(normalizedStatus) && target.paymentPreference !== "meetup-cash" && target.paymentStatus !== "Verified") {
    return { error: "Prepaid orders cannot be dispatched or delivered until an administrator verifies payment." };
  }
  if (normalizedStatus === "refunded" && target.paymentStatus !== "Refunded") return { error: "Complete the refund through payment review before marking the order refunded." };
  if (String(status).toLowerCase() === "refunded") {
    const deliveredAt = target.deliveredAt ? new Date(target.deliveredAt).getTime() : 0;
    const withinRefundWindow = deliveredAt > 0 && Date.now() - deliveredAt <= 14 * 24 * 60 * 60 * 1000;
    if (!String(target.status).toLowerCase().includes("deliver") && !String(target.status).toLowerCase().includes("complete")) {
      return { error: "Only delivered orders can be refunded." };
    }
    if (!withinRefundWindow) return { error: "The 14-day refund window has expired or delivery date is missing." };
  }
  const now = new Date().toISOString();
  const startsRefund = normalizedStatus === "cancelled" && target.paymentStatus === "Verified";
  const sellerStatuses = Object.keys(target.sellerTracking || {}).length
    ? Object.fromEntries(Object.keys(target.sellerTracking).map((email) => [email, status]))
    : target.sellerStatuses;
  const updated = orders.map((order) => String(order.id) === String(orderId)
    ? { ...order, status, ...(sellerStatuses ? { sellerStatuses } : {}), ...(startsRefund ? { paymentStatus: "Refund Pending", paymentHistory: [...(order.paymentHistory || []), { status: "Refund Pending", note: "Order cancelled by administrator; refund review required", actor: "Preview administrator", at: now }] } : {}), ...(normalizedStatus === "delivered" ? { deliveredAt: now } : {}) }
    : order);
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  notifyPreviewOrdersChanged();
  return { order: updated.find((order) => String(order.id) === String(orderId)) };
}

export function cancelPreviewOrder(orderId, buyerEmail) {
  const orders = readPreviewOrders();
  const order = orders.find((item) => String(item.id) === String(orderId));
  if (!order || order.buyerEmail?.toLowerCase() !== String(buyerEmail || "").toLowerCase()) {
    return { error: "Order not found for this account." };
  }
  const sellerStatuses = Object.values(order.sellerStatuses || {}).map((status) => String(status).toLowerCase());
  const currentStatuses = sellerStatuses.length ? sellerStatuses : [String(order.status || "pending").toLowerCase()];
  const cancellableStatuses = ["pending", "pending seller confirmation", "confirmed", "seller confirmed", "processing", "being prepared"];
  if (!currentStatuses.every((status) => cancellableStatuses.includes(status))) return { error: "This order can no longer be cancelled because fulfillment has progressed." };
  const requestsRefund = order.paymentStatus === "Verified";
  const now = new Date().toISOString();
  const updated = orders.map((item) => String(item.id) === String(orderId)
    ? { ...item, status: "Cancelled", cancelledAt: now, sellerStatuses: Object.fromEntries(Object.keys(item.sellerTracking || {}).map((email) => [email, "Cancelled"])), paymentStatus: requestsRefund ? "Refund Pending" : item.paymentStatus, ...(requestsRefund ? { paymentHistory: [...(item.paymentHistory || []), { status: "Refund Pending", note: "Refund requested after order cancellation", actor: buyerEmail, at: now }] } : {}) }
    : item);
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  notifyPreviewOrdersChanged();
  return { order: updated.find((item) => String(item.id) === String(orderId)) };
}
