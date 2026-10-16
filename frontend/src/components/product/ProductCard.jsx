import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faStar, faHeart, faShoppingCart, faSpinner, faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons"
import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../services/api"
import toast from "react-hot-toast"
import { getProductImages } from "../../utils/productImages"
import { formatMoney } from "../../services/currency"

const ProductCard = ({ product, onAddToCart, onAddToWishlist, onEdit, onDelete, isOwner = false, showManagement = false }) => {
  const { user, isAuthenticated } = useAuth()
  const [addingToWishlist, setAddingToWishlist] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  // Determine if current user is the owner of this product
  const isProductOwner = isAuthenticated && user && product?.seller_id && Number(product.seller_id) === Number(user?.id)
  
  const price = parseFloat(product.price) || 0
  
  const allImages = getProductImages(product)
  const imageUrl = allImages[0]
  const productImage = imageUrl && !imageError ? imageUrl : `https://placehold.co/400x400/amber-500/white?text=${product.name?.charAt(0) || 'P'}`
  const hasMultipleImages = allImages.length > 1
  
  // Helper to get category display (matches backend category_display)
  const getCategoryDisplay = () => {
    const categoryMap = {
      'food': 'Food & Drinks',
      'academic': 'Academic',
      'fashion': 'Fashion',
      'tech-mobile': 'Tech & Mobile',
      'events': 'Events & Tickets',
      'marketplace': 'Marketplace'
    }
    return categoryMap[product.category] || product.category || 'General'
  }
  
  // Helper to get condition display (matches backend condition_display)
  const getConditionDisplay = () => {
    const conditionMap = {
      'new': 'Brand New',
      'like_new': 'Like New',
      'good': 'Good',
      'fair': 'Fair',
      'poor': 'Poor'
    }
    return conditionMap[product.condition] || product.condition || 'Good'
  }

  const handleAddToWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      toast.error("Please login to add to wishlist")
      return
    }
    
    if (user?.role === "seller") {
      toast.error("Seller accounts cannot use wishlist. Please create a buyer account.")
      return
    }
    
    setAddingToWishlist(true)
    try {
      await api.post('/wishlist/add/', { product_id: product.id })
      toast.success("Added to wishlist!")
      if (onAddToWishlist) onAddToWishlist(product.id)
    } catch (error) {
      if (error.response?.data?.error?.includes("own product")) {
        toast.error("You cannot add your own product to wishlist")
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error("Failed to add to wishlist")
      }
    } finally {
      setAddingToWishlist(false)
    }
  }
  
  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (user?.role === "seller") {
      toast.error("Seller accounts cannot purchase products. Please create a buyer account.")
      return
    }
    
    if (!isAuthenticated) {
      toast.error("Please login to add to cart")
      return
    }
    
    setAddingToCart(true)
    try {
      await api.post('/cart/add/', { product_id: product.id, quantity: 1 })
      toast.success("Added to cart!")
      if (onAddToCart) onAddToCart(product.id)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to cart")
    } finally {
      setAddingToCart(false)
    }
  }
  
  // Only show management buttons for sellers who own this product
  const shouldShowManagement = (user?.role === "seller" && isProductOwner) || showManagement
  
  // Check if product is featured
  const isFeatured = product.is_featured || false
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Product Image */}
      <Link to={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={productImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />
        
        {/* Featured Badge */}
        {isFeatured && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
            ⭐ Featured
          </span>
        )}
        
        {/* Stock Status */}
        {product.stock <= 5 && product.stock > 0 && !isProductOwner && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
            Low Stock
          </span>
        )}
        {product.stock === 0 && !isProductOwner && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            Out of Stock
          </span>
        )}
        
        {/* Multiple Images Indicator */}
        {hasMultipleImages && (
          <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
            📷 +{allImages.length - 1}
          </span>
        )}
        
        {/* Wishlist Button */}
        <button
          onClick={handleAddToWishlist}
          disabled={addingToWishlist || isProductOwner}
          className={`absolute top-2 right-2 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md transition-colors ${
            isProductOwner ? 'opacity-50 cursor-not-allowed' : 'opacity-0 group-hover:opacity-100 hover:bg-amber-50'
          }`}
        >
          {addingToWishlist ? (
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-amber-500" />
          ) : (
            <FontAwesomeIcon icon={faHeart} className="text-gray-600 hover:text-red-500" />
          )}
        </button>
      </Link>
      
      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <Link to={`/products/${product.id}`} className="flex-1">
            <h3 className="font-semibold text-gray-800 dark:text-white hover:text-amber-500 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
        </div>
        
        {/* Category and Condition Tags */}
        <div className="flex flex-wrap gap-1 mt-1">
          <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
            {getCategoryDisplay()}
          </span>
          <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
            {getConditionDisplay()}
          </span>
        </div>
        
        <p className="text-sm text-gray-500 mt-1">{product.seller_name || product.seller?.full_name || "Campus Seller"}</p>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <FontAwesomeIcon 
                key={i} 
                icon={faStar} 
                className={i < (product.rating || 0) ? "text-amber-400 text-xs" : "text-gray-300 text-xs"} 
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.review_count || 0})</span>
        </div>
        
        {/* Price and Actions */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-xl font-bold text-amber-600">{formatMoney(price)}</span>
          
          {shouldShowManagement ? (
            // Management buttons for product owners (sellers)
            <div className="flex gap-1">
              <Link
                to={`/seller/products/edit/${product.id}`}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit Product"
              >
                <FontAwesomeIcon icon={faEdit} />
              </Link>
              <button
                onClick={onDelete ? () => onDelete(product.id) : undefined}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Product"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          ) : (
            // Buyer buttons - Only show for buyers (not sellers)
            !isProductOwner && user?.role !== "seller" && (
              <div className="flex gap-1">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.stock === 0}
                  className={`px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm transition-colors flex items-center gap-1 ${
                    product.stock === 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {addingToCart ? (
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  ) : (
                    <FontAwesomeIcon icon={faShoppingCart} className="text-xs" />
                  )}
                  {addingToCart ? "Adding..." : "Add"}
                </button>
              </div>
            )
          )}
        </div>
        
        {/* View Details Link */}
        <Link
          to={`/products/${product.id}`}
          className="mt-2 block text-center text-xs text-gray-500 hover:text-amber-500 transition-colors"
        >
          <FontAwesomeIcon icon={faEye} className="mr-1" />
          View Details
        </Link>
      </div>
    </div>
  )
}

export default ProductCard
