import { useState, useEffect } from "react";
import { Store } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function TopSellers() {
  const [sellers, setSellers] = useState([]);

  useEffect(() => {
    fetchTopSellers();
  }, []);

  const fetchTopSellers = async () => {
    try {
      // Fetch users with seller role
      const response = await api.get('/users/sellers/');
      const data = response.data.results || response.data || [];
      const topSellers = data.slice(0, 3);
      setSellers(topSellers);
    } catch (error) {
      console.error("Failed to fetch sellers:", error);
      // Fallback data
      setSellers([
        { name: "Tech Hub", email: "tech@hub.com", products_count: 45 },
        { name: "Campus Fashion", email: "fashion@campus.com", products_count: 32 },
        { name: "Book World", email: "books@world.com", products_count: 28 },
      ]);
    }
  };

  return (
    <section className="py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-12">
        <h2 className="text-3xl lg:text-4xl font-bold mb-8 lg:mb-12 text-center lg:text-left">Top Sellers</h2>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {sellers.map((seller, index) => (
            <div key={index} className="bg-white p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-sm hover:shadow-md transition">
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-yellow-100 flex items-center justify-center">
                <Store size={30} className="text-yellow-600" />
              </div>
              <h3 className="font-bold text-lg lg:text-xl mt-5">{seller.name || seller.email?.split('@')[0]}</h3>
              <p className="text-gray-500 text-sm mt-2">{seller.products_count || 0} Products</p>
              <Link to={`/profile/${seller.id}`} className="inline-block mt-5 bg-yellow-400 hover:bg-yellow-500 px-5 py-2 rounded-xl font-semibold text-sm transition">
                Visit Store
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
