import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSpinner, 
  faEye, 
  faCheckCircle, 
  faClock, 
  faSearch,
  faArrowRight
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

const MySalesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    ready: 0,
    completed: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchSales();
  }, [isAuthenticated]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders/my-sales/');
      let salesData = response.data.results || response.data || [];
      setOrders(salesData);
      
      const statsData = {
        total: salesData.length,
        pending: salesData.filter(o => o.status === "pending").length,
        processing: salesData.filter(o => o.status === "processing").length,
        ready: salesData.filter(o => o.status === "ready").length,
        completed: salesData.filter(o => o.status === "completed").length,
        totalRevenue: salesData.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0)
      };
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch sales:", error);
      toast.error("Failed to load sales");
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = (orderId) => {
    navigate(`/seller/orders/${orderId}`);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: faClock, text: "Pending" },
      processing: { color: "bg-blue-100 text-blue-800", icon: faClock, text: "Processing" },
      ready: { color: "bg-green-100 text-green-800", icon: faCheckCircle, text: "Ready" },
      completed: { color: "bg-gray-100 text-gray-800", icon: faCheckCircle, text: "Completed" },
      cancelled: { color: "bg-red-100 text-red-800", icon: faClock, text: "Cancelled" }
    };
    return badges[status] || badges.pending;
  };

  const filteredOrders = orders.filter(order => {
    if (filter !== "all" && order.status !== filter) return false;
    if (searchTerm) {
      return order.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             order.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             order.id.toString().includes(searchTerm);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-amber-500" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="container-custom max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">My Sales</h1>
          <p className="text-gray-500">Track and manage your orders from buyers</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow cursor-pointer" onClick={() => setFilter("pending")}>
            <p className="text-sm text-yellow-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow cursor-pointer" onClick={() => setFilter("processing")}>
            <p className="text-sm text-blue-600">Processing</p>
            <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow cursor-pointer" onClick={() => setFilter("ready")}>
            <p className="text-sm text-green-600">Ready</p>
            <p className="text-2xl font-bold text-green-600">{stats.ready}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow cursor-pointer" onClick={() => setFilter("completed")}>
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold">{stats.completed}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg shadow">
            <p className="text-sm text-amber-600">Revenue</p>
            <p className="text-xl font-bold text-amber-600">K{stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product, buyer or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm">Order ID</th>
                    <th className="px-4 py-3 text-left text-sm">Product</th>
                    <th className="px-4 py-3 text-left text-sm">Buyer</th>
                    <th className="px-4 py-3 text-left text-sm">Total</th>
                    <th className="px-4 py-3 text-left text-sm">Status</th>
                    <th className="px-4 py-3 text-left text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredOrders.map((order) => {
                    const statusBadge = getStatusBadge(order.status);
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm">#{order.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <img src={order.product_image || "https://placehold.co/40x40"} className="w-8 h-8 object-cover rounded" alt="" />
                            <span>{order.product_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{order.buyer_name || "Buyer"}</td>
                        <td className="px-4 py-3 font-bold text-amber-600">K{parseFloat(order.total_price).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusBadge.color}`}>
                            <FontAwesomeIcon icon={statusBadge.icon} />
                            {statusBadge.text}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => viewOrderDetails(order.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FontAwesomeIcon icon={faEye} /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MySalesPage;
