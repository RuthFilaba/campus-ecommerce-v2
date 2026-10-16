import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { getOrderStatusTone } from "../../utils/orderStatusTone";

export default function ManageSalePage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}/`);
      setOrder(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await api.post(`/orders/${id}/status/`, { status: newStatus });
      toast.success(`Order ${newStatus}`);
      fetchOrder();
    } catch (err) {
      toast.error("Failed to update");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!order) return <div className="p-8 text-center">Order not found</div>;

  const canConfirm = order.status === "pending";
  const canMarkReady = order.status === "processing";
  const canComplete = order.status === "ready";

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link to="/seller/sales" className="text-blue-600 mb-4 inline-block">? Back to Sales</Link>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold">Order #{order.id}</h1>
        <p className="text-gray-500 mb-4">Placed: {new Date(order.created_at).toLocaleString()}</p>

        {/* Order Timeline */}
        <div className="border rounded-lg p-4 mb-6 bg-gray-50">
          <h2 className="font-bold mb-3">Order Timeline</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${order.created_at ? "bg-green-500" : "bg-gray-300"}`}></div>
              <span>Order Placed</span>
              {order.created_at && <span className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</span>}
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${order.status !== "pending" ? "bg-green-500" : "bg-gray-300"}`}></div>
              <span>Order Confirmed</span>
              {order.status !== "pending" && <span className="text-sm text-gray-500">Seller confirmed</span>}
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${order.status === "ready" || order.status === "completed" ? "bg-green-500" : "bg-gray-300"}`}></div>
              <span>Ready for Pickup</span>
              {(order.status === "ready" || order.status === "completed") && <span className="text-sm text-gray-500">Item ready</span>}
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${order.status === "completed" ? "bg-green-500" : "bg-gray-300"}`}></div>
              <span>Payment Confirmed</span>
              {order.status === "completed" && <span className="text-sm text-gray-500">Completed</span>}
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-500">Product</p>
            <p className="font-semibold">{order.product_name}</p>
          </div>
          <div>
            <p className="text-gray-500">Quantity</p>
            <p className="font-semibold">{order.quantity}</p>
          </div>
          <div>
            <p className="text-gray-500">Total Amount</p>
            <p className="text-xl font-bold text-amber-600">K{parseFloat(order.total_price).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-500">Buyer</p>
            <p className="font-semibold">{order.buyer_name || order.buyer_email}</p>
          </div>
          <div>
            <p className="text-gray-500">Meetup Location</p>
            <p>{order.meetup_location || "Not specified"}</p>
          </div>
          <div>
            <p className="text-gray-500">Current Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getOrderStatusTone(order.status)}`}>
              {order.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Action Buttons for Seller */}
        <div className="border-t pt-4">
          <h2 className="font-bold mb-3">Seller Actions</h2>
          <div className="flex flex-wrap gap-3">
            {canConfirm && (
              <button
                onClick={() => updateStatus("processing")}
                disabled={updating}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {updating ? "Updating..." : "? Confirm Order"}
              </button>
            )}

            {canMarkReady && (
              <button
                onClick={() => updateStatus("ready")}
                disabled={updating}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {updating ? "Updating..." : "?? Mark as Ready for Pickup"}
              </button>
            )}

            {canComplete && (
              <button
                onClick={() => updateStatus("completed")}
                disabled={updating}
                className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50"
              >
                {updating ? "Updating..." : "?? Confirm Payment & Complete"}
              </button>
            )}

            {order.status === "pending" && (
              <button
                onClick={() => {
                  if (window.confirm("Cancel this order?")) updateStatus("cancelled");
                }}
                disabled={updating}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                ? Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
