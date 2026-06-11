import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Star, ShoppingCart } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function PremiumTrending() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get("/products/");
      const data = response.data.results || response.data || [];
      setProducts(data.slice(0, 8));
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Trending</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-48 flex-shrink-0">
                <div className="bg-gray-100 rounded-xl aspect-[3/4] animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Trending</h2>
          <Link to="/products?sort=trending" className="text-sm text-yellow-600 font-medium">
            View all ?
          </Link>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="w-48 flex-shrink-0 group"
            >
              <div className="relative bg-gray-50 rounded-xl overflow-hidden">
                <div className="aspect-[3/4]">
                  {product.primary_image || product.image_1 || product.image_url ? (
                    <img
                      src={product.primary_image || product.image_1 || product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <ShoppingCart size={32} className="text-gray-300" />
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <h3 className="font-medium text-gray-800 text-sm line-clamp-1">{product.name}</h3>
                <p className="text-base font-bold text-yellow-600 mt-1">
                  K{typeof product.price === 'number' ? product.price.toFixed(0) : parseFloat(product.price).toFixed(0)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
