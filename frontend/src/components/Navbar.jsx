import { Link } from "react-router-dom";
import { Search, Heart, ShoppingCart, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <Link to="/" className="text-2xl font-bold">
            Campus<span className="text-yellow-500">Ecom</span>
          </Link>

          <div className="hidden lg:flex items-center bg-gray-100 rounded-full px-4 py-2 w-96">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="bg-transparent ml-2 outline-none text-sm w-full"
            />
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-gray-600 hover:text-yellow-500">Products</Link>
            <Link to="/register?role=seller" className="text-gray-600 hover:text-yellow-500">Sell</Link>
          </div>

          <div className="flex items-center gap-4">
            <Heart size={20} className="text-gray-600 cursor-pointer hover:text-yellow-500" />
            <Link to="/cart" className="text-gray-600 hover:text-yellow-500">
              <ShoppingCart size={20} />
            </Link>
            {isAuthenticated ? (
              <Link to="/profile" className="text-gray-600 hover:text-yellow-500">
                <User size={20} />
              </Link>
            ) : (
              <Link to="/login" className="bg-yellow-400 px-4 py-2 rounded-full text-sm font-semibold text-gray-900 hover:bg-yellow-500">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
