import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../services/api"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faArrowLeft, 
  faUpload, 
  faSpinner,
  faImage,
  faTag,
  faDollarSign,
  faBox,
  faList,
  faInfoCircle,
  faTrash,
  faPlus
} from "@fortawesome/free-solid-svg-icons"
import toast from "react-hot-toast"
import { isPreviewAuth } from "../../services/auth"
import { createPreviewSellerProduct } from "../../services/previewSellerData"

const imageFileToDataUrl = async (file) => {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.76))
  if (!blob) throw new Error("This image could not be prepared for local storage")
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error("This image could not be read"))
    reader.readAsDataURL(blob)
  })
}

const CreateProductPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "other",
    condition: "good",
    stock: 1
  })
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])

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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    e.target.value = ""
    if (files.some((file) => !file.type.startsWith("image/"))) {
      toast.error("Choose image files only")
      return
    }
    if (files.some((file) => file.size > 5 * 1024 * 1024)) {
      toast.error("Each image must be 5MB or smaller")
      return
    }
    if (images.length + files.length > 3) {
      toast.error("Maximum 3 images allowed")
      return
    }

    const newPreviews = files.map(file => URL.createObjectURL(file))
    setImagePreviews(prev => [...prev, ...newPreviews])
    setImages(prev => [...prev, ...files])
  }

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index])
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price || !formData.description) {
      toast.error("Please fill in all required fields")
      return
    }

    if (parseFloat(formData.price) <= 0) {
      toast.error("Price must be greater than 0")
      return
    }

    if (parseInt(formData.stock) < 0) {
      toast.error("Stock cannot be negative")
      return
    }

    setLoading(true)
    let createdProductId = null
    
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition,
        stock: parseInt(formData.stock)
      }

      if (isPreviewAuth) {
        const storedImages = await Promise.all(images.map(imageFileToDataUrl))
        createPreviewSellerProduct(user?.email, { ...productData, images: storedImages })
        toast.success("Preview listing saved to your seller workspace")
        navigate("/seller/products")
        return
      }

      console.log("Creating product with data:", productData)
      const response = await api.post('/products/create/', productData)
      console.log("Full API Response:", response)
      console.log("Response data:", response.data)
      
      // Try to get product ID from various possible locations
      // Your backend might return ID directly or in a nested object
      if (response.data.id) {
        createdProductId = response.data.id
        console.log("Found ID directly:", createdProductId)
      } else if (response.data.product && response.data.product.id) {
        createdProductId = response.data.product.id
        console.log("Found ID in product object:", createdProductId)
      } else if (response.data.product_id) {
        createdProductId = response.data.product_id
        console.log("Found product_id:", createdProductId)
      } else {
        // If no ID found, check if we can get it from the product list
        console.warn("No ID found in response, checking product list...")
        const productsResponse = await api.get('/products/my-products/')
        const latestProduct = productsResponse.data.results?.[0] || productsResponse.data?.[0]
        if (latestProduct && latestProduct.name === formData.name) {
          createdProductId = latestProduct.id
          console.log("Found ID from product list:", createdProductId)
        }
      }
      
      if (!createdProductId) {
        toast.error("Product created but could not get ID. Images will not be uploaded.")
        setTimeout(() => navigate("/seller/products"), 1500)
        return
      }
      
      toast.success(`Product created! ID: ${createdProductId}`)
      
      // Upload images if any
      if (images.length > 0) {
        setUploadingImages(true)
        
        let uploadedCount = 0
        for (let i = 0; i < images.length; i++) {
          const formDataImg = new FormData()
          formDataImg.append('image', images[i])
          
          console.log(`Uploading image ${i + 1} to product ${createdProductId}`)
          
          try {
            const uploadResponse = await api.post(`/products/${createdProductId}/upload-image/`, formDataImg, {
              headers: { 'Content-Type': 'multipart/form-data' }
            })
            console.log(`Image ${i + 1} uploaded:`, uploadResponse.data)
            uploadedCount++
            toast.success(`Image ${i + 1} uploaded`)
          } catch (uploadError) {
            console.error(`Image ${i + 1} upload failed:`, uploadError)
            console.error("Error details:", uploadError.response?.data)
            toast.error(`Image ${i + 1} upload failed: ${uploadError.response?.data?.message || "Unknown error"}`)
          }
          
          // Small delay between uploads
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        if (uploadedCount > 0) {
          toast.success(`${uploadedCount} of ${images.length} images uploaded`)
        }
        
        setUploadingImages(false)
      }
      
      toast.success("Product submitted for admin approval!")
      
      setTimeout(() => {
        navigate("/seller/products")
      }, 2000)
      
    } catch (error) {
      console.error("Failed to create product:", error)
      console.error("Error response:", error.response?.data)
      
      let errorMsg = "Failed to create product"
      if (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED") {
        errorMsg = "Browser storage is full. Remove some saved listings or use smaller images, then try again."
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error
      } else if (error.message) {
        errorMsg = error.message
      }
      
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="container-custom max-w-3xl">
        <button
          onClick={() => navigate("/seller/products")}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-amber-500 transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Products
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Add New Product</h1>
            <p className="text-amber-100 mt-1">List your item for sale on CampusEcom</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FontAwesomeIcon icon={faTag} className="mr-2 text-amber-500" />
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., iPhone 13 Case - Black"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-amber-500" />
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe your product in detail"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700"
                required
              />
            </div>

            {/* Price and Stock */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-amber-500" />
                  Price (ZMW) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <FontAwesomeIcon icon={faBox} className="mr-2 text-amber-500" />
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="1"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700"
                  required
                />
              </div>
            </div>

            {/* Category and Condition */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <FontAwesomeIcon icon={faList} className="mr-2 text-amber-500" />
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700"
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700"
                >
                  {conditions.map(cond => (
                    <option key={cond.value} value={cond.value}>{cond.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FontAwesomeIcon icon={faImage} className="mr-2 text-amber-500" />
                Product Images (Max 3 images)
              </label>
              
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {imagePreviews.length < 3 && (
                <div>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-amber-500 transition-colors">
                    <div className="text-center">
                      <FontAwesomeIcon icon={faPlus} className="text-2xl text-gray-400 mb-1" />
                      <p className="text-sm text-gray-500">Click to upload images</p>
                      <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || uploadingImages}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {(loading || uploadingImages) ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    {uploadingImages ? `Uploading Images...` : "Creating Product..."}
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faUpload} />
                    Create Product
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/seller/products")}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors dark:border-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateProductPage
