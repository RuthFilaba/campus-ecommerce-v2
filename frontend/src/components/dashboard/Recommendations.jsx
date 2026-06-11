import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHeart } from "@fortawesome/free-solid-svg-icons"
import api from "../../services/api"

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([])

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      const response = await api.get('/products/')
      let products = response.data.results || response.data || []
      setRecommendations(products.slice(0, 5))
    } catch (error) {
      console.error("Failed to fetch recommendations:", error)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800 dark:text-white">Recommended for You</h3>
        <Link to="/products" className="text-amber-500 text-sm hover:underline">View All</Link>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {recommendations.map((product) => (
          <Link key={product.id} to={`/products/${product.id}`} className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm hover:shadow-md transition-all group">
            <div className="relative">
              <img 
                src={product.image_1 || product.image_url || `https://placehold.co/200x200/f59e0b/white?text=${product.name?.charAt(0)}`} 
                alt={product.name}
                className="w-full h-32 object-cover rounded-lg mb-2"
                onError={(e) => e.target.src = `https://placehold.co/200x200/f59e0b/white?text=${product.name?.charAt(0)}`}
              />
              <button className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                <FontAwesomeIcon icon={faHeart} className="text-gray-400 text-xs" />
              </button>
            </div>
            <p className="text-sm font-medium line-clamp-1">{product.name}</p>
            <p className="text-amber-600 font-bold text-sm mt-1">ZMW {product.price}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Recommendations
