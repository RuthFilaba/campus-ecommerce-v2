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
  faClock,
  faTruck
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

const SellerOrderDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (id) {
      fetchOrder();
    }
  }, [id, isAuthenticated]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      console.log(`Fetching order ${id}...`);
      const response = await api.get(`/orders/${id}/`);
      console.log("Order data:", response.data);
      setOrder(response.data);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to load order details");
      navigate("/seller/sales");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await api.post(`/orders/${id}/status/`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrder();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update order status");
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

  const getStatusColor = () => {
    switch(order.status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="container-custom max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate("/seller/sales")}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-amber-500 transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Sales
        </button>

        {/* Order Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Order #{order.id}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Placed on {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor()}`}>
              {order.status_display || order.status.toUpperCase()}
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
                <p className="font-medium text-gray-800 dark:text-white">{order.product_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Quantity</p>
                <p className="font-medium text-gray-800 dark:text-white">{order.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Unit Price</p>
                <p className="font-medium text-gray-800 dark:text-white">K{parseFloat(order.unit_price).toFixed(2)}</p>
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
                <p className="font-medium text-gray-800 dark:text-white">{order.buyer_name || "Buyer"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-800 dark:text-white">{order.buyer_email || "No email"}</p>
              </div>
              <div className="pt-2">
                <Link 
                  to={`/messages?user=${order.buyer_id}`}
                  className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-600"
                >
                  <FontAwesomeIcon icon={faEnvelope} />
                  Contact Buyer
                </Link>
              </div>
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
                <p className="font-medium text-gray-800 dark:text-white">
                  {order.meetup_location || "Not specified"}
                </p>
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
                <p className="font-medium text-gray-800 dark:text-white">Cash on Meetup</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <p className="font-medium text-yellow-600">Pending - Pay at meetup</p>
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
                onClick={() => updateStatus("processing")}
                disabled={updating}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 transition-colors"
              >
                {updating ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : "Confirm Order"}
              </button>
            )}
            
            {order.status === "processing" && (
              <button
                onClick={() => updateStatus("ready")}
                disabled={updating}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 transition-colors"
              >
                {updating ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : "Mark as Ready for Pickup"}
              </button>
            )}
            
            {order.status === "ready" && (
              <button
                onClick={() => updateStatus("completed")}
                disabled={updating}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {updating ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <><FontAwesomeIcon icon={faMoneyBill} /> Confirm Payment & Complete</>}
              </button>
            )}
            
            {order.status === "pending" && (
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to cancel this order?")) {
                    updateStatus("cancelled");
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
      </div>
    </div>
  );
};

export default SellerOrderDetail;
