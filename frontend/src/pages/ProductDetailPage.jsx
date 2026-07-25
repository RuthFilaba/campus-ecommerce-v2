import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faShoppingCart, 
  faHeart, 
  faStar, 
  faShare, 
  faChevronLeft,
  faMessage,
  faStore,
  faTruck,
  faSpinner,
  faBox,
  faEdit,
  faTrash,
  faChartLine,
  faChevronRight,
  faChevronLeft as faChevronLeftIcon
} from "@fortawesome/free-solid-svg-icons"
import toast from "react-hot-toast"

const ProductDetailPage = () => {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [addingToCart, setAddingToCart] = useState(false)
  const [addingToWishlist, setAddingToWishlist] = useState(false)
  const [startingChat, setStartingChat] = useState(false)
  const [inWishlist, setInWishlist] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [id])

  useEffect(() => {
    if (isAuthenticated && product && user?.role !== "seller") {
      checkInWishlist()
    }
  }, [product, isAuthenticated, user])

  // Get all images from product (matches backend get_images_list)
  const getProductImages = (product) => {
    const images = []
    if (product?.image_1) images.push(product.image_1)
    if (product?.image_2) images.push(product.image_2)
    if (product?.image_3) images.push(product.image_3)
    if (product?.image_url && images.length === 0) images.push(product.image_url)
    return images
  }

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}/`)
      setProduct(response.data)
    } catch (error) {
      console.error("Failed to fetch product:", error)
      toast.error("Product not found")
      navigate("/products")
    } finally {
      setLoading(false)
    }
  }

  const checkInWishlist = async () => {
    try {
      const response = await api.get(`/wishlist/check/${product.id}/`)
      setInWishlist(response.data.in_wishlist)
    } catch (error) {
      console.error("Failed to check wishlist status:", error)
    }
  }

  const handleAddToCart = async () => {
    if (user?.role === "seller") {
      toast.error("Seller accounts cannot purchase products. Please create a buyer account.")
      return
    }
    
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart")
      navigate("/login", { state: { from: `/products/${id}` } })
      return
    }

    setAddingToCart(true)
    try {
      await api.post('/cart/add/', { product_id: product.id, quantity })
      toast.success(`Added ${quantity} x ${product.name} to cart!`)
    } catch (error) {
      console.error("Failed to add to cart:", error)
      toast.error(error.response?.data?.message || "Failed to add to cart")
    } finally {
      setAddingToCart(false)
    }
  }

  const handleAddToWishlist = async () => {
    if (user?.role === "seller") {
      toast.error("Seller accounts cannot use wishlist. Please create a buyer account.")
      return
    }
    
    if (!isAuthenticated) {
      toast.error("Please login to add to wishlist")
      navigate("/login", { state: { from: `/products/${id}` } })
      return
    }

    setAddingToWishlist(true)
    try {
      await api.post('/wishlist/add/', { product_id: product.id })
      setInWishlist(true)
      toast.success("Added to wishlist!")
    } catch (error) {
      if (error.response?.data?.error?.includes("own product")) {
        toast.error("You cannot add your own product to wishlist")
      } else {
        toast.error("Failed to add to wishlist")
      }
    } finally {
      setAddingToWishlist(false)
    }
  }

  const handleBuyNow = async () => {
    if (user?.role === "seller") {
      toast.error("Seller accounts cannot purchase products. Please create a buyer account.")
      return
    }
    
    if (!isAuthenticated) {
      toast.error("Please login to proceed with purchase")
      navigate("/login", { state: { from: `/products/${id}` } })
      return
    }

    setAddingToCart(true)
    try {
      await api.post('/cart/add/', { product_id: product.id, quantity })
      navigate("/checkout")
    } catch (error) {
      console.error("Failed to add to cart:", error)
      toast.error(error.response?.data?.message || "Failed to proceed")
    } finally {
      setAddingToCart(false)
    }
  }

  const handleChat = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to chat")
      navigate("/login")
      return
    }

    if (isOwner) {
      toast.error("You cannot chat about your own product")
      return
    }

    setStartingChat(true)
    
    try {
      navigate("/messages", { 
        state: { 
          productId: product.id,
          productName: product.name,
          productPrice: product.price,
          productImage: product.image_1 || product.image_url,
          sellerId: product.seller_id,
          sellerName: product.seller_name,
          initialMessage: `Hi! I'm interested in your product: ${product.name}`
        } 
      })
    } catch (error) {
      console.error("Failed to start chat:", error)
      toast.error("Failed to start chat")
    } finally {
      setStartingChat(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return
    }
    
    try {
      await api.delete(`/products/${product.id}/`)
      toast.success("Product deleted successfully")
      navigate("/seller/products")
    } catch (error) {
      console.error("Failed to delete product:", error)
      toast.error("Failed to delete product")
    }
  }

  const nextImage = () => {
    const images = getProductImages(product)
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  const prevImage = () => {
    const images = getProductImages(product)
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-amber-500" />
      </div>
    )
  }

  if (!product) return null

  const isOwner = isAuthenticated && user && product.seller_id && Number(product.seller_id) === Number(user?.id)
  const isSellerAccount = user?.role === "seller"
  const isBuyerAccount = isAuthenticated && !isSellerAccount

  const images = getProductImages(product)
  const displayImages = images.length > 0 ? images : [`https://placehold.co/600x600/amber-500/white?text=${product.name?.charAt(0) || 'P'}`]
  const currentImage = displayImages[currentImageIndex] || displayImages[0]

  // Category display (matches backend)
  const categoryMap = {
    'food': 'Food & Drinks',
    'academic': 'Academic',
    'fashion': 'Fashion',
    'tech-mobile': 'Tech & Mobile',
    'events': 'Events & Tickets',
    'marketplace': 'Marketplace'
  }
  const categoryDisplay = categoryMap[product.category] || product.category || 'General'

  // Condition display (matches backend)
  const conditionMap = {
    'new': 'Brand New',
    'like_new': 'Like New',
    'good': 'Good',
    'fair': 'Fair',
    'poor': 'Poor'
  }
  const conditionDisplay = conditionMap[product.condition] || product.condition || 'Good'

  const price = parseFloat(product.price) || 0

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="container-custom max-w-6xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-amber-500 transition-colors"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
          Back
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-6">
            {/* Image Gallery */}
            <div>
              <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {displayImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors"
                    >
                      <FontAwesomeIcon icon={faChevronLeftIcon} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors"
                    >
                      <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                      {displayImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            idx === currentImageIndex ? "bg-amber-500" : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {displayImages.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {displayImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                        currentImageIndex === idx ? "border-amber-500" : "border-transparent"
                      }`}
                    >
                      <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              {/* Featured Badge */}
              {product.is_featured && (
                <span className="inline-block bg-amber-500 text-white text-xs px-2 py-1 rounded-full mb-2">
                  ⭐ Featured Product
                </span>
              )}
              
              <h1 className="text-2xl md:text-3xl font-bold mb-3">{product.name}</h1>
              
              {/* Seller info */}
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faStore} className="text-amber-500 text-sm" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Sold by <span className="font-medium">{product.seller_name || "Campus Seller"}</span>
                  </span>
                </div>
                
                {/* Chat Button - Only for buyers */}
                {isBuyerAccount && !isOwner && (
                  <button
                    onClick={handleChat}
                    disabled={startingChat}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    {startingChat ? (
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    ) : (
                      <FontAwesomeIcon icon={faMessage} />
                    )}
                    {startingChat ? "Opening Chat..." : "Chat with Seller"}
                  </button>
                )}
              </div>

              {/* Price */}
              <div className="mb-4">
                <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  K{price.toFixed(2)}
                </span>
                {product.stock > 0 && product.stock <= 5 && (
                  <span className="ml-3 text-sm text-orange-500">🔥 Only {product.stock} left!</span>
                )}
              </div>

              {/* Category & Condition */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                  📂 {categoryDisplay}
                </span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                  📦 {conditionDisplay}
                </span>
                {product.is_approved && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    ✅ Verified
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FontAwesomeIcon 
                      key={star} 
                      icon={faStar} 
                      className={star <= (product.rating || 4) ? "text-amber-400" : "text-gray-300"}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({product.review_count || 0} reviews)</span>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {product.description || "No description available."}
                </p>
              </div>

              {/* SELLER MANAGEMENT PANEL */}
              {isOwner && (
                <div className="mb-6 space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                    <p className="text-blue-700 dark:text-blue-300 font-semibold">
                      <FontAwesomeIcon icon={faStore} className="mr-2" />
                      Manage Your Product
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">
                      Stock: {product.stock} items available
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Link
                      to={`/seller/products/edit/${product.id}`}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors text-center flex items-center justify-center gap-2"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                      Edit Product
                    </Link>
                    <Link
                      to="/seller/products"
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors text-center flex items-center justify-center gap-2"
                    >
                      <FontAwesomeIcon icon={faChartLine} />
                      All Products
                    </Link>
                    <button
                      onClick={handleDeleteProduct}
                      className="px-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {/* BUYER PURCHASE SECTION */}
              {isBuyerAccount && !isOwner && (
                <>
                  {product.stock > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Quantity</h3>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-medium">{quantity}</span>
                        <button
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 mb-6">
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart || product.stock === 0}
                      className={`flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                    >
                      <FontAwesomeIcon icon={faShoppingCart} />
                      {addingToCart ? "Adding..." : (product.stock === 0 ? "Out of Stock" : "Add to Cart")}
                    </button>
                    <button
                      onClick={handleBuyNow}
                      disabled={addingToCart || product.stock === 0}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Buy Now
                    </button>
                    <button
                      onClick={handleAddToWishlist}
                      disabled={addingToWishlist || inWishlist}
                      className={`px-6 py-3 border rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        inWishlist 
                          ? "bg-red-50 border-red-300 text-red-500" 
                          : "border-gray-300 hover:bg-gray-100"
                      }`}
                      title={inWishlist ? "Already in wishlist" : "Add to wishlist"}
                    >
                      {addingToWishlist ? (
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                      ) : (
                        <FontAwesomeIcon icon={faHeart} className={inWishlist ? "text-red-500" : ""} />
                      )}
                    </button>
                    <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                      <FontAwesomeIcon icon={faShare} />
                    </button>
                  </div>

                  {product.stock === 0 && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                      <p className="text-red-600 dark:text-red-400 font-semibold">Out of Stock</p>
                    </div>
                  )}

                  {product.stock > 0 && product.stock <= 5 && (
                    <p className="text-sm text-orange-500 mb-4">🔥 Only {product.stock} left in stock!</p>
                  )}
                </>
              )}

              {/* SELLER VIEWING OTHER PRODUCTS */}
              {isSellerAccount && !isOwner && (
                <div className="mb-6 p-6 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                  <FontAwesomeIcon icon={faStore} className="text-amber-500 text-3xl mb-3" />
                  <p className="text-gray-700 dark:text-gray-300 font-semibold">
                    Seller Account Mode
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Your account is configured for selling only.<br />
                    To purchase items, please register as a buyer.
                  </p>
                </div>
              )}

              {/* Shipping info */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm flex items-center gap-2">
                  <FontAwesomeIcon icon={faTruck} className="text-amber-500" />
                  Free meetup on campus - Arrange pickup at your convenience
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage