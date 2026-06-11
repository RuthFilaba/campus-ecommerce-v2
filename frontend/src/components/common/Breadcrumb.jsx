import { Link, useLocation } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronRight, faHome } from "@fortawesome/free-solid-svg-icons"

const Breadcrumb = () => {
  const location = useLocation()
  const pathnames = location.pathname.split("/").filter(x => x)

  // Map routes to display names
  const routeNames = {
    "dashboard": "Dashboard",
    "products": "Products",
    "cart": "Cart",
    "checkout": "Checkout",
    "orders": "Orders",
    "wishlist": "Wishlist",
    "profile": "Profile",
    "chat": "Messages",
    "seller": "Seller Hub",
    "admin": "Admin",
  }

  // Don't show breadcrumb on home page
  if (pathnames.length === 0) return null

  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500 mb-4">
      <Link to="/" className="hover:text-amber-500 transition-colors flex items-center gap-1">
        <FontAwesomeIcon icon={faHome} className="text-xs" />
        <span>Home</span>
      </Link>
      
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`
        const isLast = index === pathnames.length - 1
        const displayName = routeNames[name] || name.charAt(0).toUpperCase() + name.slice(1)
        
        return (
          <div key={name} className="flex items-center gap-1">
            <FontAwesomeIcon icon={faChevronRight} className="text-xs text-gray-400" />
            {isLast ? (
              <span className="text-gray-800 dark:text-gray-200 font-medium">{displayName}</span>
            ) : (
              <Link to={routeTo} className="hover:text-amber-500 transition-colors">
                {displayName}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}

export default Breadcrumb
