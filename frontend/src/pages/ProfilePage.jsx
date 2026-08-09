import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react"
import { useAuth } from "../contexts/AuthContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser, faEnvelope, faPhone, faSave, faSpinner, faStore, faBox } from "@fortawesome/free-solid-svg-icons"
import Breadcrumb from "../components/common/Breadcrumb"
import ProductCard from "../components/product/ProductCard"
import api from "../services/api"
import toast from "react-hot-toast"

const ProfilePage = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // Public Profile States
  const [profile, setProfile] = useState(null)
  const [sellerProducts, setSellerProducts] = useState([])
  const [pageLoading, setPageLoading] = useState(true)

  // Edit Profile Form States
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: ""
  })

  const isPublicSellerView = Boolean(id)

  useEffect(() => {
    if (isPublicSellerView) {
      fetchPublicSellerProfile()
    } else {
      if (user) {
        setFormData({
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          phone: user.phone || ""
        })
      }
      setPageLoading(false)
    }
  }, [id, user])

  const fetchPublicSellerProfile = async () => {
    setPageLoading(true)
    try {
      // Fetch public seller details using the dedicated endpoint
      const userRes = await api.get(`/users/profile/${id}/`)
      setProfile(userRes.data)

      // Fetch products listed by this specific seller ID
      const productsRes = await api.get(`/products/?seller=${id}`)
      const productsData = productsRes.data.results || productsRes.data || []
      setSellerProducts(productsData)
    } catch (error) {
      console.error("Failed to fetch seller profile:", error)
      toast.error("Could not load seller profile")
    } finally {
      setPageLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.patch('/users/me/', formData)
      toast.success("Profile updated successfully!")
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-amber-500" />
      </div>
    )
  }

  // --- 1. PUBLIC SELLER PROFILE VIEW ---
  if (isPublicSellerView) {
    const sellerName = profile?.full_name || 
      `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 
      profile?.username || 
      "Campus Seller"

    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
        <div className="container-custom max-w-6xl">
          <Breadcrumb />

          {/* Seller Header Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-full flex items-center justify-center text-3xl font-bold">
              <FontAwesomeIcon icon={faStore} />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {sellerName}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {profile?.role ? profile.role.toUpperCase() : "SELLER"}
              </p>
            </div>
          </div>

          {/* Seller Products Section */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FontAwesomeIcon icon={faBox} className="text-amber-500" />
              Seller's Listings ({sellerProducts.length})
            </h2>
          </div>

          {sellerProducts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center text-gray-500 shadow-sm">
              No active listings found for this seller.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sellerProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // --- 2. PRIVATE LOGGED-IN USER EDIT PROFILE VIEW ---
  if (!user) return null

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="container-custom max-w-2xl">
        <Breadcrumb />
        
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">My Profile</h1>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
              <input type="email" value={user.email} disabled className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">First Name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {loading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <><FontAwesomeIcon icon={faSave} /> Save Changes</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage