import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Search, Menu, X, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-yellow-400 text-gray-900 text-center text-xs py-2">
        Free delivery on orders above K2000 | 30-day easy returns | Secure payments
      </div>
      
      {/* Main Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between py-3 gap-3">
            
            {/* Logo */}
            <Link to="/" className="shrink-0 flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">
                Campus<span className="text-yellow-500">Ecom</span>
              </h1>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md lg:max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </form>

            {/* Navigation Links - Desktop */}
            <div className="hidden lg:flex items-center gap-6">
              <Link to="/products" className="text-gray-600 hover:text-yellow-500 text-sm font-medium">Categories</Link>
              <Link to="/products?sort=deals" className="text-gray-600 hover:text-yellow-500 text-sm font-medium">Deals</Link>
              <Link to="/products?sort=trending" className="text-gray-600 hover:text-yellow-500 text-sm font-medium">Trending</Link>
              <Link to="/register?role=seller" className="text-gray-600 hover:text-yellow-500 text-sm font-medium">Sell</Link>
            </div>

            {/* Icons and Auth */}
            <div className="flex items-center gap-4">
              <Link to="/wishlist" className="text-gray-600 hover:text-yellow-500">
                <Heart size={20} />
              </Link>
              <Link to="/cart" className="text-gray-600 hover:text-yellow-500">
                <ShoppingCart size={20} />
              </Link>
              
              {isAuthenticated ? (
                <Link to="/profile" className="flex items-center gap-1 text-gray-700 hover:text-yellow-500 text-sm">
                  <User size={16} />
                  <span>{user?.first_name || user?.email?.split('@')[0]}</span>
                </Link>
              ) : (
                <Link to="/login" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-5 py-2 rounded-full text-sm font-semibold transition">
                  Login
                </Link>
              )}
              
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-1">
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t p-4 space-y-3 bg-white">
            <Link to="/products" className="block py-2 text-gray-600">Categories</Link>
            <Link to="/products?sort=deals" className="block py-2 text-gray-600">Deals</Link>
            <Link to="/products?sort=trending" className="block py-2 text-gray-600">Trending</Link>
            <Link to="/register?role=seller" className="block py-2 text-gray-600">Sell</Link>
            {!isAuthenticated && (
              <Link to="/login" className="block py-2 text-yellow-600 font-semibold">Login</Link>
            )}
          </div>
        )}
      </header>
    </>
  );
}
