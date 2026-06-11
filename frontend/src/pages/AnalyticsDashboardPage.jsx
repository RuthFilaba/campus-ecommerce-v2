import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSpinner, 
  faChartLine, 
  faBox, 
  faShoppingCart, 
  faMoneyBill,
  faUsers,
  faStar,
  faCalendar,
  faDownload,
  faEye
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

const AnalyticsDashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [reportPeriod, setReportPeriod] = useState(30);
  const [reportType, setReportType] = useState("daily");

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchDashboardData();
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/analytics/seller-dashboard/');
      console.log("Dashboard data:", response.data);
      setDashboardData(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesReport = async () => {
    try {
      const response = await api.get(`/analytics/sales-report/?days=${reportPeriod}&period=${reportType}`);
      console.log("Sales report:", response.data);
      toast.success("Report loaded");
    } catch (error) {
      console.error("Failed to fetch report:", error);
      toast.error("Failed to load report");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-amber-500" />
      </div>
    );
  }

  if (!dashboardData) return null;

  const { summary, order_status, top_products, recent_orders, daily_revenue } = dashboardData;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="container-custom max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your sales performance and business insights
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <FontAwesomeIcon icon={faBox} />
              <span className="text-sm">Products</span>
            </div>
            <p className="text-2xl font-bold">{summary.total_products}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <FontAwesomeIcon icon={faShoppingCart} />
              <span className="text-sm">Orders</span>
            </div>
            <p className="text-2xl font-bold">{summary.total_orders}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <FontAwesomeIcon icon={faMoneyBill} />
              <span className="text-sm">Revenue</span>
            </div>
            <p className="text-xl font-bold">K{summary.total_revenue.toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <FontAwesomeIcon icon={faUsers} />
              <span className="text-sm">Customers</span>
            </div>
            <p className="text-2xl font-bold">{summary.unique_customers}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 text-yellow-600 mb-2">
              <FontAwesomeIcon icon={faStar} />
              <span className="text-sm">Rating</span>
            </div>
            <p className="text-2xl font-bold">{summary.avg_rating}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <FontAwesomeIcon icon={faChartLine} />
              <span className="text-sm">Avg Order</span>
            </div>
            <p className="text-xl font-bold">K{summary.avg_order_value.toFixed(2)}</p>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">Order Status Breakdown</h2>
            <div className="space-y-3">
              {Object.entries(order_status.counts).map(([status, count]) => (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{status}</span>
                    <span>{count} ({order_status.percentages[status]}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        status === "completed" ? "bg-green-500" :
                        status === "pending" ? "bg-yellow-500" :
                        status === "processing" ? "bg-blue-500" :
                        status === "ready" ? "bg-purple-500" : "bg-red-500"
                      }`}
                      style={{ width: `${order_status.percentages[status]}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">Top Selling Products</h2>
            <div className="space-y-3">
              {top_products.map((product, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">Sold: {product.total_sold}</p>
                  </div>
                  <p className="font-bold text-amber-600">K{product.revenue.toFixed(2)}</p>
                </div>
              ))}
              {top_products.length === 0 && (
                <p className="text-gray-500 text-center py-4">No products sold yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Revenue Chart Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Revenue Trend (Last 30 Days)</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart visualization would appear here</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm">Order ID</th>
                  <th className="px-4 py-2 text-left text-sm">Buyer</th>
                  <th className="px-4 py-2 text-left text-sm">Total</th>
                  <th className="px-4 py-2 text-left text-sm">Status</th>
                  <th className="px-4 py-2 text-left text-sm">Date</th>
                </tr>
              </thead>
              <tbody>
                {recent_orders.map((order) => (
                  <tr key={order.id} className="border-t">
                    <td className="px-4 py-2 font-mono text-sm">#{order.id}</td>
                    <td className="px-4 py-2">{order.buyer__email}</td>
                    <td className="px-4 py-2 font-bold">K{order.total_price}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.status === "completed" ? "bg-green-100 text-green-700" :
                        order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Report Generator */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">Generate Sales Report</h2>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm mb-1">Period (Days)</label>
              <select 
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={365}>Last year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Report Type</label>
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchSalesReport}
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faDownload} />
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage;
