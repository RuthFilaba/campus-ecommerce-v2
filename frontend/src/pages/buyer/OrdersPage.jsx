import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import orderService from "../../services/orderService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faEye, faClock, faCheckCircle, faTruck, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

const OrdersPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?.role !== "seller") {
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getMyOrders();
      setOrders(data.results || data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      ready: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-amber-500" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
      <div className="container-custom max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
            <p className="text-gray-500">You haven't placed any orders yet</p>
            <Link to="/products" className="inline-block mt-4 text-amber-500 hover:text-amber-600">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Order #{order.id}</p>
                    <p className="font-semibold">{order.product_name}</p>
                    <p className="text-sm">Quantity: {order.quantity}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status_display}
                    </span>
                    <p className="text-lg font-bold text-amber-600 mt-2">K{order.total_price}</p>
                  </div>
                </div>

                {order.meetup_location && (
                  <div className="border-t pt-3 mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-amber-500" />
                    <span>Meet at: {order.meetup_location}</span>
                  </div>
                )}

                {order.meetup_time && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <FontAwesomeIcon icon={faClock} className="text-amber-500" />
                    <span>Meetup: {new Date(order.meetup_time).toLocaleString()}</span>
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <Link
                    to={`/orders/${order.id}`}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg text-center"
                  >
                    <FontAwesomeIcon icon={faEye} className="mr-2" />
                    Track Order
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
