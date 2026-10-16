import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTag, faCreditCard, faTruck, faShieldAlt, faSpinner } from "@fortawesome/free-solid-svg-icons"
import api from "../../services/api"
import toast from "react-hot-toast"

const CartSummary = ({ cart, onCheckout }) => {
  const [couponCode, setCouponCode] = useState("")
  const [applying, setApplying] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [discountAmount, setDiscountAmount] = useState(0)

  const subtotal = parseFloat(cart.subtotal) || 0
  const shipping = subtotal > 500 ? 0 : 50
  const tax = subtotal * 0.05
  const total = subtotal + shipping + tax - discountAmount

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      toast.error("Please enter a coupon code")
      return
    }

    setApplying(true)
    try {
      const response = await api.post('/coupons/apply/', { 
        code: couponCode,
        subtotal: subtotal 
      })
      
      if (response.data.valid) {
        setAppliedCoupon({
          code: couponCode,
          discount: response.data.discount,
          type: response.data.discount_type
        })
        setDiscountAmount(response.data.discount)
        toast.success(`Coupon applied! You saved K ${response.data.discount.toFixed(2)}`)
      } else {
        toast.error(response.data.message || "Invalid coupon code")
      }
    } catch (error) {
      console.error("Failed to apply coupon:", error)
      toast.error(error.response?.data?.message || "Failed to apply coupon")
    } finally {
      setApplying(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setDiscountAmount(0)
    setCouponCode("")
    toast.success("Coupon removed")
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-24">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>
      
      {/* Items Count */}
      <div className="flex justify-between py-2 text-gray-600 dark:text-gray-400">
        <span>Subtotal ({cart.total_items || cart.items?.length || 0} items)</span>
        <span>K {subtotal.toFixed(2)}</span>
      </div>
      
      {/* Shipping */}
      <div className="flex justify-between py-2 text-gray-600 dark:text-gray-400">
        <span>Shipping</span>
        <span>{shipping === 0 ? "FREE" : `K ${shipping.toFixed(2)}`}</span>
      </div>
      
      {/* Tax */}
      <div className="flex justify-between py-2 text-gray-600 dark:text-gray-400">
        <span>Tax (5%)</span>
        <span>K {tax.toFixed(2)}</span>
      </div>
      
      {/* Discount */}
      {discountAmount > 0 && (
        <div className="flex justify-between py-2 text-green-600">
          <span>Discount ({appliedCoupon?.code})</span>
          <span>- K {discountAmount.toFixed(2)}</span>
        </div>
      )}
      
      {/* Total */}
      <div className="flex justify-between py-3 mt-2 border-t border-gray-200 dark:border-gray-700 font-bold text-lg">
        <span>Total</span>
        <span className="text-amber-600 dark:text-amber-400">K {total.toFixed(2)}</span>
      </div>
      
      {/* Coupon Section */}
      {!appliedCoupon ? (
        <div className="mt-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={applying || !couponCode}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              {applying ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <FontAwesomeIcon icon={faTag} />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Have a promo code? Enter it above
          </p>
        </div>
      ) : (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                Coupon Applied!
              </p>
              <p className="text-xs text-green-500">{appliedCoupon.code}</p>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-xs text-red-500 hover:text-red-600"
            >
              Remove
            </button>
          </div>
        </div>
      )}
      
      {/* Shipping Info */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs text-gray-500 space-y-1">
        <p><FontAwesomeIcon icon={faTruck} className="mr-2 w-3" />Free shipping on orders over K 500</p>
        <p><FontAwesomeIcon icon={faShieldAlt} className="mr-2 w-3" />Secure checkout with campus verification</p>
      </div>
      
      {/* Checkout Button */}
      <button
        onClick={onCheckout}
        disabled={cart.total_items === 0 || !cart.items?.length}
        className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
        Proceed to Checkout
      </button>
      
      {/* Continue Shopping */}
      <button
        onClick={() => window.location.href = "/products"}
        className="w-full mt-3 text-amber-600 hover:text-amber-700 text-sm transition-colors"
      >
        ? Continue Shopping
      </button>
    </div>
  )
}

export default CartSummary
