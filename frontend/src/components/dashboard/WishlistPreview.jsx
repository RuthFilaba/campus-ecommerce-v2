import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../../services/api"

const WishlistPreview = () => {
  const [wishlist, setWishlist] = useState([])

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/wishlist/')
      let items = response.data.results || response.data || []
      setWishlist(items.slice(0, 3))
    } catch (error) {
      console.error("Failed to fetch wishlist:", error)
    }
  }

  if (wishlist.length === 0) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800 dark:text-white">Wishlist</h3>
        <Link to="/wishlist" className="text-amber-500 text-sm hover:underline">View All</Link>
      </div>
      
      <div className="space-y-3">
        {wishlist.map((item) => (
          <div key={item.id} className="flex gap-3">
            <img src={item.image || "https://placehold.co/60x60"} alt="" className="w-12 h-12 rounded-lg object-cover" />
            <div className="flex-1">
              <p className="font-medium text-sm">{item.name}</p>
              <p className="text-amber-600 font-semibold text-sm">ZMW {item.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WishlistPreview
