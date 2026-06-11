import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch, faSpinner, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons"
import ProductCard from "../components/product/ProductCard"
import Breadcrumb from "../components/common/Breadcrumb"
import api from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import toast from "react-hot-toast"

const ProductsPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState("")
  const { user, isAuthenticated } = useAuth()

  const fetchProducts = async () => {
    setLoading(true)
    setError("")
    
    try {
      const response = await api.get('/products/')
      let productsData = []
      if (response.data.results) {
        productsData = response.data.results
      } else if (Array.isArray(response.data)) {
        productsData = response.data
      } else {
        productsData = response.data.results || response.data.data || []
      }
      setProducts(productsData)
    } catch (err) {
      console.error("Failed to fetch products:", err)
      setError(err.response?.data?.detail || err.message || "Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Handle add to cart - Block sellers from buying
  const handleAddToCart = async (productId) => {
    if (user?.role === "seller") {
      toast.error("Seller accounts cannot purchase products. Please create a buyer account to shop.")
      return
    }
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      return
    }
    
    try {
      await api.post('/cart/add/', { product_id: productId, quantity: 1 })
      toast.success('Added to cart!')
    } catch (err) {
      toast.error('Failed to add to cart')
    }
  }

  // Handle add to wishlist - Block sellers
  const handleAddToWishlist = async (productId) => {
    if (user?.role === "seller") {
      toast.error("Seller accounts cannot use wishlist. Please create a buyer account.")
      return
    }
    
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist')
      return
    }
    
    try {
      await api.post('/wishlist/add/', { product_id: productId })
      toast.success('Added to wishlist!')
    } catch (err) {
      toast.error('Failed to add to wishlist')
    }
  }

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="container-custom">
        <Breadcrumb />
        
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            All Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover amazing deals from campus sellers
          </p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-800"
            />
            <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-600 text-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-20">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-amber-500" />
          </div>
        )}

        {!loading && (
          <>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No products found</p>
                <button onClick={fetchProducts} className="mt-4 text-amber-500 hover:text-amber-600">Refresh</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleAddToWishlist}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ProductsPage
