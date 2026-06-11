import { useState } from "react"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch, faBell, faShoppingCart, faUser } from "@fortawesome/free-solid-svg-icons"
import { useCart } from "../../contexts/CartContext"
import { useAuth } from "../../contexts/AuthContext"

const TopBar = () => {
  const { cart } = useCart()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${searchQuery}`
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-30">
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-amber-500 transition-all text-sm"
          />
        </div>
      </form>

      <div className="flex items-center gap-4">
        <Link to="/cart" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <FontAwesomeIcon icon={faShoppingCart} className="text-gray-600 dark:text-gray-300 text-xl" />
          {cart?.count > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cart.count}
            </span>
          )}
        </Link>
        
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <FontAwesomeIcon icon={faBell} className="text-gray-600 dark:text-gray-300 text-xl" />
        </button>
        
        <Link to="/profile" className="w-9 h-9 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
          <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
        </Link>
      </div>
    </div>
  )
}

export default TopBar
