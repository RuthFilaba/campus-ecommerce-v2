import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import RevenueChart from "../../components/charts/RevenueChart";
import OrdersPieChart from "../../components/charts/OrdersPieChart";
import TopProductsChart from "../../components/charts/TopProductsChart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBox, 
  faShoppingCart, 
  faMoneyBill, 
  faUsers,
  faChartLine,
  faEye,
  faSpinner,
  faArrowRight,
  faClock,
  faStar,
  faTruck
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

const SellerDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStock: 0,
    avgRating: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [orderStatus, setOrderStatus] = useState({});
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch analytics data
      const analyticsRes = await api.get('/analytics/seller-dashboard/');
      const data = analyticsRes.data;
      
      console.log("Analytics data:", data);
      
      setStats({
        totalProducts: data.summary.total_products,
        totalSales: data.summary.total_sales,
        totalRevenue: data.summary.total_revenue,
        pendingOrders: data.order_status.counts.pending,
        lowStock: data.summary.total_products - (data.summary.total_products || 0),
        avgRating: data.summary.avg_rating
      });
      
      setOrderStatus(data.order_status.counts);
      setDailyRevenue(data.daily_revenue);
      setTopProducts(data.top_products);
      setRecentOrders(data.recent_orders || []);
      
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard");
      // Fallback to basic data
      fetchFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const fetchFallbackData = async () => {
    try {
      const productsRes = await api.get('/products/my-products/');
      const products = productsRes.data.results || productsRes.data || [];
      
      const salesRes = await api.get('/orders/my-sales/');
      const sales = salesRes.data.results || salesRes.data || [];
      
      const totalProducts = products.length;
      const totalSales = sales.length;
      const totalRevenue = sales.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0);
      const pendingOrders = sales.filter(o => o.status === "pending").length;
      
      setStats({
        totalProducts,
        totalSales,
        totalRevenue,
        pendingOrders,
        lowStock: products.filter(p => p.stock > 0 && p.stock <= 5).length,
        avgRating: 0
      });
      
      // Calculate order status from sales
      const statusCounts = {
        pending: sales.filter(o => o.status === "pending").length,
        processing: sales.filter(o => o.status === "processing").length,
        ready: sales.filter(o => o.status === "ready").length,
        completed: sales.filter(o => o.status === "completed").length,
        cancelled: sales.filter(o => o.status === "cancelled").length
      };
      setOrderStatus(statusCounts);
      
      setRecentOrders(sales.slice(0, 5));
      
      // Calculate top products
      const productSales = {};
      sales.forEach(order => {
        if (order.status === "completed") {
          productSales[order.product_name] = (productSales[order.product_name] || 0) + order.quantity;
        }
      });
      const topProductsList = Object.entries(productSales)
        .map(([name, total_sold]) => ({ name, total_sold, revenue: 0 }))
        .sort((a, b) => b.total_sold - a.total_sold)
        .slice(0, 5);
      setTopProducts(topProductsList);
      
    } catch (error) {
      console.error("Fallback failed:", error);
    }
  };

  const statsCards = [
    { title: "Total Products", value: stats.totalProducts, icon: faBox, color: "bg-blue-500", link: "/seller/products" },
    { title: "Total Sales", value: stats.totalSales, icon: faShoppingCart, color: "bg-green-500", link: "/seller/sales" },
    { title: "Total Revenue", value: `K${stats.totalRevenue.toFixed(2)}`, icon: faMoneyBill, color: "bg-amber-500", link: "/seller/sales" },
    { title: "Pending Orders", value: stats.pendingOrders, icon: faClock, color: "bg-blue-500", link: "/seller/sales?filter=pending" },
    { title: "Avg Rating", value: stats.avgRating || "N/A", icon: faStar, color: "bg-purple-500", link: "#" }
  ];

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
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            Welcome back, {user?.first_name || "Seller"}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's what's happening with your store today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {statsCards.map((stat, index) => (
            <Link
              key={index}
              to={stat.link}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <FontAwesomeIcon icon={stat.icon} className="text-white" />
                </div>
                <FontAwesomeIcon icon={faArrowRight} className="text-gray-400 text-sm" />
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.title}</p>
            </Link>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faChartLine} className="text-amber-500" />
              Revenue Trend (Last 30 Days)
            </h2>
            <div className="h-80">
              {dailyRevenue.length > 0 ? (
                <RevenueChart data={dailyRevenue} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No revenue data available yet
                </div>
              )}
            </div>
          </div>

          {/* Order Status Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faShoppingCart} className="text-amber-500" />
              Order Status Distribution
            </h2>
            <div className="h-80">
              {Object.values(orderStatus).some(v => v > 0) ? (
                <OrdersPieChart data={orderStatus} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No order data available yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Products Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faBox} className="text-amber-500" />
            Top Selling Products
          </h2>
          <div className="h-80">
            {topProducts.length > 0 ? (
              <TopProductsChart products={topProducts} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No product sales data available yet
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Recent Orders</h2>
              <Link to="/seller/sales" className="text-amber-500 text-sm hover:underline">
                View All
              </Link>
            </div>
            
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div>
                      <p className="font-medium">#{order.id} - {order.product_name}</p>
                      <p className="text-sm text-gray-500">by {order.buyer_name || order.buyer__email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-600">K{parseFloat(order.total_price).toFixed(2)}</p>
                      <p className={`text-xs ${order.status === "pending" || order.status === "processing" || order.status === "ready" ? "text-blue-700" : order.status === "completed" ? "text-green-700" : "text-red-700"}`}>
                        {order.status}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/seller/products/create"
                className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center hover:bg-amber-100 transition-colors"
              >
                <FontAwesomeIcon icon={faBox} className="text-amber-500 text-xl mb-2" />
                <p className="text-sm font-medium">Add Product</p>
              </Link>
              <Link
                to="/seller/products"
                className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center hover:bg-blue-100 transition-colors"
              >
                <FontAwesomeIcon icon={faEye} className="text-blue-500 text-xl mb-2" />
                <p className="text-sm font-medium">Manage Products</p>
              </Link>
              <Link
                to="/seller/sales"
                className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center hover:bg-green-100 transition-colors"
              >
                <FontAwesomeIcon icon={faShoppingCart} className="text-green-500 text-xl mb-2" />
                <p className="text-sm font-medium">View Sales</p>
              </Link>
              <Link
                to={`/profile/${user?.id}`}
                className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
              >
                <FontAwesomeIcon icon={faEye} className="text-purple-500 text-xl mb-2" />
                <p className="text-sm font-medium">View My Store</p>
              </Link>
            </div>
            
            {/* Tips Section */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-sm mb-2">?? Seller Tips</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>� Respond to orders quickly to build trust</li>
                <li>� Keep your stock levels updated</li>
                <li>� Add clear product images and descriptions</li>
                <li>� Communicate meetup details clearly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboardPage;
