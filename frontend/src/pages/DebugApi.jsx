import { useState, useEffect } from "react"
import api from "../services/api"

const DebugApi = () => {
  const [cartData, setCartData] = useState(null)
  const [productsData, setProductsData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get cart data
        const cartRes = await api.get('/cart/')
        console.log("RAW CART RESPONSE:", cartRes.data)
        setCartData(cartRes.data)
        
        // Get products
        const productsRes = await api.get('/products/')
        console.log("RAW PRODUCTS RESPONSE:", productsRes.data)
        setProductsData(productsRes.data)
      } catch (err) {
        console.error("Error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Debug</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Cart API Response:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
          {JSON.stringify(cartData, null, 2)}
        </pre>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-2">Products API Response (first product):</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
          {JSON.stringify(productsData?.results?.[0] || productsData?.[0] || productsData, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export default DebugApi
