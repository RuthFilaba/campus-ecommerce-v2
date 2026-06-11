import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBox, faTruck, faCheckCircle, faClock } from "@fortawesome/free-solid-svg-icons"
import api from "../../services/api"

const OrdersOverview = () => {
  const [recentOrders, setRecentOrders] = useState([])
  const [stats, setStats] = useState({ processing: 0, shipped: 0, outForDelivery: 0, delivered: 0 })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my-orders/')
      const orders = response.data.results || response.data || []
      setRecentOrders(orders.slice(0, 3))
      
      const processing = orders.filter(o => o.status === 'processing').length
      const shipped = orders.filter(o => o.status === 'ready').length
      const delivered = orders.filter(o => o.status === 'completed').length
      
      setStats({ processing, shipped, outForDelivery: shipped, delivered })
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return faCheckCircle
      case 'ready': return faTruck
      case 'processing': return faClock
      default: return faBox
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return "text-green-500"
      case 'ready': return "text-blue-500"
      case 'processing': return "text-yellow-500"
      default: return "text-gray-500"
    }
  }

  const getStatusText = (status) => {
    switch(status) {
      case 'completed': return "Delivered"
      case 'ready': return "Shipped"
      case 'processing': return "Processing"
      default: return status
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800 dark:text-white">Recent Orders</h3>
          <Link to="/orders" className="text-amber-500 text-sm hover:underline">View All</Link>
        </div>
        
        <div className="space-y-4">
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet</p>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">{order.product_name}</p>
                  <p className="text-xs text-gray-400">Order #{order.id}</p>
                  <p className="text-xs text-gray-400">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 text-sm ${getStatusColor(order.status)}`}>
                    <FontAwesomeIcon icon={getStatusIcon(order.status)} className="text-xs" />
                    {getStatusText(order.status)}
                  </span>
                  <Link to={`/orders/${order.id}`} className="block text-xs text-amber-500 mt-1">Track ?</Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Orders Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
            <p className="text-2xl font-bold text-yellow-600">{stats.processing}</p>
            <p className="text-xs text-gray-500">Processing</p>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <p className="text-2xl font-bold text-blue-600">{stats.shipped}</p>
            <p className="text-xs text-gray-500">Shipped</p>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <p className="text-2xl font-bold text-purple-600">{stats.outForDelivery}</p>
            <p className="text-xs text-gray-500">Out for Delivery</p>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
            <p className="text-xs text-gray-500">Delivered</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrdersOverview
