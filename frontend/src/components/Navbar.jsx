import { Link, useNavigate } from "react-router-dom";
import { Search, Heart, ShoppingCart, User, LogOut, Menu, X, Home, Store, MessageCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { useCart } from "../contexts/CartContext";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const cartCount = cart?.items?.length || 0;
  const isSeller = user?.role === "seller" || user?.role === "admin";
  const isAdmin = user?.role === "admin";

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo - CampusEcom with C icon */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-2xl font-bold">
              Campus<span className="text-yellow-500">Ecom</span>
            </span>
          </Link>

          {/* Search - Desktop */}
          <div className="hidden lg:flex items-center bg-gray-100 rounded-full px-4 py-2 flex-1 max-w-md mx-4">
            <Search size={18} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search products..."
              className="bg-transparent ml-2 outline-none text-sm w-full"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-gray-600 hover:text-yellow-500">Products</Link>
            {isAuthenticated && isSeller && (
              <Link to="/seller/dashboard" className="text-gray-600 hover:text-yellow-500">Dashboard</Link>
            )}
            {isAuthenticated && isAdmin && (
              <Link to="/admin/dashboard" className="text-gray-600 hover:text-yellow-500">Admin</Link>
            )}
            {!isSeller && (
              <Link to="/register?role=seller" className="text-gray-600 hover:text-yellow-500">Sell</Link>
            )}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <Link to="/wishlist" className="text-gray-600 hover:text-yellow-500 relative">
              <Heart size={20} />
            </Link>
            <Link to="/cart" className="text-gray-600 hover:text-yellow-500 relative">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/messages" className="text-gray-600 hover:text-yellow-500">
                  <MessageCircle size={20} />
                </Link>
                <Link to="/profile" className="text-gray-600 hover:text-yellow-500">
                  <User size={20} />
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-500"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-yellow-400 px-4 py-2 rounded-full text-sm font-semibold text-gray-900 hover:bg-yellow-500">
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-600 hover:text-yellow-500"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-3">
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-yellow-500" onClick={() => setIsMobileMenuOpen(false)}>
            <Home size={18} /> Home
          </Link>
          <Link to="/products" className="flex items-center gap-2 text-gray-600 hover:text-yellow-500" onClick={() => setIsMobileMenuOpen(false)}>
            <Search size={18} /> Products
          </Link>
          {isAuthenticated && (
            <Link to="/messages" className="flex items-center gap-2 text-gray-600 hover:text-yellow-500" onClick={() => setIsMobileMenuOpen(false)}>
              <MessageCircle size={18} /> Messages
            </Link>
          )}
          {isAuthenticated && isSeller && (
            <Link to="/seller/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-yellow-500" onClick={() => setIsMobileMenuOpen(false)}>
              <Store size={18} /> Dashboard
            </Link>
          )}
          {!isAuthenticated && (
            <>
              <Link to="/login" className="block text-gray-600 hover:text-yellow-500" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className="block text-gray-600 hover:text-yellow-500" onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
            </>
          )}
          {isAuthenticated && (
            <button onClick={handleLogout} className="block text-red-500 hover:text-red-600">Logout</button>
          )}
        </div>
      )}
    </nav>
  );
}