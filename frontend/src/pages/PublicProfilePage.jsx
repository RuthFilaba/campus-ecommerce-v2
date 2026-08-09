import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faStar, 
  faStore, 
  faUser, 
  faPhone, 
  faShoppingBag,
  faCheckCircle,
  faSpinner,
  faArrowLeft,
  faMessage
} from "@fortawesome/free-solid-svg-icons"
import toast from "react-hot-toast"

const PublicProfilePage = () => {
  const { userId } = useParams()
  const { user: currentUser, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [userId])

  // Helper to isolate only this seller's products
  const filterBySeller = (rawList, targetId) => {
    return rawList.filter((product) => {
      const sellerId =
        product.seller?.id ||
        product.seller_id ||
        product.seller ||
        product.user_id ||
        product.user
      return String(sellerId) === String(targetId)
    })
  }

  const fetchUserData = async () => {
    setLoading(true)

    try {
      let userData = null
      let filteredProducts = []

      // 1. Fetch products using possible query param variations
      const productsResponse = await api.get(`/products/?seller_id=${userId}`)
      let rawProducts = []
      if (productsResponse.data?.results) {
        rawProducts = productsResponse.data.results
      } else if (Array.isArray(productsResponse.data)) {
        rawProducts = productsResponse.data
      }

      // Filter locally to prevent displaying other sellers' items if backend didn't filter
      filteredProducts = filterBySeller(rawProducts, userId)

      // 2. Determine profile details
      if (currentUser?.id == userId) {
        const response = await api.get('/users/me/')
        userData = response.data.user || response.data
      } else if (filteredProducts.length > 0) {
        const firstProduct = filteredProducts[0]
        userData = {
          id: parseInt(userId),
          email: firstProduct.seller_email || `user${userId}@campusecom.zm`,
          first_name: firstProduct.seller_name?.split(' ')[0] || "Campus",
          last_name: firstProduct.seller_name?.split(' ')[1] || "Seller",
          full_name: firstProduct.seller_name || "Campus Seller",
          role: "seller",
          rating: firstProduct.seller_rating || "4.5",
          review_count: firstProduct.seller_review_count || 0,
          total_sales: firstProduct.seller_total_sales || 0,
          is_verified: firstProduct.seller_verified || false,
          phone: "",
          bio: `Seller on CampusEcom since ${new Date().getFullYear()}`
        }
      } else {
        userData = {
          id: parseInt(userId),
          email: `user${userId}@campusecom.zm`,
          first_name: "Campus",
          last_name: "User",
          full_name: "Campus User",
          role: "user",
          rating: "0.00",
          review_count: 0,
          total_sales: 0,
          is_verified: false,
          phone: "",
          bio: "Member of CampusEcom community"
        }
      }

      setProfile(userData)
      setProducts(filteredProducts)

    } catch (error) {
      console.error("Failed to fetch profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChat = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to chat")
      navigate("/login")
      return
    }

    if (currentUser?.id == profile?.id) {
      toast.error("You cannot chat with yourself")
      return
    }

    if (products.length === 0) {
      toast.error("No products available to chat about")
      return
    }

    try {
      const response = await api.post('/chat/create-thread/', {
        product_id: products[0].id,
        initial_message: `Hi! I'm interested in your products.`
      })

      if (response.data.success) {
        toast.success("Chat opened!")
        navigate("/chat", {
          state: {
            productId: products[0].id,
            initialMessage: `Hi! I'm interested in your products.`
          }
        })
      }
    } catch (error) {
      console.error("Failed to start chat:", error)
      toast.error("Failed to start chat")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-amber-500" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">User not found</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-amber-500 text-white px-6 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id == profile?.id
  const isSeller = profile.role === "seller" || products.length > 0
  const rating = parseFloat(profile.rating) || 0
  const reviewCount = profile.review_count || 0
  const totalSales = profile.total_sales || 0
  const displayName = profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email?.split('@')[0] || "User"

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="container-custom max-w-5xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-amber-500 transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="relative">
            <div className="h-32 bg-gradient-to-r from-amber-500 to-amber-600"></div>
            <div className="absolute -bottom-12 left-6">
              <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg">
                <div className="w-full h-full bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon 
                    icon={isSeller ? faStore : faUser} 
                    className="text-4xl text-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-16 pb-6 px-6">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  {displayName}
                  {profile.is_verified && (
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-sm" />
                  )}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">{profile.email}</span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                    {isSeller ? "Seller" : "Buyer"}
                  </span>
                </div>
                
                <div className="flex gap-4 mt-3">
                  {isSeller && (
                    <>
                      <div className="text-center">
                        <p className="text-xl font-bold text-amber-600">{totalSales}</p>
                        <p className="text-xs text-gray-500">Total Sales</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-amber-600">{products.length}</p>
                        <p className="text-xs text-gray-500">Products</p>
                      </div>
                    </>
                  )}
                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faStar} className="text-amber-400 text-sm" />
                      <p className="text-xl font-bold text-amber-600">{rating.toFixed(1)}</p>
                    </div>
                    <p className="text-xs text-gray-500">{reviewCount} Reviews</p>
                  </div>
                </div>
              </div>

              {!isOwnProfile && isAuthenticated && products.length > 0 && (
                <button
                  onClick={handleChat}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg transition-colors"
                >
                  <FontAwesomeIcon icon={faMessage} />
                  Message
                </button>
              )}
            </div>

            {profile.bio && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400">{profile.bio}</p>
              </div>
            )}
          </div>
        </div>

        {isSeller && products.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faShoppingBag} className="text-amber-500" />
              Products by {displayName}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <img
                      src={product.image_1 || product.image_url || `https://placehold.co/300x300/amber-500/white?text=${product.name?.charAt(0) || 'P'}`}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = `https://placehold.co/300x300/amber-500/white?text=${product.name?.charAt(0) || 'P'}`
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
                    <p className="text-amber-600 font-bold text-sm mt-1">
                      ZMW {parseFloat(product.price).toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PublicProfilePage