import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
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
      let productsData = [];
      if (response.data.results) {
        productsData = response.data.results;
      } else if (Array.isArray(response.data)) {
        productsData = response.data;
      } else {
        productsData = response.data.results || response.data.data || [];
      }
      setProducts(productsData.slice(0, 6));
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Get primary image - matches backend get_images_list() priority
  const getPrimaryImage = (product) => {
    // Priority: image_1 > image_2 > image_3 > image_url
    if (product.image_1) return product.image_1;
    if (product.image_2) return product.image_2;
    if (product.image_3) return product.image_3;
    if (product.image_url) return product.image_url;
    return null;
  };

  // Get category display
  const getCategoryDisplay = (category) => {
    const categoryMap = {
      'food': 'Food & Drinks',
      'academic': 'Academic',
      'fashion': 'Fashion',
      'tech-mobile': 'Tech & Mobile',
      'events': 'Events & Tickets',
      'marketplace': 'Marketplace'
    };
    return categoryMap[category] || category || 'General';
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
        {products.map((product) => {
          const imageUrl = getPrimaryImage(product);
          const fallbackImage = `https://placehold.co/300x300/amber-500/white?text=${product.name?.charAt(0) || 'P'}`;
          const productImage = imageUrl || fallbackImage;
          
          const categoryDisplay = getCategoryDisplay(product.category);
          const price = parseFloat(product.price) || 0;
          
          return (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="w-48 flex-shrink-0 group"
            >
              <div className="relative bg-gray-50 rounded-xl overflow-hidden">
                <div className="aspect-square">
                  <img
                    src={productImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      e.target.src = `https://placehold.co/300x300/amber-500/white?text=${product.name?.charAt(0) || 'P'}`;
                    }}
                  />
                  {product.stock <= 5 && product.stock > 0 && (
                    <span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      Low Stock
                    </span>
                  )}
                  {product.stock === 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      Out of Stock
                    </span>
                  )}
                  {product.is_featured && (
                    <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      ⭐ Featured
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <h3 className="font-medium text-gray-800 text-sm line-clamp-1">{product.name}</h3>
                <p className="text-xs text-gray-400">{categoryDisplay}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < (product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">({product.review_count || 0})</span>
                </div>
                <p className="text-base font-bold text-yellow-600 mt-1">
                  K{price.toFixed(0)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="text-center mt-4">
        <Link
          to={`/products?category=${category}`}
          className="text-sm text-yellow-600 font-medium hover:text-yellow-700"
        >
          View all in this category →
        </Link>
      </div>
    </div>
  );
}