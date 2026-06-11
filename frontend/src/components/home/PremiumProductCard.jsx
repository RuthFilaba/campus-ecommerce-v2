import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export default function PremiumProductCard({ product }) {
  // Truncate name if over 24 characters
  const displayName = product.name.length > 24 
    ? product.name.substring(0, 24) + "..." 
    : product.name;

  const isTopPick = product.rating >= 4.8 || product.is_featured;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block w-48 flex-shrink-0"
    >
      {/* Edge-to-edge image container - 3:4 aspect ratio */}
      <div className="relative bg-gray-50 rounded-xl overflow-hidden">
        <div className="aspect-[3/4]">
          {product.image_1 || product.image_url ? (
            <img
              src={product.image_1 || product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-300">No image</span>
            </div>
          )}
        </div>
        
        {/* Wishlist button */}
        <button 
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition duration-200"
          onClick={(e) => {
            e.preventDefault();
            // Add to wishlist logic
          }}
        >
          <Heart size={16} className="text-gray-600" />
        </button>
        
        {/* Top Pick badge */}
        {isTopPick && (
          <span className="absolute top-3 left-3 text-xs font-medium text-white bg-gray-900/80 backdrop-blur-sm px-2 py-1 rounded-full">
            Top Pick
          </span>
        )}
      </div>
      
      {/* Product info - clean typography */}
      <div className="mt-3">
        {/* Brand in smaller, lighter weight */}
        <p className="text-xs text-gray-400 uppercase tracking-wide">
          {product.brand || product.category || "Campus"}
        </p>
        {/* Product name - one line */}
        <h3 className="text-sm font-medium text-gray-800 mt-0.5">
          {displayName}
        </h3>
        {/* Price - semi-bold */}
        <p className="text-base font-semibold text-gray-900 mt-1">
          K{typeof product.price === 'number' ? product.price.toFixed(0) : parseFloat(product.price).toFixed(0)}
        </p>
      </div>
    </Link>
  );
}
