import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBox, faRepeat, faHeart, faMapMarkerAlt, faCreditCard } from "@fortawesome/free-solid-svg-icons"

const QuickActions = () => {
  const actions = [
    { name: "Track Orders", icon: faBox, path: "/orders", color: "bg-blue-50 text-blue-600" },
    { name: "Reorder", icon: faRepeat, path: "/orders", color: "bg-green-50 text-green-600" },
    { name: "Wishlist", icon: faHeart, path: "/wishlist", color: "bg-red-50 text-red-600" },
    { name: "Save Addresses", icon: faMapMarkerAlt, path: "/profile", color: "bg-purple-50 text-purple-600" },
    { name: "Payment Methods", icon: faCreditCard, path: "/profile", color: "bg-amber-50 text-amber-600" },
  ]

  return (
    <div>
      <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {actions.map((action) => (
          <Link
            key={action.name}
            to={action.path}
            className={`${action.color} min-w-0 rounded-xl p-3 text-center transition-all hover:shadow-md sm:p-4`}
          >
            <FontAwesomeIcon icon={action.icon} className="text-xl mb-2" />
            <p className="text-xs font-medium">{action.name}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default QuickActions
