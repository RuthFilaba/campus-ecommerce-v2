import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag, faSpinner, faCheck, faTimes, faTicket } from '@fortawesome/free-solid-svg-icons';
import couponService from '../../services/couponService';
import toast from 'react-hot-toast';

const CouponInput = ({ subtotal, onCouponApplied, onCouponRemoved }) => {
  const [code, setCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState(0);

  const handleApplyCoupon = async () => {
    if (!code.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setLoading(true);
    try {
      const result = await couponService.applyCoupon(code.toUpperCase(), subtotal);
      
      if (result.valid) {
        setAppliedCoupon(result.coupon);
        setDiscount(result.coupon.discount_amount);
        setCode('');
        toast.success(result.message);
        if (onCouponApplied) {
          onCouponApplied(result.coupon.discount_amount);
        }
      } else {
        toast.error(result.error || 'Invalid coupon code');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to apply coupon';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setLoading(true);
    try {
      await couponService.removeCoupon();
      setAppliedCoupon(null);
      setDiscount(0);
      toast.success('Coupon removed');
      if (onCouponRemoved) {
        onCouponRemoved();
      }
    } catch (error) {
      toast.error('Failed to remove coupon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <FontAwesomeIcon icon={faTicket} className="text-amber-500" />
        Apply Coupon
      </h3>

      {!appliedCoupon ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            maxLength={50}
          />
          <button
            onClick={handleApplyCoupon}
            disabled={loading || !code.trim()}
            className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <FontAwesomeIcon icon={faTag} />}
            Apply
          </button>
        </div>
      ) : (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCheck} className="text-green-500" />
                <span className="font-semibold text-green-700 dark:text-green-400">
                  {appliedCoupon.code}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {appliedCoupon.discount_display} applied
              </p>
              <p className="text-xs text-gray-500 mt-1">
                You saved K{discount.toFixed(2)}
              </p>
            </div>
            <button
              onClick={handleRemoveCoupon}
              disabled={loading}
              className="text-red-500 hover:text-red-600 transition-colors"
            >
              {loading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <FontAwesomeIcon icon={faTimes} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponInput;
