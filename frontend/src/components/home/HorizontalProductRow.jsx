import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import api from "../../services/api";

export default function HorizontalProductRow({ category }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductsByCategory();
  }, [category]);

  const fetchProductsByCategory = async () => {
    setLoading(true);
    try {
      let url = "/products/";
      if (category && category !== "all") {
        url = `/products/?category=${category}`;
      }
      const response = await api.get(url);
      const productsData = response.data.results || response.data || [];
      setProducts(productsData.slice(0, 6));
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-6">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-48 flex-shrink-0">
              <div className="bg-gray-100 rounded-xl h-48 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className="w-48 flex-shrink-0 group"
          >
            <div className="relative bg-gray-50 rounded-xl overflow-hidden">
              <div className="aspect-square">
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
      <div className="text-center mt-4">
        <Link
          to={`/products?category=${category}`}
          className="text-sm text-yellow-600 font-medium hover:text-yellow-700"
        >
          View all in this category ?
        </Link>
      </div>
    </div>
  );
}
