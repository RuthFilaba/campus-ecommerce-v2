export function getProductImages(product) {
  if (!product) return [];
  const images = [
    product.image_1,
    product.image_2,
    product.image_3,
    ...(Array.isArray(product.images) ? product.images : []),
    product.image_url,
  ];
  return [...new Set(images.filter((image) => typeof image === "string" && image.trim()))];
}

export function getProductPrimaryImage(product, fallback = "") {
  return getProductImages(product)[0] || fallback;
}
