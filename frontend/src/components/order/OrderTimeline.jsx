import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBox, 
  faMoneyBill, 
  faMapMarkerAlt, 
  faCheckCircle, 
  faTrophy,
  faClock,
  faUserCheck,
  faStore,
  faHandshake
} from "@fortawesome/free-solid-svg-icons";

const OrderTimeline = ({ order, payment, history = [] }) => {
  const steps = [
    {
      key: "order_placed",
      title: "Order Placed",
      icon: faBox,
      description: "Your order has been created and is awaiting seller confirmation.",
      isCompleted: !!order?.created_at,
      timestamp: order?.created_at,
      confirmedBy: "System",
      action: "Order created"
    },
    {
      key: "payment_confirmed",
      title: "Payment Confirmed",
      icon: faMoneyBill,
      description: "Payment has been verified and confirmed.",
      isCompleted: payment?.status === "completed",
      timestamp: payment?.paid_at,
      confirmedBy: payment?.status === "completed" ? (payment?.payment_method === "cash" ? "Seller" : "Admin") : null,
      action: payment?.payment_method === "cash" ? "Seller confirmed cash payment" : "Admin verified payment"
    },
    {
      key: "meetup_arranged",
      title: "Meetup Arranged",
      icon: faMapMarkerAlt,
      description: "Seller has arranged meetup location and time.",
      isCompleted: !!order?.meetup_time || order?.status === "processing" || order?.status === "ready" || order?.status === "completed",
      timestamp: order?.meetup_time || order?.updated_at,
      confirmedBy: "Seller",
      action: `Meetup arranged at ${order?.meetup_location || "campus location"}`
    },
    {
      key: "ready_for_pickup",
      title: "Ready for Pickup",
      icon: faHandshake,
      description: "Your item is ready for pickup at the arranged meetup location.",
      isCompleted: order?.status === "ready" || order?.status === "completed",
      timestamp: order?.updated_at,
      confirmedBy: "Seller",
      action: "Seller marked order as ready"
    },
    {
      key: "order_completed",
      title: "Order Completed",
      icon: faTrophy,
      description: "Transaction has been completed successfully!",
      isCompleted: order?.status === "completed",
      timestamp: order?.completed_at,
      confirmedBy: "Buyer & Seller",
      action: "Both parties confirmed completion"
    }
  ];

  const getCurrentStep = () => {
    if (order?.status === "completed") return 4;
    if (order?.status === "ready") return 3;
    if (order?.status === "processing") return 2;
    if (payment?.status === "completed") return 1;
    return 0;
  };

  const currentStep = getCurrentStep();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold mb-4">Order Timeline</h3>
      
      <div className="relative">
        {/* Progress Bar */}
        <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
        <div 
          className="absolute left-8 top-8 w-0.5 bg-green-500 transition-all duration-500"
          style={{ height: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>

        {/* Steps */}
        <div className="space-y-8 relative">
          {steps.map((step, index) => (
            <div key={step.key} className="flex gap-4">
              {/* Icon */}
              <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                step.isCompleted 
                  ? "bg-green-500 text-white shadow-lg" 
                  : index === currentStep 
                    ? "bg-amber-500 text-white animate-pulse"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-400"
              }`}>
                <FontAwesomeIcon icon={step.icon} className="text-xl" />
                {step.isCompleted && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xs" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pt-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className={`font-semibold ${
                    step.isCompleted ? "text-green-600" : index === currentStep ? "text-amber-500" : "text-gray-500"
                  }`}>
                    {step.title}
                  </h4>
                  {step.timestamp && (
                    <span className="text-xs text-gray-400">
                      {new Date(step.timestamp).toLocaleString()}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {step.description}
                </p>
                
                {step.isCompleted && step.confirmedBy && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                      <FontAwesomeIcon icon={faUserCheck} className="mr-1" />
                      Confirmed by: {step.confirmedBy}
                    </span>
                    {step.action && (
                      <span className="text-gray-500">
                        {step.action}
                      </span>
                    )}
                  </div>
                )}

                {!step.isCompleted && index === currentStep && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded animate-pulse">
                      <FontAwesomeIcon icon={faClock} className="mr-1" />
                      Waiting for confirmation
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold mb-2">How each step is confirmed:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faBox} className="text-blue-500" />
            <span>Order Placed - Automatically when you checkout</span>
          </div>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faMoneyBill} className="text-green-500" />
            <span>Payment Confirmed - {payment?.payment_method === "cash" ? "Seller confirms on meetup" : "Admin verifies payment"}</span>
          </div>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-amber-500" />
            <span>Meetup Arranged - Seller sets meetup location</span>
          </div>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faCheckCircle} className="text-purple-500" />
            <span>Ready for Pickup - Seller marks item as ready</span>
          </div>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faTrophy} className="text-yellow-500" />
            <span>Order Completed - Buyer confirms receipt</span>
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-700">
          <h4 className="text-sm font-semibold">Seller and buyer updates</h4>
          <ol className="mt-3 space-y-3">
            {[...history].sort((first, second) => new Date(second.created_at || second.at || 0) - new Date(first.created_at || first.at || 0)).map((entry, index) => (
              <li key={`${entry.created_at || entry.at || index}-${index}`} className="flex gap-3 text-xs">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                <div className="min-w-0"><p className="font-semibold text-gray-800 dark:text-gray-200">{entry.new_status || entry.status}</p>{entry.notes && <p className="mt-0.5 leading-5 text-gray-600 dark:text-gray-400">{entry.notes}</p>}<p className="mt-0.5 text-gray-400">{entry.created_at || entry.at ? new Date(entry.created_at || entry.at).toLocaleString() : "Just updated"}{entry.changed_by_name ? ` - ${entry.changed_by_name}` : ""}</p></div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default OrderTimeline;
