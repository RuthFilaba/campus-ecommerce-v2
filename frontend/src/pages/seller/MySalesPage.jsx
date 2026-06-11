import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../services/api";

export default function MySalesPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my-sales/').then(res => {
      setOrders(res.data.results || res.data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Sales</h1>
      
      {orders.length === 0 ? (
        <p className="text-gray-500">No sales yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Order ID</th>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Buyer</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-mono">#{order.id}</td>
                  <td className="p-3">{order.product_name}</td>
                  <td className="p-3">{order.buyer_name || order.buyer_email}</td>
                  <td className="p-3 font-semibold text-amber-600">K{parseFloat(order.total_price).toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      order.status === "processing" ? "bg-blue-100 text-blue-800" :
                      order.status === "ready" ? "bg-green-100 text-green-800" :
                      order.status === "completed" ? "bg-gray-100 text-gray-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <Link 
                      to={`/seller/sale/${order.id}`}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Manage Order
                    </Link>
                  </td>
                </table>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
