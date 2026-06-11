import { Link, useLocation, useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faChartLine, 
  faBox, 
  faHeart, 
  faMapMarkerAlt, 
  faCreditCard, 
  faUser, 
  faEnvelope, 
  faGift, 
  faCog,
  faStore,
  faArrowLeft,
  faSignOutAlt
} from "@fortawesome/free-solid-svg-icons"
import { useAuth } from "../../contexts/AuthContext"

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuth()
  const isSeller = user?.role === "seller"

  const menuItems = [
    { name: "Dashboard", icon: faChartLine, path: "/dashboard" },
    { name: "Orders", icon: faBox, path: "/orders" },
    { name: "Wishlist", icon: faHeart, path: "/wishlist" },
    { name: "Addresses", icon: faMapMarkerAlt, path: "/profile" },
    { name: "Payments", icon: faCreditCard, path: "/profile#payments" },
    { name: "Profile", icon: faUser, path: "/profile" },
    { name: "Messages", icon: faEnvelope, path: "/chat" },
    { name: "Rewards", icon: faGift, path: "/rewards" },
    { name: "Settings", icon: faCog, path: "/settings" },
  ]

  if (isSeller) {
    menuItems.splice(6, 0, { name: "Seller Hub", icon: faStore, path: "/seller/dashboard" })
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg p-5 flex flex-col h-screen sticky top-0 overflow-y-auto">
      <Link to="/" className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Campus<span className="text-amber-500">Ecom</span>
        </h1>
      </Link>

      {/* Back Button - Norman's Visibility */}
      <button
        onClick={handleGoBack}
        className="flex items-center gap-2 px-4 py-2 mb-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors w-full"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
        <span className="text-sm">Go Back</span>
      </button>

      <nav className="space-y-1 flex-1">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              location.pathname === item.path || (item.path.includes("#") && location.pathname === item.path.split("#")[0])
                ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <FontAwesomeIcon icon={item.icon} className="w-5" />
            <span className="text-sm font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Need Help?</p>
          <p className="text-xs text-gray-500 mt-1">We're here to help you</p>
          <Link to="/chat" className="text-xs text-amber-500 mt-2 inline-block">Contact Support ?</Link>
        </div>
        
        {/* Logout Button - Easy reversal */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all w-full"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="w-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
