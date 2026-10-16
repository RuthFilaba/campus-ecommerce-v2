import { useState } from "react"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrash, faPlus, faMinus, faHeart } from "@fortawesome/free-solid-svg-icons"
import { motion } from "framer-motion"
import { getProductPrimaryImage } from "../../utils/productImages"

const CartItem = ({ item, onUpdateQuantity, onRemove, onMoveToWishlist }) => {
  const [updating, setUpdating] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Get product data from product_detail (your backend structure)
  const productDetail = item.product_detail || {}
  const productId = item.product || productDetail.id
  
  // Product details
  const name = productDetail.name || "Product"
  const price = parseFloat(productDetail.price) || 0
  const quantity = item.quantity || 1
  const stock = productDetail.stock || 999
  const sellerName = productDetail.seller_name || "Campus Seller"
  const itemId = item.id

  // Get image URL - use primary_image or first image from images array
  const getImageUrl = () => {
    if (imageError) {
      return `https://placehold.co/128x128/amber-500/white?text=${encodeURIComponent(name.charAt(0))}`
    }
    
    // Try primary_image first (your backend provides this)
    if (productDetail.primary_image && productDetail.primary_image !== 'null') {
      return productDetail.primary_image
    }
    
    // Try image_url
    if (productDetail.image_url && productDetail.image_url !== 'null') {
      return productDetail.image_url
    }
    
    // Try images array
    if (productDetail.images && productDetail.images.length > 0) {
      return productDetail.images[0]
    }
    
    // Try image_1, image_2, image_3
    if (productDetail.image_1 && productDetail.image_1 !== 'null') {
      return productDetail.image_1
    }
    if (productDetail.image_2 && productDetail.image_2 !== 'null') {
      return productDetail.image_2
    }
    if (productDetail.image_3 && productDetail.image_3 !== 'null') {
      return productDetail.image_3
    }
    
    // Fallback to placeholder
    return `https://placehold.co/128x128/amber-500/white?text=${encodeURIComponent(name.charAt(0))}`
  }

  const imageUrl = getProductPrimaryImage(productDetail, getImageUrl())

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return
    if (newQuantity > stock) {
      alert(`Only ${stock} items available in stock`)
      return
    }
    
    setUpdating(true)
    await onUpdateQuantity(itemId, newQuantity)
    setUpdating(false)
  }

  const handleRemove = async () => {
    if (confirm("Remove this item from cart?")) {
      await onRemove(itemId)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col sm:flex-row gap-4 py-6 border-b border-gray-200 dark:border-gray-700"
    >
      {/* Product Image */}
      <Link to={`/products/${productId}`} className="sm:w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => {
            console.log("Image failed to load:", imageUrl)
            setImageError(true)
          }}
        />
      </Link>

      {/* Product Details */}
      <div className="flex-1">
        <Link to={`/products/${productId}`}>
          <h3 className="font-semibold text-gray-800 dark:text-white hover:text-amber-500 transition-colors">
            {name}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Seller: {sellerName}
        </p>
        
        {/* Condition badge */}
        {productDetail.condition_display && (
          <span className="inline-block mt-1 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
            {productDetail.condition_display}
          </span>
        )}
        
        {/* Mobile Price */}
        <div className="sm:hidden mt-2">
          <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
            K {(price * quantity).toFixed(2)}
          </span>
          <span className="text-sm text-gray-500 ml-2">
            K {price.toFixed(2)} each
          </span>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={updating || quantity <= 1}
              className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              <FontAwesomeIcon icon={faMinus} className="text-xs" />
            </button>
            <span className="px-4 py-1 min-w-[50px] text-center text-sm">
              {updating ? "..." : quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={updating || quantity >= stock}
              className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} className="text-xs" />
            </button>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleRemove}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Remove from cart"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
            <button
              onClick={() => onMoveToWishlist?.(productId)}
              className="p-2 text-gray-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
              title="Move to wishlist"
            >
              <FontAwesomeIcon icon={faHeart} />
            </button>
          </div>
        </div>
        
        {/* Stock warning */}
        {stock <= 5 && stock > 0 && (
          <p className="text-xs text-orange-500 mt-2">Only {stock} left in stock</p>
        )}
      </div>

      {/* Desktop Price */}
      <div className="hidden sm:flex flex-col items-end justify-between">
        <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
          K {(price * quantity).toFixed(2)}
        </span>
        <span className="text-sm text-gray-500">
          K {price.toFixed(2)} each
        </span>
      </div>
    </motion.div>
  )
}

export default CartItem
