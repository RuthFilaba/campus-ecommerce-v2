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
      <div className="grid grid-cols-5 gap-3">
        {actions.map((action) => (
          <Link
            key={action.name}
            to={action.path}
            className={`${action.color} rounded-xl p-4 text-center hover:shadow-md transition-all`}
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
