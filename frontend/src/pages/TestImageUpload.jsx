import { useState } from "react"
import api from "../services/api"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSpinner, faUpload } from "@fortawesome/free-solid-svg-icons"

const TestImageUpload = () => {
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [productId, setProductId] = useState("")
  const [result, setResult] = useState(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const createProduct = async () => {
    setLoading(true)
    try {
      const productData = {
        name: "Test Product for Image",
        description: "Testing image upload",
        price: 100,
        category: "other",
        condition: "good",
        stock: 5,
        image_url: ""
      }
      
      const response = await api.post('/products/create/', productData)
      console.log("Product created:", response.data)
      const newProductId = response.data.product?.id
      setProductId(newProductId)
      setResult({ productCreated: true, productId: newProductId })
      return newProductId
    } catch (error) {
      console.error("Failed to create product:", error)
      setResult({ error: error.response?.data })
      return null
    } finally {
      setLoading(false)
    }
  }

  const uploadImage = async () => {
    if (!selectedFile) {
      alert("Please select a file first")
      return
    }
    
    let pid = productId
    if (!pid) {
      pid = await createProduct()
      if (!pid) return
    }
    
    setLoading(true)
    const formData = new FormData()
    formData.append('image', selectedFile)
    
    try {
      console.log(`Uploading to /products/${pid}/upload-image/`)
      const response = await api.post(`/products/${pid}/upload-image/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      console.log("Upload response:", response.data)
      setResult({ uploadSuccess: true, data: response.data })
    } catch (error) {
      console.error("Upload failed:", error)
      console.error("Error response:", error.response?.data)
      setResult({ uploadError: error.response?.data, status: error.response?.status })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-custom py-12">
      <h1 className="text-2xl font-bold mb-4">Test Image Upload</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-2">Select Image:</label>
          <input type="file" accept="image/*" onChange={handleFileSelect} />
          {preview && (
            <img src={preview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
          )}
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={createProduct}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Step 1: Create Product
          </button>
          
          <button
            onClick={uploadImage}
            disabled={loading || !selectedFile}
            className="bg-amber-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Step 2: Upload Image
          </button>
        </div>
        
        {productId && (
          <div className="bg-green-100 p-3 rounded">
            Product ID: {productId}
          </div>
        )}
        
        {result && (
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
            <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default TestImageUpload
