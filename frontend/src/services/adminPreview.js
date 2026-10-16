import { categories as defaultCategories } from "../data/previewProducts";
import { readPreviewOrders } from "./previewOrders";

const USERS_KEY = "campusecom.previewUsers.v1";
const COUPONS_KEY = "campusecom.adminCoupons.v1";
const CATEGORIES_KEY = "campusecom.adminCategories.v1";
const AUDIT_KEY = "campusecom.adminAudit.v1";
const TAX_RATE_KEY = "campusecom.previewTaxRate.v1";

const demoUsers = [
  { id: "demo-buyer", email: "buyer@campusecom.zm", first_name: "Preview", last_name: "Buyer", role: "buyer", is_active: true },
  { id: "demo-seller", email: "seller@campusecom.zm", first_name: "Preview", last_name: "Seller", role: "seller", is_active: true },
  { id: "demo-admin", email: "admin@campusecom.zm", first_name: "Preview", last_name: "Admin", role: "admin", is_active: true },
];

const defaultCoupons = [
  { id: "WELCOME10", code: "WELCOME10", discount_type: "percentage", discount_value: 10, is_active: true },
  { id: "CAMPUS5", code: "CAMPUS5", discount_type: "fixed", discount_value: 50, is_active: true },
];

function readArray(key, fallback = []) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || "null");
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function writeArray(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function readAdminPreviewAudit() {
  return readArray(AUDIT_KEY).slice(0, 200);
}

export function recordAdminPreviewAudit(action, target, actor = "Preview administrator") {
  const records = readAdminPreviewAudit();
  writeArray(AUDIT_KEY, [{ id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, createdAt: new Date().toISOString(), actor, action, target }, ...records].slice(0, 200));
}

export function readAdminPreviewTaxRate() {
  const rate = Number(window.localStorage.getItem(TAX_RATE_KEY));
  return Number.isFinite(rate) && rate >= 0 && rate <= 100 ? rate : 0;
}

export function writeAdminPreviewTaxRate(rate) {
  const value = Number(rate);
  if (!Number.isFinite(value) || value < 0 || value > 100) return false;
  window.localStorage.setItem(TAX_RATE_KEY, String(value));
  return true;
}

export function readAdminPreviewUsers() {
  const users = readArray(USERS_KEY);
  const known = new Set(users.map((user) => user.email?.toLowerCase()));
  return [...users, ...demoUsers.filter((user) => !known.has(user.email))].map((user) => ({ is_active: true, ...user }));
}

export function setAdminPreviewUserActive(userId, isActive) {
  const users = readArray(USERS_KEY);
  const target = users.find((user) => String(user.id) === String(userId));
  if (!target) return false;
  writeArray(USERS_KEY, users.map((user) => String(user.id) === String(userId) ? { ...user, is_active: isActive } : user));
  return true;
}

export function readAdminPreviewCoupons() {
  return readArray(COUPONS_KEY, defaultCoupons);
}

export function addAdminPreviewCoupon(data) {
  const coupons = readAdminPreviewCoupons();
  const code = data.code.trim().toUpperCase();
  if (!code || coupons.some((coupon) => coupon.code === code)) return { error: "That coupon code already exists." };
  const coupon = { id: `preview-${Date.now()}`, code, discount_type: data.discount_type, discount_value: Number(data.discount_value), is_active: true };
  writeArray(COUPONS_KEY, [coupon, ...coupons]);
  return { coupon };
}

export function toggleAdminPreviewCoupon(couponId) {
  const coupons = readAdminPreviewCoupons().map((coupon) => String(coupon.id) === String(couponId) ? { ...coupon, is_active: !coupon.is_active } : coupon);
  writeArray(COUPONS_KEY, coupons);
  return coupons;
}

export function removeAdminPreviewCoupon(couponId) {
  const coupons = readAdminPreviewCoupons().filter((coupon) => String(coupon.id) !== String(couponId));
  writeArray(COUPONS_KEY, coupons);
  return coupons;
}

export function readAdminPreviewCategories(defaultCategories) {
  const saved = readArray(CATEGORIES_KEY);
  const base = defaultCategories.map((category) => ({ id: category.id, label: category.label, is_active: true }));
  const merged = base.map((category) => saved.find((item) => item.id === category.id) || category);
  return [...saved.filter((item) => !base.some((category) => category.id === item.id)), ...merged];
}

export function addAdminPreviewCategory(label) {
  const categories = readAdminPreviewCategories(defaultCategories);
  const id = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!id || categories.some((category) => category.id === id)) return { error: "That category already exists or is invalid." };
  const category = { id, label: label.trim(), is_active: true };
  writeArray(CATEGORIES_KEY, [category, ...categories]);
  return { category };
}

export function toggleAdminPreviewCategory(categoryId) {
  const allCategories = readAdminPreviewCategories(defaultCategories);
  const categories = allCategories.map((category) => String(category.id) === String(categoryId) ? { ...category, is_active: !category.is_active } : category);
  writeArray(CATEGORIES_KEY, categories);
  return categories;
}

export function validateAdminPreviewCoupon(code, subtotal, buyerEmail = "") {
  const normalized = code.trim().toUpperCase();
  const coupon = readAdminPreviewCoupons().find((item) => item.code === normalized && item.is_active);
  if (!coupon) return { error: "That coupon is invalid or inactive." };
  if (buyerEmail && readPreviewOrders().some((order) => order.buyerEmail?.toLowerCase() === buyerEmail.toLowerCase() && order.couponCode === normalized)) {
    return { error: "This coupon has already been used by your account." };
  }
  const value = Number(coupon.discount_value) || 0;
  const discount = coupon.discount_type === "percentage" ? subtotal * value / 100 : value;
  return { coupon, discount_amount: Math.min(Math.max(discount, 0), Math.max(Number(subtotal) || 0, 0)) };
}
