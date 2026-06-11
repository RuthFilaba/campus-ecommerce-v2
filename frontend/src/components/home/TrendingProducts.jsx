import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import api from "../../services/api";

const socket = io("http://localhost:5000", {
  autoConnect: true,
  reconnectionAttempts: 3,
});

export default function TrendingProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products/trending/");
      const data = response.data.results || response.data || [];
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch trending products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    // Socket.IO real-time event listeners
    socket.on("product-created", () => {
      console.log("New product added, refreshing...");
      fetchProducts();
    });
    socket.on("product-updated", () => {
      console.log("Product updated, refreshing...");
      fetchProducts();
    });
    socket.on("product-deleted", () => {
      console.log("Product deleted, refreshing...");
      fetchProducts();
    });

    return () => {
      socket.off("product-created");
      socket.off("product-updated");
      socket.off("product-deleted");
    };
  }, []);

  const addToCart = async (productId) => {
    try {
      await api.post("/cart/add/", {
        product_id: productId,
        quantity: 1,
      });
      toast.success("Added to cart");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Trending Products</h2>
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <h3 className="text-xl font-semibold text-gray-700">No Products Yet</h3>
            <p className="text-gray-500 mt-2">Products will appear here once sellers start listing items.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Trending Products</h2>
            <p className="text-gray-500 mt-1">Popular items right now</p>
          </div>
          <Link to="/products" className="text-yellow-600 font-semibold hover:text-yellow-700">
            View all ?
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-4 group">
              <Link to={`/products/${product.id}`}>
                <div className="relative">
                  <div className="h-32 bg-gray-100 rounded-lg overflow-hidden">
                    {product.image_1 ? (
                      <img
                        src={product.image_1}
                        alt={product.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <ShoppingCart size={40} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <button className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition">
                    <Heart size={14} className="text-gray-500" />
                  </button>
                </div>
                <h3 className="mt-3 font-semibold text-gray-800 line-clamp-1">{product.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <Star size={12} fill="#FACC15" color="#FACC15" />
                  <span className="text-xs text-gray-600">{product.rating || 4.5}</span>
                </div>
                <p className="text-lg font-bold text-yellow-600 mt-2">K{Number(product.price).toLocaleString()}</p>
              </Link>
              <button
                onClick={() => addToCart(product.id)}
                className="w-full mt-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-2 rounded-lg font-semibold text-sm transition"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
