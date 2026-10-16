const PRODUCTS_KEY = "campusecom.previewSellerProducts.v1";
const SETTINGS_KEY = "campusecom.previewSellerSettings.v1";
const ORDERS_KEY = "campusecom.previewOrders.v1";

function readAllProducts() {
  try {
    const products = JSON.parse(window.localStorage.getItem(PRODUCTS_KEY) || "[]");
    return Array.isArray(products) ? products : [];
  } catch {
    return [];
  }
}

function writeAllProducts(products) {
  window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function readPreviewSellerProducts(ownerEmail) {
  if (!ownerEmail) return [];
  const normalizedEmail = ownerEmail.toLowerCase();
  return readAllProducts().filter((product) => product.owner_email === normalizedEmail);
}

export function readAllPreviewSellerProducts() {
  return readAllProducts().map((product) => {
    const ownerEmail = product.owner_email || "";
    const settings = readPreviewSellerSettings(ownerEmail, ownerEmail.split("@")[0]);
    const categoryMap = { books: "academic", electronics: "tech-mobile", clothing: "fashion", food: "food", sports: "marketplace", furniture: "marketplace", beauty: "marketplace", other: "marketplace" };
    return {
      ...product,
      category: categoryMap[product.category] || product.category,
      seller_name: settings.store_name,
      campus: settings.campus,
      image_url: product.image_url || product.images?.[0] || "https://placehold.co/800x700/f1f5f9/475569?text=CampusEcom+Listing",
    };
  });
}

export function createPreviewSellerProduct(ownerEmail, productData) {
  const normalizedEmail = ownerEmail.toLowerCase();
  const products = readAllProducts();
  const product = {
    id: `seller-preview-${Date.now()}`,
    ...productData,
    owner_email: normalizedEmail,
    is_active: false,
    is_approved: false,
    is_submitted: true,
    approval_status: "pending",
    created_at: new Date().toISOString(),
    image_url: productData.images?.[0] || "",
  };
  writeAllProducts([product, ...products]);
  return product;
}

export function setAdminPreviewProductApproval(ownerEmail, productId, status, reason = "") {
  if (!["approved", "rejected"].includes(status)) return { error: "Invalid product decision." };
  if (status === "rejected" && !String(reason).trim()) return { error: "Add a reason before rejecting this product listing." };
  const normalizedEmail = String(ownerEmail || "").toLowerCase();
  const products = readAllProducts();
  const exists = products.some((product) => product.owner_email === normalizedEmail && String(product.id) === String(productId));
  if (!exists) return { error: "Product listing not found." };
  const updated = products.map((product) => product.owner_email === normalizedEmail && String(product.id) === String(productId)
    ? { ...product, approval_status: status, is_approved: status === "approved", is_active: status === "approved", approval_reason: String(reason).trim(), reviewed_at: new Date().toISOString() }
    : product);
  writeAllProducts(updated);
  window.dispatchEvent(new Event("campusecom:preview-products-change"));
  return { product: updated.find((product) => product.owner_email === normalizedEmail && String(product.id) === String(productId)) };
}

export function deletePreviewSellerProduct(ownerEmail, productId) {
  const normalizedEmail = ownerEmail.toLowerCase();
  const products = readAllProducts();
  const nextProducts = products.filter((product) => !(product.owner_email === normalizedEmail && String(product.id) === String(productId)));
  writeAllProducts(nextProducts);
  return nextProducts.filter((product) => product.owner_email === normalizedEmail);
}

export function updatePreviewSellerProduct(ownerEmail, productId, updates) {
  const normalizedEmail = ownerEmail.toLowerCase();
  const products = readAllProducts().map((product) =>
    product.owner_email === normalizedEmail && String(product.id) === String(productId)
      ? { ...product, ...updates }
      : product,
  );
  writeAllProducts(products);
  return products.find((product) => product.owner_email === normalizedEmail && String(product.id) === String(productId)) || null;
}

export function readPreviewSellerSettings(ownerEmail, fallbackName = "") {
  try {
    const settings = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) || "{}");
    return settings[ownerEmail.toLowerCase()] || {
      store_name: fallbackName ? `${fallbackName}'s Campus Store` : "My Campus Store",
      campus: "Great North Road Campus",
      description: "",
    };
  } catch {
    return { store_name: "My Campus Store", campus: "Great North Road Campus", description: "" };
  }
}

export function writePreviewSellerSettings(ownerEmail, settings) {
  let allSettings = {};
  try {
    allSettings = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) || "{}");
  } catch {
    allSettings = {};
  }
  allSettings[ownerEmail.toLowerCase()] = settings;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(allSettings));
}

export function readPreviewSellerOrders(ownerEmail) {
  if (!ownerEmail) return [];
  let orders = [];
  try {
    orders = JSON.parse(window.localStorage.getItem(ORDERS_KEY) || "[]");
  } catch {
    orders = [];
  }
  if (!Array.isArray(orders)) return [];
  const normalizedEmail = ownerEmail.toLowerCase();
  return orders.flatMap((order) => {
    const items = (order.items || []).filter(({ product }) => product?.owner_email === normalizedEmail);
    if (!items.length) return [];
    const subtotal = items.reduce((sum, { product, quantity }) => sum + Number(product.price || 0) * Number(quantity || 0), 0);
    const tracking = order.sellerTracking?.[normalizedEmail] || {};
    return [{ ...order, status: order.sellerStatuses?.[normalizedEmail] || tracking.status || order.status, tracking, items, sellerSubtotal: subtotal }];
  });
}

export function updatePreviewSellerOrderStatus(ownerEmail, orderId, status) {
  return updatePreviewSellerOrderTracking(ownerEmail, orderId, { status });
}

export function updatePreviewSellerOrderTracking(ownerEmail, orderId, updates = {}) {
  if (!ownerEmail) return { error: "Seller account could not be identified." };
  const normalizedEmail = ownerEmail.toLowerCase();
  const orders = (() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(ORDERS_KEY) || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  })();
  const order = orders.find((candidate) => String(candidate.id) === String(orderId));
  if (!order || !(order.items || []).some(({ product }) => product?.owner_email === normalizedEmail)) return { error: "Order not found for this seller." };
  if (["Cancelled", "Refunded"].includes(order.status)) return { error: "This order is no longer active." };
  if (updates.status && (String(updates.status).toLowerCase().includes("ready") || String(updates.status).toLowerCase().includes("deliver") || String(updates.status).toLowerCase().includes("ship")) && order.paymentPreference !== "meetup-cash" && order.paymentStatus !== "Verified") {
    return { error: "Prepaid orders must be verified by an administrator before they can be marked ready for pickup." };
  }
  const previous = order.sellerTracking?.[normalizedEmail] || {
    status: order.sellerStatuses?.[normalizedEmail] || order.status || "Pending seller confirmation",
    note: "",
    events: [{ status: order.sellerStatuses?.[normalizedEmail] || order.status || "Pending seller confirmation", note: "Order placed", at: order.createdAt }],
  };
  const status = updates.status || previous.status;
  const note = typeof updates.note === "string" ? updates.note.trim() : previous.note || "";
  const now = new Date().toISOString();
  const changed = String(status) !== String(previous.status) || note !== (previous.note || "");
  const events = Array.isArray(previous.events) ? [...previous.events] : [];
  if (changed) events.push({ status, note, at: now });
  const cancelled = String(status).toLowerCase() === "cancelled";
  order.sellerStatuses = cancelled
    ? Object.fromEntries(Object.keys(order.sellerTracking || {}).map((email) => [email, "Cancelled"]))
    : { ...(order.sellerStatuses || {}), [normalizedEmail]: status };
  if (cancelled) {
    order.status = "Cancelled";
    if (order.paymentStatus === "Verified") {
      order.paymentStatus = "Refund Pending";
      order.paymentHistory = [...(order.paymentHistory || []), { status: "Refund Pending", note: "Seller cancelled the order; refund review required", actor: normalizedEmail, at: now }];
    }
  }
  order.sellerTracking = {
    ...(order.sellerTracking || {}),
    [normalizedEmail]: { ...previous, status, note, updatedAt: changed ? now : previous.updatedAt || now, events },
  };
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event("campusecom:preview-orders-change"));
  return { success: true };
}
