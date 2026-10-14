import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import OrderTimeline from "../../components/order/OrderTimeline";
import PaymentConfirmationModal from "../../components/payment/PaymentConfirmationModal";
import { getProductPrimaryImage } from "../../utils/productImages";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSpinner, 
  faArrowLeft, 
  faMapMarkerAlt, 
  faCreditCard,
  faEnvelope,
  faMoneyBill,
  faBox,
  faStore,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { getPreviewBuyerOrderStatus, readPreviewOrders } from "../../services/previewOrders";
import PremiumBreadcrumb from "../../components/common/PremiumBreadcrumb";

const OrderDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [markingReady, setMarkingReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    const previewOrder = readPreviewOrders().find((item) => item.id === id);
    if (previewOrder) {
      setOrder({ ...previewOrder, isPreview: true });
      setLoading(false);
      return;
    }
    try {
      const response = await api.get(`/orders/${id}/`);
      console.log("Order details:", response.data);
      setOrder(response.data);
      
      if (response.data.payment) {
        setPayment(response.data.payment);
      } else {
        // Try to fetch payment separately
        try {
          const paymentResponse = await api.get(`/payments/order/${id}/`);
          setPayment(paymentResponse.data);
        } catch (err) {
          console.log("No payment found");
        }
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
      toast.error("Failed to load order details");
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  const markAsReady = async () => {
    if (!confirm("Is the item ready for pickup? This will notify the buyer.")) {
      return;
    }
    
    setMarkingReady(true);
    try {
      await api.post(`/orders/${order.id}/update-status/`, {
        status: "ready",
        notes: "Item is ready for pickup at the arranged location"
      });
      
      toast.success("Order marked as ready for pickup!");
      fetchOrderDetails();
    } catch (error) {
      console.error("Failed to mark as ready:", error);
      toast.error("Failed to update status");
    } finally {
      setMarkingReady(false);
    }
  };

  const handlePaymentConfirmed = () => {
    fetchOrderDetails();
    toast.success("Payment confirmed! Order status updated.");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-amber-500" />
      </div>
    );
  }

  if (!order) return null;

  if (order.isPreview) {
    const paymentLabels = {
      "meetup-cash": "Cash at meetup",
      "mtn-momo": "MTN Mobile Money",
      "airtel-money": "Airtel Money",
      "bank-transfer": "Bank transfer",
    };

    return (
      <div className="min-h-screen bg-[#fafaf9] pb-16">
        <div className="container-custom max-w-4xl pt-8 sm:pt-10">
          <PremiumBreadcrumb items={[{ label: "Home", to: "/" }, { label: "Order history", to: "/orders" }, { label: `Order ${order.id}` }]} />
          <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-amber-700">Preview order</p><h1 className="mt-1 font-mono text-xl font-bold text-slate-950">{order.id}</h1><p className="mt-2 text-xs text-slate-500">Placed {new Date(order.createdAt).toLocaleString("en-ZM", { dateStyle: "medium", timeStyle: "short" })}</p></div><span className="rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-800">{getPreviewBuyerOrderStatus(order)}</span></div>
            <h2 className="mt-5 text-sm font-bold text-slate-900">Items</h2>
            <ul className="mt-2 divide-y divide-slate-100">{order.items.map(({ product, quantity }, index) => <li key={`${product.id}-${index}`} className="flex items-center gap-3 py-4"><img src={getProductPrimaryImage(product)} alt="" className="h-16 w-16 shrink-0 rounded-xl bg-slate-100 object-cover" /><div className="min-w-0 flex-1"><Link to={`/products/${product.id}`} className="text-sm font-semibold text-slate-900 hover:text-amber-700">{product.name}</Link><p className="mt-1 text-xs text-slate-500">{product.seller_name} · Quantity {quantity}</p></div><span className="text-sm font-bold text-slate-900">K{(Number(product.price) * quantity).toLocaleString("en-ZM", { minimumFractionDigits: 2 })}</span></li>)}</ul>
            <div className="mt-2 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2"><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Meetup location</p><p className="mt-1 text-sm font-semibold text-slate-800">{order.meetupLocation}</p>{order.meetupNotes && <p className="mt-1 text-xs leading-5 text-slate-500">{order.meetupNotes}</p>}</div><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment preference</p><p className="mt-1 text-sm font-semibold text-slate-800">{paymentLabels[order.paymentPreference] || "Not selected"}</p></div></div>
            <div className="mt-5 flex justify-between border-t border-slate-100 pt-5"><span className="text-sm font-semibold text-slate-700">Order total</span><span className="text-lg font-bold text-slate-950">K{Number(order.total ?? order.subtotal).toLocaleString("en-ZM", { minimumFractionDigits: 2 })}</span></div>
          </div>
          <p className="mt-4 text-center text-[11px] text-slate-400">This preview is saved on this device. No seller was notified and no payment was processed.</p>
        </div>
      </div>
    );
  }

  const isBuyer = user?.id === order.buyer_id;
  const isSeller = user?.id === order.seller_id;
  const isAdmin = user?.role === "admin";
  
  // Payment confirmation conditions
  const canConfirmPayment = (isSeller && payment?.payment_method === "cash" && order.status !== "completed") ||
                           (isAdmin && payment?.status === "pending" && payment?.payment_method !== "cash");
  
  const canMarkReady = isSeller && order.status === "processing";
  const canConfirmOrder = isSeller && order.status === "pending";

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
      <div className="container-custom max-w-5xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-amber-500"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Orders
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Timeline - Shows payment status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <OrderTimeline order={order} payment={payment} />
            </div>

            {/* Product Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faBox} className="text-amber-500" />
                Product Details
              </h2>
              <div className="flex gap-4">
                <img 
                  src={order.product_image || "https://placehold.co/100x100"} 
                  alt={order.product_name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{order.product_name}</h3>
                  <p className="text-gray-500">Quantity: {order.quantity}</p>
                  <p className="text-amber-600 font-bold mt-1">K{parseFloat(order.total_price).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Meetup Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-amber-500" />
                Meetup Information
              </h2>
              <div className="space-y-2">
                <p><strong>Location:</strong> {order.meetup_location || "To be arranged"}</p>
                {order.meetup_time && (
                  <p><strong>Time:</strong> {new Date(order.meetup_time).toLocaleString()}</p>
                )}
                {order.meetup_notes && (
                  <p><strong>Notes:</strong> {order.meetup_notes}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-24">
              <h3 className="font-semibold text-lg mb-4">Order Actions</h3>
              
              <div className="space-y-3">
                {/* Confirm Order (Seller) */}
                {canConfirmOrder && (
                  <button
                    onClick={async () => {
                      await api.post(`/orders/${order.id}/update-status/`, { status: "processing" });
                      toast.success("Order confirmed! You can now arrange meetup.");
                      fetchOrderDetails();
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold"
                  >
                    Confirm Order
                  </button>
                )}

                {/* Mark as Ready (Seller) */}
                {canMarkReady && (
                  <button
                    onClick={markAsReady}
                    disabled={markingReady}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
                  >
                    {markingReady ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : "Mark as Ready for Pickup"}
                  </button>
                )}

                {/* Confirm Payment Button - This triggers payment confirmation */}
                {canConfirmPayment && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon={faMoneyBill} />
                    {payment?.payment_method === "cash" ? "Confirm Cash Payment" : "Verify Payment"}
                  </button>
                )}

                {/* Payment Status Display */}
                {payment && (
                  <div className={`p-3 rounded-lg text-sm ${
                    payment.status === "completed" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    <p className="font-semibold">Payment Status:</p>
                    <p>{payment.status === "completed" ? "? Payment Confirmed" : "? Awaiting Payment Confirmation"}</p>
                    {payment.status === "completed" && payment.paid_at && (
                      <p className="text-xs mt-1">Confirmed on: {new Date(payment.paid_at).toLocaleString()}</p>
                    )}
                    {payment.payment_method !== "cash" && payment.status === "pending" && (
                      <p className="text-xs mt-2">Waiting for admin verification</p>
                    )}
                    {payment.payment_method === "cash" && payment.status === "pending" && (
                      <p className="text-xs mt-2">Waiting for seller to confirm cash receipt</p>
                    )}
                  </div>
                )}

                {/* Contact Button */}
                <Link
                  to={`/messages?user=${isBuyer ? order.seller_id : order.buyer_id}`}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold text-center block"
                >
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                  Contact {isBuyer ? "Seller" : "Buyer"}
                </Link>
              </div>

              {/* Status Info */}
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-semibold mb-2">Current Status:</p>
                <p className="text-sm text-gray-600">
                  {order.status === "pending" && "? Waiting for seller confirmation"}
                  {order.status === "processing" && "?? Seller arranging meetup"}
                  {order.status === "ready" && "? Ready for pickup - Meet the seller"}
                  {order.status === "completed" && "?? Order completed successfully!"}
                  {order.status === "cancelled" && "? Order cancelled"}
                </p>
                {payment?.status === "completed" && order.status !== "completed" && (
                  <p className="text-xs text-green-600 mt-2">? Payment confirmed. Waiting for meetup.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      {payment && (
        <PaymentConfirmationModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          order={order}
          payment={payment}
          onConfirm={handlePaymentConfirmed}
        />
      )}
    </div>
  );
};

export default OrderDetailPage;
