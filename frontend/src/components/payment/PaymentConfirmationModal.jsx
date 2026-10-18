import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faCheckCircle, faTimes, faMoneyBill } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import api from "../../services/api";

const PaymentConfirmationModal = ({ isOpen, onClose, order, payment, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await api.post(`/payments/${payment.id}/confirm/`);
      toast.success("Cash payment confirmed.");
      
      onConfirm();
      onClose();
    } catch (error) {
      console.error("Failed to confirm payment:", error);
      toast.error("Failed to confirm payment");
    } finally {
      setLoading(false);
    }
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
            <FontAwesomeIcon icon={faMoneyBill} className="text-2xl text-amber-500" />
          </div>
          <p className="text-gray-600">Payment Method: <strong>{payment.payment_method_display}</strong></p>
          <p className="text-gray-600">Amount: <strong className="text-amber-600">K{payment.amount}</strong></p>
          <p className="text-gray-500 text-sm mt-2">Transaction Reference: <span className="font-mono">{payment.transaction_reference}</span></p>
        </div>

        {payment.payment_method === "cash" && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">
              <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
              Confirm only after you have paid K{payment.amount} to the seller.
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
