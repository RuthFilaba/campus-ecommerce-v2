import api from './api';

const orderService = {
  // Create new order
  createOrder: async (orderData) => {
    const response = await api.post('/orders/create/', orderData);
    return response.data;
  },

  // Get buyer's orders
  getMyOrders: async () => {
    const response = await api.get('/orders/my-orders/');
    return response.data;
  },

  // Get seller's sales
  getMySales: async () => {
    const response = await api.get('/orders/my-sales/');
    return response.data;
  },

  // Get single order details
  getOrderDetails: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/`);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId, status, notes = '') => {
    const response = await api.post(`/orders/${orderId}/update-status/`, { status, notes });
    return response.data;
  },

  // Arrange meetup for order
  arrangeMeetup: async (orderId, meetupData) => {
    const response = await api.post(`/orders/${orderId}/arrange-meetup/`, meetupData);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId, reason = '') => {
    const response = await api.post(`/orders/${orderId}/cancel/`, { reason });
    return response.data;
  },

  // Get order timeline
  getOrderTimeline: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/timeline/`);
    return response.data;
  },

  // Get tracking dashboard
  getTrackingDashboard: async () => {
    const response = await api.get('/orders/tracking/');
    return response.data;
  }
};

export default orderService;
