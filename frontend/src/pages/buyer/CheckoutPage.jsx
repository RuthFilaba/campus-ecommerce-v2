import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSpinner, 
  faCheckCircle, 
  faMoneyBill,
  faMobile,
  faUniversity,
  faArrowLeft,
  faMapMarkerAlt,
  faPhone,
  faShoppingCart,
  faInfoCircle,
  faImage
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

const CheckoutPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [step, setStep] = useState(1);
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [meetupData, setMeetupData] = useState({
    meetup_location: "Campus Library Main Entrance",
    meetup_notes: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to checkout");
      navigate("/login");
      return;
    }
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await api.get('/cart/');
      console.log("Cart data:", response.data);
      
      const cartData = response.data;
      const cartItems = cartData.items || [];
      
      const processedItems = cartItems.map(item => {
        const product = item.product_detail || item.product || {};
        return {
          cart_item_id: item.id,
          product_id: product.id,
          name: product.name,
          price: parseFloat(product.price) || 0,
          quantity: item.quantity,
          image: product.image_1 || product.image_url,
          stock: product.stock
        };
      });
      
      setItems(processedItems);
      setSubtotal(parseFloat(cartData.subtotal) || 0);
      setTotalItems(cartData.total_items || 0);
      setCart(cartData);
      
      if (processedItems.length === 0) {
        toast.error("Your cart is empty");
        navigate("/cart");
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      toast.error("Failed to load cart");
      navigate("/cart");
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    setCreatingOrder(true);
    try {
      // Create order for each cart item
      const orders = [];
      
      for (const item of items) {
        const orderData = {
          product_id: item.product_id,
          quantity: item.quantity,
          meetup_location: meetupData.meetup_location,
          meetup_notes: meetupData.meetup_notes
        };
        
        console.log("Creating order:", orderData);
        const response = await api.post('/orders/create/', orderData);
        orders.push(response.data);
      }
      
      if (orders.length > 0) {
        setOrder(orders[0]);
        // Clear cart after successful order creation
        await api.delete('/cart/clear/');
        toast.success("Order created successfully!");
        setStep(2);
      }
    } catch (error) {
      console.error("Failed to create order:", error);
      toast.error(error.response?.data?.error || "Failed to create order");
    } finally {
      setCreatingOrder(false);
    }
  };

  const processPayment = async () => {
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if ((paymentMethod === "mtn_momo" || paymentMethod === "airtel_money" || paymentMethod === "zamtel_kwacha") && !phoneNumber) {
      toast.error("Please enter your phone number");
      return;
    }

    setProcessing(true);
    try {
      const paymentData = {
        order_id: order.id,
        payment_method: paymentMethod,
        phone_number: phoneNumber
      };
      
      console.log("Processing payment:", paymentData);
      const response = await api.post('/payments/create/', paymentData);
      setPayment(response.data);
      toast.success("Payment initiated successfully!");
      setStep(3);
    } catch (error) {
      console.error("Failed to process payment:", error);
      toast.error(error.response?.data?.error || "Failed to process payment");
    } finally {
      setProcessing(false);
    }
  };

  const paymentMethods = [
    { 
      value: "cash", 
      label: "Cash on Meetup", 
      icon: faMoneyBill, 
      description: "Pay cash when you meet the seller on campus",
      details: "No transaction fees. Pay exact amount at meetup."
    },
    { 
      value: "mtn_momo", 
      label: "MTN Mobile Money", 
      icon: faMobile, 
      description: "Pay using MTN Mobile Money",
      details: "Dial *150# to send money. Instant confirmation.",
      ussd: "*150#"
    },
    { 
      value: "airtel_money", 
      label: "Airtel Money", 
      icon: faMobile, 
      description: "Pay using Airtel Money",
      details: "Dial *115# to send money. Instant confirmation.",
      ussd: "*115#"
    },
    { 
      value: "zamtel_kwacha", 
      label: "Zamtel Kwacha", 
      icon: faMobile, 
      description: "Pay using Zamtel Kwacha",
      details: "Dial *115# to send money. Instant confirmation.",
      ussd: "*115#"
    },
    { 
      value: "bank_transfer", 
      label: "Bank Transfer", 
      icon: faUniversity, 
      description: "Transfer to our bank account",
      details: "Zanaco Bank Zambia - Account: 1234567890"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-amber-500" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
      <div className="container-custom max-w-6xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center">
          <div className="flex items-center gap-8">
            <div className={`flex items-center gap-2 ${step >= 1 ? "text-amber-500" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-amber-500 text-white" : "bg-gray-200"}`}>
                1
              </div>
              <span>Review Order</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? "text-amber-500" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-amber-500 text-white" : "bg-gray-200"}`}>
                2
              </div>
              <span>Payment</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${step >= 3 ? "text-amber-500" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-amber-500 text-white" : "bg-gray-200"}`}>
                3
              </div>
              <span>Confirmation</span>
            </div>
          </div>
        </div>

        {/* Step 1: Review Order */}
        {step === 1 && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faShoppingCart} className="text-amber-500" />
                  Order Items ({totalItems})
                </h2>
                
                <div className="space-y-4">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 border-b pb-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "https://placehold.co/80x80/e5e7eb/9ca3af?text=No+Image";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <FontAwesomeIcon icon={faImage} className="text-gray-400 text-2xl" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 dark:text-white">{item.name}</h3>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        <p className="text-amber-600 font-bold mt-1">K{item.price.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Subtotal</p>
                        <p className="text-lg font-bold text-amber-600">
                          K{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold text-amber-600">K{subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Meetup Details */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-amber-500" />
                  Meetup Details
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Meetup Location *</label>
                    <select
                      value={meetupData.meetup_location}
                      onChange={(e) => setMeetupData({...meetupData, meetup_location: e.target.value})}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700"
                    >
                      <option>Campus Library Main Entrance</option>
                      <option>Student Union Building</option>
                      <option>Science Block Reception</option>
                      <option>Engineering Building</option>
                      <option>Business School Lobby</option>
                      <option>Hostel Reception</option>
                      <option>Cafe Restaurant</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Additional Notes</label>
                    <textarea
                      value={meetupData.meetup_notes}
                      onChange={(e) => setMeetupData({...meetupData, meetup_notes: e.target.value})}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700"
                      rows="3"
                      placeholder="Any special instructions for the seller..."
                    />
                  </div>
                </div>

                <button
                  onClick={createOrder}
                  disabled={creatingOrder}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg mt-6 disabled:opacity-50 transition-colors"
                >
                  {creatingOrder ? (
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  ) : (
                    "Proceed to Payment"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && order && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Select Payment Method</h2>
                <p className="text-gray-600 mb-4">Order Total: <span className="font-bold text-amber-600">K{parseFloat(order.total_price).toFixed(2)}</span></p>
                
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                        paymentMethod === method.value
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                          : "border-gray-200 hover:border-amber-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={method.icon} className="text-amber-500 text-xl" />
                          <span className="font-semibold text-lg">{method.label}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{method.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{method.details}</p>
                        {method.ussd && (
                          <div className="mt-2 inline-block bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">
                            USSD: {method.ussd}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                {(paymentMethod === "mtn_momo" || paymentMethod === "airtel_money" || paymentMethod === "zamtel_kwacha") && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <div className="relative">
                      <FontAwesomeIcon icon={faPhone} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="0977123456"
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Enter the mobile money registered number</p>
                  </div>
                )}

                <button
                  onClick={processPayment}
                  disabled={processing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg mt-6 disabled:opacity-50 transition-colors"
                >
                  {processing ? (
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  ) : (
                    "Confirm Payment"
                  )}
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-24">
                <h3 className="font-semibold text-lg mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Order ID:</span>
                    <span className="font-mono">#{order.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Product:</span>
                    <span className="truncate max-w-[150px]">{order.product_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span>{order.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Meetup:</span>
                    <span className="truncate max-w-[150px]">{meetupData.meetup_location}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span className="text-amber-600">K{parseFloat(order.total_price).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && payment && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faCheckCircle} className="text-5xl text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-green-600">Order Placed Successfully!</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Thank you for shopping with Campus E-commerce
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Transaction Reference: <span className="font-mono">{payment.transaction_reference}</span>
              </p>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faInfoCircle} className="text-amber-500" />
                Payment Instructions
              </h3>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                {paymentMethod === "cash" ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600">
                      <FontAwesomeIcon icon={faCheckCircle} />
                      <span className="font-semibold">Cash on Meetup Selected</span>
                    </div>
                    <p>The seller will contact you within 24 hours to arrange the meetup.</p>
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded">
                      <p className="font-semibold">?? Meetup Location:</p>
                      <p>{meetupData.meetup_location}</p>
                    </div>
                  </div>
                ) : paymentMethod === "mtn_momo" || paymentMethod === "airtel_money" || paymentMethod === "zamtel_kwacha" ? (
                  <div>
                    <p className="font-semibold mb-3">?? Mobile Money Instructions:</p>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Dial <span className="font-mono bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">{paymentMethods.find(m => m.value === paymentMethod)?.ussd}</span></li>
                      <li>Select "Send Money"</li>
                      <li>Enter amount: <strong>K{parseFloat(order?.total_price).toFixed(2)}</strong></li>
                      <li>Enter reference: <strong className="font-mono">{payment.transaction_reference}</strong></li>
                      <li>Enter your PIN to confirm</li>
                      <li>Keep the confirmation message as proof</li>
                    </ol>
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                      <p className="text-sm">?? Phone Number: <strong>{phoneNumber}</strong></p>
                      <p className="text-sm text-yellow-600 mt-1">?? Complete the payment within 24 hours to avoid order cancellation</p>
                    </div>
                  </div>
                ) : paymentMethod === "bank_transfer" ? (
                  <div>
                    <p className="font-semibold mb-3">?? Bank Transfer Instructions:</p>
                    <div className="space-y-2 text-sm">
                      <p>Bank: <strong>Zanaco Bank Zambia</strong></p>
                      <p>Account Name: <strong>Campus E-commerce Ltd</strong></p>
                      <p>Account Number: <strong>1234567890</strong></p>
                      <p>Branch: <strong>Cairo Road, Lusaka</strong></p>
                      <p>Reference: <strong className="font-mono">{payment.transaction_reference}</strong></p>
                    </div>
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                      <p className="text-sm text-yellow-600">?? Payment verification may take 24 hours. Upload your payment receipt in the order details page.</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Link
                to="/orders"
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-center py-3 rounded-lg font-semibold"
              >
                View My Orders
              </Link>
              <Link
                to="/products"
                className="flex-1 border border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-center py-3 rounded-lg font-semibold"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
