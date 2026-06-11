import api from './api';

const couponService = {
  // Apply coupon to cart
  applyCoupon: async (code, cartSubtotal) => {
    const response = await api.post('/coupons/apply/', { code, cart_subtotal: cartSubtotal });
    return response.data;
  },

  // Remove applied coupon
  removeCoupon: async () => {
    const response = await api.delete('/coupons/remove/');
    return response.data;
  },

  // Get all available coupons
  getAvailableCoupons: async () => {
    const response = await api.get('/coupons/');
    return response.data;
  }
};

export default couponService;
