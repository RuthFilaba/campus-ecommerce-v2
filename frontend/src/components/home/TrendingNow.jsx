import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import api from "../../services/api";

const fallbackProducts = [
  { id: 1, name: "Campus Hoodie", price: 250, rating: 4.8, sold: 120, image: "??", category: "Fashion" },
  { id: 2, name: "Wireless Earbuds", price: 180, rating: 4.6, sold: 98, image: "??", category: "Electronics" },
  { id: 3, name: "Laptop Backpack", price: 220, rating: 4.7, sold: 76, image: "??", category: "Accessories" },
  { id: 4, name: "Scientific Calculator", price: 120, rating: 4.9, sold: 150, image: "??", category: "Electronics" },
  { id: 5, name: "A4 Lecture Notes", price: 30, rating: 4.5, sold: 60, image: "??", category: "Stationery" },
  { id: 6, name: "Power Bank 10000mAh", price: 200, rating: 4.6, sold: 110, image: "??", category: "Electronics" },
];

export default function TrendingNow() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingProducts();
  }, []);

  const fetchTrendingProducts = async () => {
    try {
      const response = await api.get('/products/?ordering=-views_count');
      let data = response.data.results || response.data || [];
      setProducts(data.slice(0, 6));
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts(fallbackProducts);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-48"></div>
              ))}
            </div>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Trending Now</h2>
            <p className="text-gray-500 mt-1">Popular items on CampusEcom right now</p>
          </div>
          <Link to="/products" className="text-yellow-600 font-semibold hover:text-yellow-700 text-sm">
            View all ?
          </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition"
            >
              <div className="relative">
                <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-4xl">
                  {product.image_1 ? (
                    <img src={product.image_1} alt={product.name} className="h-28 w-full object-contain" />
                  ) : (
                    product.image || "??"
                  )}
                </div>
                <button className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition">
                  <Heart size={14} className="text-gray-500" />
                </button>
              </div>
              <h3 className="font-semibold text-gray-800 mt-3 text-sm line-clamp-1">{product.name}</h3>
              <div className="flex items-center gap-1 mt-1">
                <Star size={12} fill="#FACC15" color="#FACC15" />
                <span className="text-xs text-gray-600">{product.rating || 4.8}</span>
                <span className="text-xs text-gray-400">({product.sold || 0} sold)</span>
              </div>
              <p className="text-lg font-bold text-yellow-600 mt-2">K{typeof product.price === 'number' ? product.price : parseFloat(product.price).toFixed(0)}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
