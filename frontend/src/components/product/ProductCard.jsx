import { Link } from "react-router-dom"
import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faShoppingCart, faHeart, faEye, faEdit, faTrash, faSpinner } from "@fortawesome/free-solid-svg-icons"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../services/api"
import toast from "react-hot-toast"

const ProductCard = ({ product, onAddToCart, onAddToWishlist, onEdit, onDelete, isOwner = false, showManagement = false }) => {
  const { user, isAuthenticated } = useAuth()
  const [addingToWishlist, setAddingToWishlist] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  
  // Determine if current user is the owner of this product
  const isProductOwner = isAuthenticated && user && product?.seller_id && Number(product.seller_id) === Number(user?.id)
  
  const price = parseFloat(product.price) || 0
  
  // Only show management buttons for sellers who own this product
  const shouldShowManagement = (user?.role === "seller" && isProductOwner) || showManagement
  
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
      toast.success("Added to wishlist! ??")
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
      toast.success("Added to cart! ??")
      if (onAddToCart) onAddToCart(product.id)
    } catch (error) {
      toast.error("Failed to add to cart")
    } finally {
      setAddingToCart(false)
    }
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Product Image */}
      <Link to={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image_1 || product.image_url || `https://placehold.co/400x400/amber-500/white?text=${product.name?.charAt(0) || 'P'}`}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = `https://placehold.co/400x400/e5e7eb/9ca3af?text=${product.name?.charAt(0) || 'P'}`
          }}
        />
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
      </Link>
      
      {/* Product Info */}
      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-1 hover:text-amber-500 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-sm text-gray-500 mb-2">
          {product.category_display || product.category || "General"}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
            K{price.toFixed(2)}
          </span>
          {!isProductOwner && product.stock > 0 && (
            <span className="text-xs text-green-600">In Stock</span>
          )}
        </div>
        
        {/* Action Buttons */}
        {shouldShowManagement ? (
          // Management buttons for product owners (sellers)
          <div className="flex gap-2">
            <Link
              to={`/seller/products/edit/${product.id}`}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
            >
              <FontAwesomeIcon icon={faEdit} />
              Edit
            </Link>
            <button
              onClick={onDelete ? () => onDelete(product.id) : undefined}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
            >
              <FontAwesomeIcon icon={faTrash} />
              Delete
            </button>
          </div>
        ) : (
          // Buyer buttons - Only show for buyers (not sellers)
          !isProductOwner && user?.role !== "seller" && (
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock === 0}
                className={`flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1 ${
                  product.stock === 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {addingToCart ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                ) : (
                  <FontAwesomeIcon icon={faShoppingCart} />
                )}
                {addingToCart ? "Adding..." : "Cart"}
              </button>
              <button
                onClick={handleAddToWishlist}
                disabled={addingToWishlist}
                className="px-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
              >
                {addingToWishlist ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin text-amber-500" />
                ) : (
                  <FontAwesomeIcon icon={faHeart} className="text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors" />
                )}
              </button>
            </div>
          )
        )}
        
        {/* View Details Link */}
        <Link
          to={`/products/${product.id}`}
          className="mt-3 block text-center text-xs text-gray-500 hover:text-amber-500 transition-colors"
        >
          <FontAwesomeIcon icon={faEye} className="mr-1" />
          View Details
        </Link>
      </div>
    </div>
  )
}

export default ProductCard
