import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import OrderTrackingTimeline from "../../components/order/OrderTrackingTimeline";
import { getOrderStatusTone } from "../../utils/orderStatusTone";

export default function SellerOrdersPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [trackingNotes, setTrackingNotes] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my-sales/');
      const data = res.data.results || res.data || [];
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus, notes = "") => {
    setUpdating(orderId);
    try {
      await api.post(`/orders/${orderId}/status/`, { status: newStatus, notes });
      setTrackingNotes((current) => ({ ...current, [orderId]: "" }));
      toast.success(`Order ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error("Failed to update");
    } finally {
      setUpdating(null);
    }
  };

  const pendingOrders = orders.filter(o => o.status === "pending");
  const processingOrders = orders.filter(o => o.status === "processing");
  const readyOrders = orders.filter(o => o.status === "ready");
  const completedOrders = orders.filter(o => o.status === "completed");

  const tabs = [
    { id: "pending", label: "Pending", count: pendingOrders.length, color: "bg-blue-100 text-blue-800" },
    { id: "processing", label: "Processing", count: processingOrders.length, color: "bg-blue-100 text-blue-800" },
    { id: "ready", label: "Ready", count: readyOrders.length, color: "bg-green-100 text-green-800" },
    { id: "completed", label: "Completed", count: completedOrders.length, color: "bg-gray-100 text-gray-800" }
  ];

  const getCurrentOrders = () => {
    switch(activeTab) {
      case "pending": return pendingOrders;
      case "processing": return processingOrders;
      case "ready": return readyOrders;
      case "completed": return completedOrders;
      default: return [];
    }
  };

  if (loading) return <div className="p-8 text-center">Loading orders...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Orders (Sales)</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-amber-500 text-amber-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${tab.color}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {getCurrentOrders().length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No {activeTab} orders</p>
          </div>
        ) : (
          getCurrentOrders().map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow border p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-sm text-gray-500">Order #{order.id}</p>
                  <p className="font-semibold text-lg mt-1">{order.product_name}</p>
                  <p className="text-gray-600">Buyer: {order.buyer_name || order.buyer_email}</p>
                  <p className="text-gray-600">Quantity: {order.quantity}</p>
                  <p className="text-gray-600">Meetup: {order.meetup_location || "Not specified"}</p>
                  <p className="text-xl font-bold text-amber-600 mt-2">K{parseFloat(order.total_price).toFixed(2)}</p>
                </div>
                
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getOrderStatusTone(order.status)}`}>
                    {order.status.toUpperCase()}
                  </span>
                  
                  <div className="mt-4 space-y-2">
                    {order.status === "pending" && (
                      <button
                        onClick={() => updateStatus(order.id, "processing", trackingNotes[order.id] || "")}
                        disabled={updating === order.id}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                      >
                        {updating === order.id ? "Updating..." : "Confirm and start preparation"}
                      </button>
                    )}
                    
                    {order.status === "processing" && (
                      <button
                        onClick={() => updateStatus(order.id, "ready", trackingNotes[order.id] || "")}
                        disabled={updating === order.id}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        {updating === order.id ? "Updating..." : "Mark ready for pickup"}
                      </button>
                    )}
                    
                    {order.status === "pending" && (
                      <button
                        onClick={() => {
                          if (window.confirm("Cancel this order?")) updateStatus(order.id, "cancelled");
                        }}
                        disabled={updating === order.id}
                        className="w-full bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
                      >
                        Cancel order
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {!['ready', 'completed', 'cancelled'].includes(order.status) && <label className="mt-4 block text-xs font-semibold text-slate-700">Message for buyer <span className="font-normal text-slate-500">(shared with your next status update)</span><textarea rows={2} value={trackingNotes[order.id] || ""} onChange={(event) => setTrackingNotes((current) => ({ ...current, [order.id]: event.target.value }))} placeholder="For example: I am preparing your item for pickup." className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" /></label>}
              <div className="mt-4"><OrderTrackingTimeline status={order.status} meetupLocation={order.meetup_location || ""} compact /></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
