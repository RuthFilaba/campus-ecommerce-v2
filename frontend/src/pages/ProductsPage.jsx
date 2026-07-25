import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch, faSpinner, faExclamationTriangle, faFilter, faTimes } from "@fortawesome/free-solid-svg-icons"
import ProductCard from "../components/product/ProductCard"
import Breadcrumb from "../components/common/Breadcrumb"
import api from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import toast from "react-hot-toast"

const ProductsPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedCondition, setSelectedCondition] = useState("")
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [sortBy, setSortBy] = useState("-created_at")
  const [error, setError] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState(null)
  const { user, isAuthenticated } = useAuth()

  // Category mapping matching backend
  const categoryOptions = [
    { value: "", label: "All Categories" },
    { value: "food", label: "Food & Drinks" },
    { value: "academic", label: "Academic" },
    { value: "fashion", label: "Fashion" },
    { value: "tech-mobile", label: "Tech & Mobile" },
    { value: "events", label: "Events & Tickets" },
    { value: "marketplace", label: "Marketplace" }
  ]

  const conditionOptions = [
    { value: "", label: "All Conditions" },
    { value: "new", label: "Brand New" },
    { value: "like_new", label: "Like New" },
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
    { value: "poor", label: "Poor" }
  ]

  const sortOptions = [
    { value: "-created_at", label: "Newest First" },
    { value: "created_at", label: "Oldest First" },
    { value: "-price", label: "Price: High to Low" },
    { value: "price", label: "Price: Low to High" },
    { value: "-views_count", label: "Most Viewed" },
    { value: "name", label: "Name: A to Z" }
  ]

  const fetchProducts = async () => {
    setLoading(true)
    setError("")
    
    try {
      let url = '/products/'
      const params = new URLSearchParams()
      
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedCondition) params.append('condition', selectedCondition)
      if (searchQuery) params.append('search', searchQuery)
      if (sortBy) params.append('sort', sortBy)
      if (priceRange.min) params.append('min_price', priceRange.min)
      if (priceRange.max) params.append('max_price', priceRange.max)
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const response = await api.get(url)
      
      let productsData = []
      let filtersData = null
      
      if (response.data.results) {
        productsData = response.data.results
        filtersData = response.data.filters
      } else if (Array.isArray(response.data)) {
        productsData = response.data
      } else {
        productsData = response.data.results || response.data.data || []
        filtersData = response.data.filters
      }
      
      setProducts(productsData)
      setFilters(filtersData)
    } catch (err) {
      console.error("Failed to fetch products:", err)
      setError(err.response?.data?.detail || err.message || "Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, selectedCondition, sortBy, priceRange])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchProducts()
  }

  const clearFilters = () => {
    setSelectedCategory("")
    setSelectedCondition("")
    setPriceRange({ min: "", max: "" })
    setSortBy("-created_at")
    setSearchQuery("")
    setShowFilters(false)
  }

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
      toast.error(err.response?.data?.message || 'Failed to add to cart')
    }
  }

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
      toast.error(err.response?.data?.message || 'Failed to add to wishlist')
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="container-custom max-w-7xl mx-auto px-4">
        <Breadcrumb />
        
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            All Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover amazing deals from campus sellers
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <FontAwesomeIcon icon={faFilter} />
              Filters
            </button>
            
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-gray-700">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700"
                >
                  {categoryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Condition</label>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700"
                >
                  {conditionOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Min Price (ZMW)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Max Price (ZMW)</label>
                <input
                  type="number"
                  placeholder="No max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700"
                  min="0"
                />
              </div>
            </div>
            
            <div className="mt-4 flex gap-3">
              <button
                onClick={fetchProducts}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Sort */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
          <span className="text-sm text-gray-500">
            {products.length} {products.length === 1 ? 'product' : 'products'} found
          </span>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-800 text-sm"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
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
            {products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No products found</p>
                <button onClick={fetchProducts} className="mt-4 text-amber-500 hover:text-amber-600">Refresh</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
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