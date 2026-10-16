import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSpinner, 
  faArrowLeft, 
  faBox,
  faUser,
  faMapMarkerAlt,
  faCreditCard,
  faEnvelope,
  faMoneyBill,
  faCheckCircle,
  faClock
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { getOrderStatusTone } from "../../utils/orderStatusTone";

const SellerOrderView = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  console.log("=== SELLER ORDER VIEW ===");
  console.log("Order ID from URL:", id);
  console.log("User:", user?.email, "Role:", user?.role);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (id) {
      loadOrder();
    }
  }, [id, isAuthenticated]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      console.log(`Loading order ${id}...`);
      const response = await api.get(`/orders/${id}/`);
      console.log("Order loaded:", response.data);
      setOrder(response.data);
    } catch (error) {
      console.error("Error loading order:", error);
      toast.error("Could not load order details");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await api.post(`/orders/${id}/update-status/`, { status: newStatus });
      toast.success(`Order ${newStatus}`);
      loadOrder();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-amber-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Order not found</p>
          <Link to="/seller/sales" className="text-amber-500 mt-4 inline-block">Back to Sales</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/seller/sales" className="inline-flex items-center gap-2 text-gray-600 hover:text-amber-500 mb-6">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Sales
        </Link>

        {/* Order Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Order #{order.id}</h1>
              <p className="text-gray-500 text-sm">{new Date(order.created_at).toLocaleString()}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getOrderStatusTone(order.status)}`}>
              {order.status.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faBox} className="text-amber-500" /> Product
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-sm">Product Name</p>
              <p className="font-medium">{order.product_name}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Quantity</p>
              <p className="font-medium">{order.quantity}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Price</p>
              <p className="text-xl font-bold text-amber-600">K{parseFloat(order.total_price).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Buyer Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faUser} className="text-amber-500" /> Buyer
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-sm">Name</p>
              <p className="font-medium">{order.buyer_name || "Buyer"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Email</p>
              <p className="font-medium">{order.buyer_email || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Meetup Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-amber-500" /> Meetup
          </h2>
          <div>
            <p className="text-gray-500 text-sm">Location</p>
            <p className="font-medium">{order.meetup_location || "Not specified"}</p>
          </div>
          {order.meetup_notes && (
            <div className="mt-3">
              <p className="text-gray-500 text-sm">Notes</p>
              <p className="text-gray-700">{order.meetup_notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            {order.status === "pending" && (
              <button
                onClick={() => updateStatus("processing")}
                disabled={updating}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {updating ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : "Confirm Order"}
              </button>
            )}
            {order.status === "processing" && (
              <button
                onClick={() => updateStatus("ready")}
                disabled={updating}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {updating ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : "Mark Ready"}
              </button>
            )}
            {order.status === "ready" && (
              <button
                onClick={() => updateStatus("completed")}
                disabled={updating}
                className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50"
              >
                {updating ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : "Confirm Payment"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerOrderView;
