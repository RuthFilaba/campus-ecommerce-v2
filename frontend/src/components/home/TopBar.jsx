import { Truck, RefreshCw, Shield, X } from "lucide-react";
import { useState } from "react";

export default function TopBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-yellow-400 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between">
          
          {/* Left side - Promo text */}
          <div className="flex-1 text-center sm:text-left">
            <span className="text-sm font-medium">
              Free delivery on orders above K2000
            </span>
          </div>
          
          {/* Right side - Features with icons */}
          <div className="hidden sm:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <RefreshCw size={14} className="text-gray-800" />
              <span className="text-xs font-medium">30-day easy returns</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-gray-800" />
              <span className="text-xs font-medium">Secure payments</span>
            </div>
          </div>
          
          {/* Close button */}
          <button
            onClick={() => setIsVisible(false)}
            className="ml-2 text-gray-800 hover:text-gray-600 transition"
            aria-label="Close announcement"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
