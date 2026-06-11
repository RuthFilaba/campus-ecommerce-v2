import { useState, useEffect } from "react";
import api from "../../services/api";

const SalesHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, revenue: 0 });

  useEffect(() => {
    api.get('/orders/my-sales/')
      .then(res => {
        const allOrders = res.data.results || res.data || [];
        const completed = allOrders.filter(o => o.status === "completed");
        const revenue = completed.reduce((sum, o) => sum + parseFloat(o.total_price), 0);
        setOrders(completed);
        setStats({ total: completed.length, revenue });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading history...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Sales History</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600">Completed Sales</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">K{stats.revenue.toFixed(2)}</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="text-gray-500">No completed sales yet</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr><th className="p-3 text-left">Order ID</th><th className="p-3 text-left">Product</th><th className="p-3 text-left">Buyer</th><th className="p-3 text-left">Total</th><th className="p-3 text-left">Date</th></tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-t">
                  <td className="p-3 font-mono">#{order.id}</td>
                  <td className="p-3">{order.product_name}</td>
                  <td className="p-3">{order.buyer_name || order.buyer_email}</td>
                  <td className="p-3 font-bold">K{parseFloat(order.total_price).toFixed(2)}</td>
                  <td className="p-3">{new Date(order.completed_at || order.updated_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SalesHistoryPage;
