import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faSpinner,
  faBox,
  faChartLine,
  faExclamationTriangle,
  faCheckCircle,
  faClock
} from "@fortawesome/free-solid-svg-icons"
import api from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import toast from "react-hot-toast"
import { getProductPrimaryImage } from "../utils/productImages"

const SellerProductsPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalViews: 0
  })

  useEffect(() => {
    fetchSellerProducts()
  }, [])

  const fetchSellerProducts = async () => {
    setLoading(true)
    try {
      const response = await api.get('/seller/products/')
      const productsData = response.data.results || response.data || []
      setProducts(productsData)

      // Calculate stats
      const total = productsData.length
      const inStock = productsData.filter(p => p.stock > 10).length
      const lowStock = productsData.filter(p => p.stock > 0 && p.stock <= 10).length
      const outOfStock = productsData.filter(p => p.stock === 0).length
      const totalViews = productsData.reduce((sum, p) => sum + (p.views_count || 0), 0)

      setStats({ total, inStock, lowStock, outOfStock, totalViews })
    } catch (error) {
      console.error("Failed to fetch seller products:", error)
      toast.error("Failed to load your products")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return
    }

    try {
      await api.delete(`/products/${productId}/`)
      toast.success("Product deleted successfully")
      fetchSellerProducts() // Refresh list
    } catch (error) {
      console.error("Failed to delete product:", error)
      toast.error("Failed to delete product")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-amber-500" />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Products</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your inventory and track performance</p>
          </div>
          <Link
            to="/seller/products/new"
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add New Product
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Products</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FontAwesomeIcon icon={faBox} className="text-amber-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">In Stock</p>
                <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
              </div>
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
              </div>
              <FontAwesomeIcon icon={faClock} className="text-yellow-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Views</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalViews}</p>
              </div>
              <FontAwesomeIcon icon={faChartLine} className="text-blue-500 text-2xl" />
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <FontAwesomeIcon icon={faBox} className="text-4xl mb-2 opacity-50" />
                      <p>No products found</p>
                      <Link to="/seller/products/new" className="text-amber-500 hover:text-amber-600 mt-2 inline-block">
                        Add your first product
                      </Link>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getProductPrimaryImage(product, `https://placehold.co/60x60`)}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.category_display || product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">K{parseFloat(product.price).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          product.stock > 10 ? "bg-green-100 text-green-700" :
                          product.stock > 0 ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {product.stock > 0 ? `${product.stock} left` : "Out of stock"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{product.views_count || 0}</td>
                      <td className="px-6 py-4">
                        {product.is_active !== false ? (
                          <span className="text-green-600 text-sm">? Active</span>
                        ) : (
                          <span className="text-red-600 text-sm">? Inactive</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link
                            to={`/products/${product.id}`}
                            target="_blank"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View Product"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </Link>
                          <Link
                            to={`/seller/products/edit/${product.id}`}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                            title="Edit Product"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Product"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SellerProductsPage
