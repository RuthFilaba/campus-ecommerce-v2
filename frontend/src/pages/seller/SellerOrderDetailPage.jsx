import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { getOrderStatusTone } from "../../utils/orderStatusTone";
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
  faClock,
  faWarning
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

const SellerOrderDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  console.log("=== SellerOrderDetailPage Debug ===");
  console.log("Order ID from URL:", id);
  console.log("User authenticated:", isAuthenticated);
  console.log("User role:", user?.role);
  console.log("User ID:", user?.id);

  useEffect(() => {
    if (!isAuthenticated) {
      console.log("Not authenticated, redirecting to login");
      navigate("/login");
      return;
    }
    if (id) {
      fetchOrderDetails();
    } else {
      console.error("No order ID provided");
      setError("No order ID provided");
      setLoading(false);
    }
  }, [id, isAuthenticated]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching order from: /orders/${id}/`);
      const response = await api.get(`/orders/${id}/`);
      console.log("Response status:", response.status);
      console.log("Order data received:", response.data);
      
      if (response.data) {
        setOrder(response.data);
      } else {
        throw new Error("No data received");
      }
    } catch (error) {
      console.error("Failed to fetch order - Full error:", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      
      let errorMessage = "Failed to load order details";
      if (error.response?.status === 404) {
        errorMessage = "Order not found. The order may not exist or you don't have permission to view it.";
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to view this order.";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    setUpdating(true);
    try {
      console.log(`Updating order ${id} to status: ${newStatus}`);
      const response = await api.post(`/orders/${id}/update-status/`, {
        status: newStatus,
        notes: `Order status updated by seller to ${newStatus}`
      });
      console.log("Update response:", response.data);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrderDetails(); // Refresh
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error(error.response?.data?.error || "Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-amber-500 mb-4" />
          <p className="text-gray-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <FontAwesomeIcon icon={faWarning} className="text-5xl text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Error Loading Order</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <div className="space-y-2">
            <button 
              onClick={() => navigate("/seller/sales")}
              className="inline-block bg-amber-500 text-white px-6 py-2 rounded-lg mr-2"
            >
              Back to Sales
            </button>
            <button 
              onClick={fetchOrderDetails}
              className="inline-block border border-gray-300 px-6 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No order data available</p>
          <button onClick={() => navigate("/seller/sales")} className="mt-4 text-amber-500">
            Back to Sales
          </button>
        </div>
      </div>
    );
  }

  console.log("Rendering order:", order.id, order.status);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
      <div className="container-custom max-w-4xl mx-auto px-4">
        {/* Back button */}
        <button
          onClick={() => navigate("/seller/sales")}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-amber-500 transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Sales
        </button>

        {/* Order Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Order #{order.id}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Placed on {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getOrderStatusTone(order.status)}`}>
              {order.status.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Product Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faBox} className="text-amber-500" />
              Product Details
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Product Name</p>
                <p className="font-medium">{order.product_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Quantity</p>
                <p className="font-medium">{order.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Price</p>
                <p className="text-xl font-bold text-amber-600">K{parseFloat(order.total_price).toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Buyer Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faUser} className="text-amber-500" />
              Buyer Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{order.buyer_name || "Buyer"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{order.buyer_email || "No email"}</p>
              </div>
              <Link 
                to={`/messages?user=${order.buyer_id}`} 
                className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-600 mt-2"
              >
                <FontAwesomeIcon icon={faEnvelope} />
                Contact Buyer
              </Link>
            </div>
          </div>

          {/* Meetup Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-amber-500" />
              Meetup Details
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{order.meetup_location || "Not specified"}</p>
              </div>
              {order.meetup_notes && (
                <div>
                  <p className="text-sm text-gray-500">Buyer's Notes</p>
                  <p className="text-gray-700 dark:text-gray-300">{order.meetup_notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faCreditCard} className="text-amber-500" />
              Payment Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium">{order.payment?.payment_method || "Cash on Meetup"}</p>
              </div>
              {order.payment?.transaction_reference && (
                <div>
                  <p className="text-sm text-gray-500">Transaction Reference</p>
                  <p className="font-mono text-sm">{order.payment.transaction_reference}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <span className={`inline-block px-2 py-1 rounded text-xs ${
                  order.payment?.status === "completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {order.payment?.status === "completed" ? "Paid" : "Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold mb-4">Order Actions</h2>
          <div className="flex flex-wrap gap-3">
            {order.status === "pending" && (
              <button
                onClick={() => updateOrderStatus("processing")}
                disabled={updating}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 transition-colors"
              >
                {updating ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : "Confirm Order"}
              </button>
            )}
            
            {order.status === "processing" && (
              <button
                onClick={() => updateOrderStatus("ready")}
                disabled={updating}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 transition-colors"
              >
                {updating ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : "Mark as Ready for Pickup"}
              </button>
            )}
            
            {order.status === "ready" && (
              <button
                onClick={() => updateOrderStatus("completed")}
                disabled={updating}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {updating ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <><FontAwesomeIcon icon={faMoneyBill} /> Confirm Cash Payment</>}
              </button>
            )}
            
            {order.status === "pending" && (
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to cancel this order?")) {
                    updateOrderStatus("cancelled");
                  }
                }}
                disabled={updating}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 transition-colors"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Debug Info (remove in production) */}
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
          <details>
            <summary className="cursor-pointer font-semibold">Debug Information</summary>
            <pre className="mt-2 overflow-auto">
              {JSON.stringify({ id, orderId: order.id, status: order.status }, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
};

export default SellerOrderDetailPage;
