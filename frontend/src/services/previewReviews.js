import { getPreviewBuyerOrderStatus, readPreviewOrders } from "./previewOrders";

const REVIEWS_KEY = "campusecom.previewReviews.v1";

function readAllReviews() {
  try {
    const reviews = JSON.parse(window.localStorage.getItem(REVIEWS_KEY) || "[]");
    return Array.isArray(reviews) ? reviews : [];
  } catch {
    return [];
  }
}

export function readPreviewReviews(productId) {
  return readAllReviews().filter((review) => String(review.productId) === String(productId));
}

export function canReviewPreviewProduct(productId, buyerEmail) {
  if (!buyerEmail) return false;
  const email = buyerEmail.toLowerCase();
  return readPreviewOrders().some((order) =>
    order.buyerEmail?.toLowerCase() === email
    && ["delivered", "completed"].includes(String(getPreviewBuyerOrderStatus(order)).toLowerCase())
    && (order.items || []).some(({ product }) => String(product?.id) === String(productId))
  );
}

export function createPreviewReview({ productId, buyerEmail, buyerName, rating, comment }) {
  const reviews = readAllReviews();
  if (reviews.some((review) => String(review.productId) === String(productId) && review.buyerEmail?.toLowerCase() === buyerEmail.toLowerCase())) {
    return { error: "You have already reviewed this product." };
  }
  const review = {
    id: `review-${Date.now()}`,
    productId: String(productId),
    buyerEmail: buyerEmail.toLowerCase(),
    buyerName,
    rating: Math.max(1, Math.min(5, Number(rating) || 0)),
    comment: comment.trim(),
    createdAt: new Date().toISOString(),
  };
  window.localStorage.setItem(REVIEWS_KEY, JSON.stringify([review, ...reviews]));
  return { review };
}
