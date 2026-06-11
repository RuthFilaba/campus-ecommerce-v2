import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../../services/api"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faSave, faSpinner, faBox, faDollarSign } from "@fortawesome/free-solid-svg-icons"
import toast from "react-hot-toast"

const EditProductPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "other",
    condition: "good",
    stock: 1
  })

  const categories = [
    { value: "electronics", label: "Electronics & Gadgets" },
    { value: "clothing", label: "Clothing & Fashion" },
    { value: "books", label: "Books & Stationery" },
    { value: "furniture", label: "Furniture & Home" },
    { value: "food", label: "Food & Groceries" },
    { value: "beauty", label: "Beauty & Health" },
    { value: "sports", label: "Sports & Outdoors" },
    { value: "other", label: "Other Items" }
  ]

  const conditions = [
    { value: "new", label: "Brand New" },
    { value: "like_new", label: "Like New" },
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
    { value: "poor", label: "Poor" }
  ]

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}/`)
      const product = response.data
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        category: product.category || "other",
        condition: product.condition || "good",
        stock: product.stock || 1
      })
    } catch (error) {
      console.error("Failed to fetch product:", error)
      toast.error("Failed to load product")
      navigate("/seller/products")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price || !formData.description) {
      toast.error("Please fill in all required fields")
      return
    }

    const priceNum = parseFloat(formData.price)
    const stockNum = parseInt(formData.stock)

    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Price must be greater than 0")
      return
    }

    if (isNaN(stockNum) || stockNum < 0) {
      toast.error("Stock cannot be negative")
      return
    }

    setSaving(true)
    
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: priceNum,
        category: formData.category,
        condition: formData.condition,
        stock: stockNum
      }

      console.log("Updating product:", productData)
      await api.put(`/products/${id}/update/`, productData)
      toast.success("Product updated successfully!")
      navigate("/seller/products")
      
    } catch (error) {
      console.error("Failed to update product:", error)
      console.error("Error response:", error.response?.data)
      
      let errorMsg = "Failed to update product"
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error
      } else if (error.response?.data?.stock) {
        errorMsg = `Stock error: ${error.response.data.stock.join(', ')}`
      } else if (error.response?.data?.price) {
        errorMsg = `Price error: ${error.response.data.price.join(', ')}`
      }
      
      toast.error(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="container-custom max-w-3xl">
        <button 
          onClick={() => navigate("/seller/products")} 
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-amber-500 transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Products
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Edit Product</h1>
            <p className="text-amber-100 mt-1">Update your product information</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-800"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-800"
              />
            </div>

            {/* Price and Stock */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <FontAwesomeIcon icon={faDollarSign} className="mr-1 text-amber-500" />
                  Price (ZMW) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0.01"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <FontAwesomeIcon icon={faBox} className="mr-1 text-amber-500" />
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-800"
                />
                <p className="text-xs text-gray-500 mt-1">Set to 0 for out of stock</p>
              </div>
            </div>

            {/* Category and Condition */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-800"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Condition
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-800"
                >
                  {conditions.map(cond => (
                    <option key={cond.value} value={cond.value}>{cond.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/seller/products")}
                className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">?? Note:</h3>
          <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <li>• Updating stock to 0 will mark the product as "Out of Stock"</li>
            <li>• Price updates will affect future purchases only</li>
            <li>• Changes may require admin re-approval depending on your settings</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default EditProductPage
