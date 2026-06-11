import { useState } from "react"
import api from "../services/api"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSpinner } from "@fortawesome/free-solid-svg-icons"

const TestProductCreation = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const testCreateProduct = async () => {
    setLoading(true)
    try {
      const productData = {
        name: "Test Leather Shoes",
        description: "Brand new leather shoes, size 42, never worn",
        price: 350.00,
        category: "clothing",
        condition: "new",
        stock: 3
      }
      
      console.log("Sending product data:", productData)
      const response = await api.post('/products/create/', productData)
      console.log("Full response:", response)
      console.log("Response data:", response.data)
      
      setResult({
        success: true,
        sentData: productData,
        responseData: response.data,
        productObject: response.data.product,
        productId: response.data.product?.id
      })
    } catch (error) {
      console.error("Error:", error)
      console.error("Error response:", error.response?.data)
      setResult({
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-custom py-12">
      <h1 className="text-2xl font-bold mb-4">Test Product Creation</h1>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
        <p className="font-semibold">Test Data to be sent:</p>
        <pre className="text-sm mt-2">
{`{
  name: "Test Leather Shoes",
  description: "Brand new leather shoes, size 42, never worn",
  price: 350.00,
  category: "clothing",
  condition: "new",
  stock: 3
}`}
        </pre>
      </div>
      
      <button
        onClick={testCreateProduct}
        disabled={loading}
        className="bg-amber-500 text-white px-6 py-2 rounded-lg disabled:opacity-50"
      >
        {loading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : "Create Test Product"}
      </button>
      
      {result && (
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-auto">
          <h3 className="font-bold mb-2">Result:</h3>
          <pre className="text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default TestProductCreation
