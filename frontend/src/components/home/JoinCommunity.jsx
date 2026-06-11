import { Link } from "react-router-dom";
import { ArrowRight, Store, ShoppingBag } from "lucide-react";

export default function JoinCommunity() {
  return (
    <section className="py-16 bg-gradient-to-r from-yellow-400 to-orange-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Ready to join the community?</h2>
          <p className="text-gray-800 mt-2 max-w-2xl mx-auto">
            Start your journey today — whether you're buying or selling
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              to="/products"
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-semibold inline-flex items-center gap-2 transition"
            >
              <ShoppingBag size={18} />
              Start Shopping
            </Link>
            <Link
              to="/register?role=seller"
              className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-3 rounded-xl font-semibold inline-flex items-center gap-2 transition"
            >
              <Store size={18} />
              Become a Seller
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
