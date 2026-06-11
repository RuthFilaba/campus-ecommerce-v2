import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../services/api"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faHeart, 
  faTrash, 
  faShoppingCart, 
  faSpinner,
  faStar,
  faEye,
  faArrowRight,
  faStore
} from "@fortawesome/free-solid-svg-icons"
import toast from "react-hot-toast"

const WishlistPage = () => {
  const { user, isAuthenticated } = useAuth()
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState(null)
  const [addingToCart, setAddingToCart] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) return
    fetchWishlist()
  }, [isAuthenticated])

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/wishlist/')
      console.log("Wishlist data:", response.data)
      
      let items = []
      
      // Handle the nested structure from your backend
      if (response.data.items && Array.isArray(response.data.items)) {
        // Structure: { id, user, items: [{ id, product, product_details, added_at }], total_items }
        items = response.data.items.map(item => ({
          id: item.product_details?.id || item.product,
          wishlist_item_id: item.id,
          name: item.product_details?.name,
          price: parseFloat(item.product_details?.price) || 0,
          description: item.product_details?.description,
          image_1: item.product_details?.image_1,
          image_url: item.product_details?.image_url,
          stock: item.product_details?.stock || 0,
          condition: item.product_details?.condition,
          category: item.product_details?.category,
          seller_id: item.product_details?.seller_id,
          seller_name: item.product_details?.seller_name,
          rating: item.product_details?.rating || 4.5,
          review_count: item.product_details?.review_count || 0,
          added_at: item.added_at
        }))
        console.log("Processed items from product_details:", items)
      } else if (response.data.results && Array.isArray(response.data.results)) {
        items = response.data.results
      } else if (Array.isArray(response.data)) {
        items = response.data
      }
      
      setWishlistItems(items)
    } catch (error) {
      console.error("Failed to fetch wishlist:", error)
      toast.error("Failed to load wishlist")
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (productId, wishlistItemId) => {
    setRemovingId(productId)
    try {
      // Use the correct endpoint for removal
      await api.delete(`/wishlist/remove/`, { data: { product_id: productId } })
      
      toast.success("Removed from wishlist")
      setWishlistItems(prev => prev.filter(item => item.id !== productId))
    } catch (error) {
      console.error("Failed to remove from wishlist:", error)
      toast.error("Failed to remove item")
    } finally {
      setRemovingId(null)
    }
  }

  const addToCart = async (productId) => {
    // Block sellers from adding to cart
    if (user?.role === "seller") {
      toast.error("Seller accounts cannot purchase products. Please create a buyer account to shop.")
      return
    }
    
    setAddingToCart(productId)
    try {
      await api.post('/cart/add/', { product_id: productId, quantity: 1 })
      toast.success("Added to cart! ??")
    } catch (error) {
      console.error("Failed to add to cart:", error)
      toast.error(error.response?.data?.message || "Failed to add to cart")
    } finally {
      setAddingToCart(null)
    }
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 max-w-md">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <FontAwesomeIcon icon={faHeart} className="text-gray-400 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Login to View Wishlist</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Save your favorite items and shop them later</p>
          <Link 
            to="/login" 
            state={{ from: "/wishlist" }}
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Login Now
          </Link>
        </div>
      </div>
    )
  }

  // Show seller restriction message
  if (user?.role === "seller") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 max-w-md">
          <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <FontAwesomeIcon icon={faStore} className="text-blue-500 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Seller Account Detected</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Wishlist is for buyers only. As a seller, you can manage your products from the seller dashboard.
          </p>
          <Link 
            to="/seller/products" 
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Go to Seller Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-amber-500" />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
      <div className="container-custom max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
            <FontAwesomeIcon icon={faHeart} className="text-amber-500" />
            My Wishlist
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faHeart} className="text-4xl text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Save items you love by clicking the heart icon on products</p>
            <Link 
              to="/products" 
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              Start Shopping
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => {
              const productId = item.id
              const productName = item.name
              const productPrice = item.price
              const productImage = item.image_1 || item.image_url || `https://placehold.co/300x300/e5e7eb/9ca3af?text=${productName?.charAt(0) || 'P'}`
              const productRating = item.rating || 4.5
              const isRemoving = removingId === productId
              const isAddingToCart = addingToCart === productId
              const isOutOfStock = item.stock === 0
              
              return (
                <div key={productId} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 dark:border-gray-700">
                  {/* Image Section */}
                  <Link to={`/products/${productId}`} className="relative block overflow-hidden bg-gray-100 aspect-square rounded-t-xl">
                    <img
                      src={productImage}
                      alt={productName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = `https://placehold.co/300x300/e5e7eb/9ca3af?text=${productName?.charAt(0) || 'P'}`
                      }}
                    />
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromWishlist(productId, item.wishlist_item_id)}
                      disabled={isRemoving}
                      className="absolute top-3 right-3 bg-white dark:bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                      title="Remove from wishlist"
                    >
                      {isRemoving ? (
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-red-500 text-sm" />
                      ) : (
                        <FontAwesomeIcon icon={faTrash} className="text-red-500 text-sm" />
                      )}
                    </button>
                    
                    {/* Heart Badge */}
                    <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <FontAwesomeIcon icon={faHeart} className="text-xs" />
                      Saved
                    </div>

                    {/* Out of Stock Overlay */}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Info Section */}
                  <div className="p-4">
                    <Link to={`/products/${productId}`}>
                      <h3 className="font-semibold text-gray-800 dark:text-white hover:text-amber-500 transition-colors line-clamp-2 min-h-[48px]">
                        {productName}
                      </h3>
                    </Link>
                    
                    {/* Seller Info */}
                    {item.seller_name && (
                      <p className="text-xs text-gray-500 mt-1">
                        by {item.seller_name}
                      </p>
                    )}
                    
                    {/* Rating */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex text-amber-400 text-sm">
                        {[...Array(5)].map((_, i) => (
                          <FontAwesomeIcon 
                            key={i} 
                            icon={faStar} 
                            className={i < Math.floor(productRating) ? "text-amber-400" : "text-gray-300 dark:text-gray-600"} 
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">({item.review_count || 0})</span>
                    </div>

                    {/* Price */}
                    <div className="mt-3">
                      <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                        K{productPrice.toFixed(2)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => addToCart(productId)}
                        disabled={isAddingToCart || isOutOfStock}
                        className={`flex-1 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                          isOutOfStock
                            ? "bg-gray-300 cursor-not-allowed text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                            : "bg-amber-500 hover:bg-amber-600 text-white"
                        }`}
                      >
                        {isAddingToCart ? (
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                        ) : (
                          <FontAwesomeIcon icon={faShoppingCart} />
                        )}
                        {isAddingToCart ? "Adding..." : (isOutOfStock ? "Out of Stock" : "Add to Cart")}
                      </button>
                      <Link
                        to={`/products/${productId}`}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
                        title="View Details"
                      >
                        <FontAwesomeIcon icon={faEye} className="text-gray-600 dark:text-gray-400" />
                      </Link>
                    </div>
                    
                    {/* Added date */}
                    {item.added_at && (
                      <p className="text-xs text-gray-400 mt-3">
                        Added: {new Date(item.added_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default WishlistPage
