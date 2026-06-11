import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faShoppingBag, faTag } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

export default function ChatHeader({ chat, isOnline }) {
  const isOrderChat = chat.order_id;
  const isProductChat = chat.product_id && !chat.order_id;

  return (
    <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <span className="text-amber-500 font-semibold">
              {chat.other_user_name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
          )}
        </div>
        <div>
          <h3 className="font-semibold">{chat.other_user_name}</h3>
          <p className="text-xs text-gray-500">{isOnline ? "Online" : "Offline"}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isOrderChat && (
          <Link to={`/orders/${chat.order_id}`} className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full hover:bg-amber-100 transition-colors">
            <FontAwesomeIcon icon={faShoppingBag} className="text-amber-500 text-xs" />
            <span>Order #{chat.order_id}</span>
          </Link>
        )}
        {isProductChat && !chat.order_id && (
          <Link to={`/products/${chat.product_id}`} className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full hover:bg-amber-100 transition-colors">
            <FontAwesomeIcon icon={faTag} className="text-amber-500 text-xs" />
            <span>{chat.product_name}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
