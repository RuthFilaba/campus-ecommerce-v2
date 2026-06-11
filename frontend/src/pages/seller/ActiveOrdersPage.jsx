import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import api from "../../services/api";

const ActiveOrdersPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasSales, setHasSales] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetchOrders();
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      console.log("Fetching sales for seller:", user?.email, "Role:", user?.role);
      const response = await api.get('/orders/my-sales/');
      console.log("API Response:", response.data);
      
      let allOrders = [];
      if (response.data.results) allOrders = response.data.results;
      else if (Array.isArray(response.data)) allOrders = response.data;
      else if (response.data.data) allOrders = response.data.data;
      
      console.log(`Found ${allOrders.length} orders where you are the seller`);
      setHasSales(allOrders.length > 0);
      
      // Filter active orders (pending, processing, ready)
      const activeOrders = allOrders.filter(o => 
        o.status === "pending" || o.status === "processing" || o.status === "ready"
      );
      
      setOrders(activeOrders);
      setError(null);
    } catch (err) {
      console.error("Error fetching sales:", err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Please login to view orders</p>
        <Link to="/login" className="text-amber-500 mt-2 inline-block">Go to Login</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        <p className="mt-2 text-gray-500">Loading your sales...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p><strong>Error:</strong> {error}</p>
          <p className="text-sm mt-2">Make sure you are logged in as a seller</p>
        </div>
      </div>
    );
  }

  // If no sales at all
  if (!hasSales) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <div className="text-6xl mb-4">??</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">No Sales Yet</h1>
          <p className="text-gray-600 mb-4">
            You haven't received any orders as a seller yet.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Here's how to get your first sale:</p>
            <ul className="text-sm text-left max-w-md mx-auto space-y-2">
              <li>1. Add quality products with clear images</li>
              <li>2. Share your product links with friends</li>
              <li>3. Price your items competitively</li>
            </ul>
            <Link 
              to="/seller/products/create" 
              className="inline-block mt-4 bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600"
            >
              + Add Your First Product
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If has sales but no active orders (all completed)
  if (orders.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <div className="text-6xl mb-4">?</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">All Orders Completed!</h1>
          <p className="text-gray-600 mb-4">
            You have {orders.length} active orders. All your sales are completed.
          </p>
          <Link to="/seller/history" className="text-amber-500 hover:underline">
            View Sales History ?
          </Link>
        </div>
      </div>
    );
  }

  // Show active orders
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Active Orders</h1>
      <p className="text-gray-500 mb-6">
        You have {orders.length} order{orders.length !== 1 ? 's' : ''} awaiting action
      </p>
      
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-sm text-gray-500">Order #{order.id}</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                    order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                    order.status === "processing" ? "bg-blue-100 text-blue-800" :
                    "bg-green-100 text-green-800"
                  }`}>
                    {order.status}
                  </span>
                </div>
                <p className="font-semibold text-lg">{order.product_name}</p>
                <p className="text-sm text-gray-600">Buyer: {order.buyer_name || order.buyer_email}</p>
                <p className="text-sm text-gray-600">Quantity: {order.quantity}</p>
                <p className="text-amber-600 font-bold mt-1">K{parseFloat(order.total_price).toFixed(2)}</p>
                {order.meetup_location && (
                  <p className="text-sm text-gray-500 mt-1">?? Meet at: {order.meetup_location}</p>
                )}
              </div>
              <div className="min-w-[140px]">
                <div className="space-y-2">
                  {order.status === "pending" && (
                    <button 
                      onClick={async () => {
                        try {
                          await api.post(`/orders/${order.id}/status/`, { status: "processing" });
                          alert("Order confirmed!");
                          fetchOrders();
                        } catch (err) {
                          alert("Failed to confirm");
                        }
                      }} 
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
                    >
                      Confirm Order
                    </button>
                  )}
                  {order.status === "processing" && (
                    <button 
                      onClick={async () => {
                        try {
                          await api.post(`/orders/${order.id}/status/`, { status: "ready" });
                          alert("Order marked as ready for pickup!");
                          fetchOrders();
                        } catch (err) {
                          alert("Failed to mark ready");
                        }
                      }} 
                      className="w-full bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600"
                    >
                      Mark Ready for Pickup
                    </button>
                  )}
                  {order.status === "ready" && (
                    <button 
                      onClick={async () => {
                        try {
                          await api.post(`/orders/${order.id}/status/`, { status: "completed" });
                          alert("Order completed! Payment confirmed.");
                          fetchOrders();
                        } catch (err) {
                          alert("Failed to complete");
                        }
                      }} 
                      className="w-full bg-amber-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-600"
                    >
                      Complete Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <Link to="/seller/history" className="text-amber-500 hover:underline">
          View completed orders ?
        </Link>
      </div>
    </div>
  );
};

export default ActiveOrdersPage;
