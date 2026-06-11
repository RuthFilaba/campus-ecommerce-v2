import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faCheckCircle, faTimes, faMoneyBill, faMobile, faUniversity } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import api from "../../services/api";

const PaymentConfirmationModal = ({ isOpen, onClose, order, payment, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (payment.payment_method === "cash") {
        // Seller confirms cash payment
        await api.post(`/orders/${order.id}/update-status/`, {
          status: "completed",
          notes: "Cash payment confirmed by seller during meetup"
        });
        toast.success("Cash payment confirmed! Order completed.");
      } else if (payment.payment_method.includes("momo") || payment.payment_method.includes("money")) {
        // Admin or system verifies mobile money
        if (!confirmationCode) {
          toast.error("Please enter the transaction confirmation code");
          setLoading(false);
          return;
        }
        await api.post(`/payments/${payment.id}/verify/`, {
          transaction_code: confirmationCode,
          status: "completed"
        });
        toast.success("Mobile money payment verified!");
      } else if (payment.payment_method === "bank_transfer") {
        // Admin verifies bank transfer
        if (!confirmationCode) {
          toast.error("Please enter the bank transaction reference");
          setLoading(false);
          return;
        }
        await api.post(`/payments/${payment.id}/verify/`, {
          transaction_reference: confirmationCode,
          status: "completed"
        });
        toast.success("Bank transfer payment verified!");
      }
      
      onConfirm();
      onClose();
    } catch (error) {
      console.error("Failed to confirm payment:", error);
      toast.error("Failed to confirm payment");
    } finally {
      setLoading(false);
    }
  };

  const getPaymentIcon = () => {
    if (payment.payment_method === "cash") return faMoneyBill;
    if (payment.payment_method.includes("momo") || payment.payment_method.includes("money")) return faMobile;
    return faUniversity;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Confirm Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FontAwesomeIcon icon={getPaymentIcon()} className="text-2xl text-amber-500" />
          </div>
          <p className="text-gray-600">Payment Method: <strong>{payment.payment_method_display}</strong></p>
          <p className="text-gray-600">Amount: <strong className="text-amber-600">K{payment.amount}</strong></p>
          <p className="text-gray-500 text-sm mt-2">Transaction Reference: <span className="font-mono">{payment.transaction_reference}</span></p>
        </div>

        {(payment.payment_method.includes("momo") || payment.payment_method.includes("money") || payment.payment_method === "bank_transfer") && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              {payment.payment_method.includes("momo") ? "Mobile Money Confirmation Code" : "Bank Transaction Reference"}
            </label>
            <input
              type="text"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              placeholder={payment.payment_method.includes("momo") ? "Enter confirmation code from SMS" : "Enter bank transaction reference"}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {payment.payment_method.includes("momo") 
                ? "Enter the confirmation code received via SMS after sending money"
                : "Enter the reference number from your bank transfer"}
            </p>
          </div>
        )}

        {payment.payment_method === "cash" && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">
              <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
              By confirming, you verify that you have received K{payment.amount} in cash from the buyer.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : "Confirm Payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationModal;
