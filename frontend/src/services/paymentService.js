import api from './api';

const paymentService = {
  // Create payment for order
  createPayment: async (paymentData) => {
    const response = await api.post('/payments/create/', paymentData);
    return response.data;
  },

  // Verify payment status
  verifyPayment: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}/verify/`);
    return response.data;
  },

  // Confirm payment (for cash payments)
  confirmPayment: async (paymentId) => {
    const response = await api.post(`/payments/${paymentId}/confirm/`);
    return response.data;
  }
};

export default paymentService;
