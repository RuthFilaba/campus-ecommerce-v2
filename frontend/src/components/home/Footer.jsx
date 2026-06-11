import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      setError(true);
      return;
    }
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSubscribed(true);
      setEmail("");
      setError(false);
      setLoading(false);
      setTimeout(() => setSubscribed(false), 3000);
    }, 500);
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div>
            <h2 className="text-xl font-bold">
              Campus<span className="text-yellow-400">Ecom</span>
            </h2>
            <p className="mt-3 text-sm text-gray-400">
              Buy. Sell. Thrive.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              The trusted marketplace for the student community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white text-sm">Shop</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li><Link to="/products" className="hover:text-yellow-400 transition">All Products</Link></li>
              <li><Link to="/products?category=trending" className="hover:text-yellow-400 transition">Trending</Link></li>
              <li><Link to="/products?sort=deals" className="hover:text-yellow-400 transition">Deals</Link></li>
              <li><Link to="/register?role=seller" className="hover:text-yellow-400 transition">Sell on Campus</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white text-sm">Support</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li><Link to="/help" className="hover:text-yellow-400 transition">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-yellow-400 transition">Contact Us</Link></li>
              <li><Link to="/privacy" className="hover:text-yellow-400 transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-yellow-400 transition">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white text-sm">Connect</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Mail size={14} /> support@campusecom.com
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} /> +260 97 123 4567
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={14} /> Mulungushi University
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-white font-medium text-sm">Stay in the loop</h3>
            <p className="text-gray-500 text-xs mt-1">
              New drops, campus exclusives, event access. No spam. Once a week, maybe less.
            </p>

            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="mt-4 flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(false);
                  }}
                  placeholder="Your email"
                  className={`flex-1 px-4 py-2 text-sm rounded-lg bg-gray-800 text-white placeholder-gray-500 outline-none transition ${
                    error ? "ring-2 ring-red-500" : "focus:ring-1 focus:ring-yellow-400"
                  }`}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-sm font-medium rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 transition disabled:opacity-50"
                >
                  {loading ? "..." : "Subscribe"}
                </button>
              </form>
            ) : (
              <div className="mt-4 text-sm text-green-400 transition-all duration-300">
                You're in. Talk soon.
              </div>
            )}

            {error && (
              <p className="text-xs text-red-400 mt-2">That didn't work. Try again.</p>
            )}

            <p className="text-xs text-gray-600 mt-3">
              By subscribing you agree to our privacy policy.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} CampusEcom. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
