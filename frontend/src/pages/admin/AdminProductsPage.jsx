import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../services/api"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faSpinner, 
  faSearch, 
  faCheck, 
  faTimes, 
  faStar,
  faStarHalfAlt,
  faEye,
  faEdit,
  faTrash
} from "@fortawesome/free-solid-svg-icons"
import toast from "react-hot-toast"

const AdminProductsPage = () => {
  const { user, isAdmin } = useAuth()
  const [products, setProducts] = useState([])
  const [pendingProducts, setPendingProducts] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!isAdmin) return
    fetchAllData()
  }, [isAdmin])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [allRes, pendingRes, featuredRes] = await Promise.all([
        api.get('/products/'),
        api.get('/products/pending/'),
        api.get('/products/featured/')
      ])
      
      setProducts(allRes.data.results || allRes.data || [])
      setPendingProducts(pendingRes.data.results || pendingRes.data || [])
      setFeaturedProducts(featuredRes.data.results || featuredRes.data || [])
    } catch (error) {
      console.error("Failed to fetch data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (productId) => {
    try {
      await api.post(`/products/${productId}/approve/`)
      toast.success("Product approved!")
      fetchAllData()
    } catch (error) {
      toast.error("Failed to approve product")
    }
  }

  const handleReject = async (productId) => {
    try {
      await api.post(`/products/${productId}/reject/`)
      toast.success("Product rejected")
      fetchAllData()
    } catch (error) {
      toast.error("Failed to reject product")
    }
  }

  const handleToggleFeatured = async (productId, isCurrentlyFeatured) => {
    try {
      if (isCurrentlyFeatured) {
        await api.delete(`/products/admin/featured/${productId}/`)
        toast.success("Removed from featured")
      } else {
        await api.post('/products/admin/featured/', { product_id: productId })
        toast.success("Added to featured")
      }
      fetchAllData()
    } catch (error) {
      toast.error("Failed to update featured status")
    }
  }

  const handleDelete = async (productId) => {
    if (!confirm("Delete this product permanently?")) return
    try {
      await api.delete(`/products/${productId}/delete/`)
      toast.success("Product deleted")
      fetchAllData()
    } catch (error) {
      toast.error("Failed to delete product")
    }
  }

  const filterProducts = (productsList) => {
    if (!searchTerm) return productsList
    return productsList.filter(p => 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.seller_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-amber-500" />
      </div>
    )
  }

  const renderProductTable = (productsList, showActions = true) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            {showActions && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {filterProducts(productsList).map((product) => (
            <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img src={product.image_1 || product.image_url} alt={product.name} className="w-10 h-10 rounded object-cover" />
                  <span className="font-medium">{product.name}</span>
                </div>
              </td>
              <td className="px-4 py-3">{product.seller_name || product.seller?.name}</td>
              <td className="px-4 py-3">ZMW {product.price}</td>
              <td className="px-4 py-3">
                {product.is_approved ? (
                  <span className="text-green-600">? Approved</span>
                ) : (
                  <span className="text-yellow-600">? Pending</span>
                )}
              </td>
              {showActions && (
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(product.id)} className="p-1 text-green-500 hover:bg-green-50 rounded" title="Approve">
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                    <button onClick={() => handleReject(product.id)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Reject">
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                    <button onClick={() => handleToggleFeatured(product.id, product.is_featured)} className="p-1 text-amber-500 hover:bg-amber-50 rounded" title="Featured">
                      <FontAwesomeIcon icon={product.is_featured ? faStar : faStarHalfAlt} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Delete">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="container-custom">
        <h1 className="text-2xl font-bold mb-6">Product Management</h1>
        
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button onClick={() => setActiveTab("all")} className={`px-4 py-2 ${activeTab === "all" ? "border-b-2 border-amber-500 text-amber-500" : ""}`}>
            All Products ({products.length})
          </button>
          <button onClick={() => setActiveTab("pending")} className={`px-4 py-2 ${activeTab === "pending" ? "border-b-2 border-amber-500 text-amber-500" : ""}`}>
            Pending ({pendingProducts.length})
          </button>
          <button onClick={() => setActiveTab("featured")} className={`px-4 py-2 ${activeTab === "featured" ? "border-b-2 border-amber-500 text-amber-500" : ""}`}>
            Featured ({featuredProducts.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === "all" && renderProductTable(products, true)}
        {activeTab === "pending" && renderProductTable(pendingProducts, true)}
        {activeTab === "featured" && renderProductTable(featuredProducts, false)}
      </div>
    </div>
  )
}

export default AdminProductsPage
