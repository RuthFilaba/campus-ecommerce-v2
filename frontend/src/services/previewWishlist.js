const WISHLIST_KEY = "campusecom.previewWishlist.v1";

export function readPreviewWishlist() {
  try {
    const value = JSON.parse(window.localStorage.getItem(WISHLIST_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function writePreviewWishlist(productIds) {
  window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(productIds));
  return productIds;
}
