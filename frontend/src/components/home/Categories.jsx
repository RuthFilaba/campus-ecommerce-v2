import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Coffee,
  BookOpen,
  Shirt,
  Smartphone,
  Ticket,
  Store,
} from "lucide-react";
import api from "../../services/api";

// These must match EXACTLY your backend CATEGORY_CHOICES slugs
const campusCategories = [
  {
    name: "Food & Drinks",
    slug: "food",
    icon: Coffee,
    description: "Campus dining, cafes, nearby delivery, quick groceries",
    audience: "Everyone",
    color: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
    name: "Academic",
    slug: "academic",
    icon: BookOpen,
    description: "Textbooks, course materials, stationery, tech, printing",
    audience: "Students & Faculty",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    name: "Fashion",
    slug: "fashion",
    icon: Shirt,
    description: "Clothing, shoes, bags, accessories, jewelry, watches",
    audience: "Everyone",
    color: "bg-pink-50",
    iconColor: "text-pink-600",
  },
  {
    name: "Tech & Mobile",
    slug: "tech-mobile",
    icon: Smartphone,
    description:
      "Phone cases, chargers, cables, earbuds, power banks, laptop sleeves",
    audience: "Everyone",
    color: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    name: "Events & Tickets",
    slug: "events",
    icon: Ticket,
    description: "Sports, concerts, theatre, speaker series, alumni events",
    audience: "Everyone",
    color: "bg-red-50",
    iconColor: "text-red-600",
  },
  {
    name: "Marketplace",
    slug: "marketplace",
    icon: Store,
    description: "Peer resale across all categories, services, free items",
    audience: "Students & Staff",
    color: "bg-green-50",
    iconColor: "text-green-600",
  },
];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/products/categories/");
      const data = response.data.results || response.data || [];
      if (data.length > 0) {
        // Map backend categories to frontend display data
        const mappedCategories = campusCategories.filter((cat) =>
          data.some((backendCat) => backendCat.slug === cat.slug),
        );
        setCategories(mappedCategories);
      } else {
        setCategories(campusCategories);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories(campusCategories);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Browse by Category
          </h2>
          <p className="text-gray-500 mt-2">
            Everything you need for campus life
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.slug}
                to={`/products?category=${category.slug}`}
                className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 ${category.color} rounded-2xl flex items-center justify-center shrink-0`}
                  >
                    <Icon size={28} className={category.iconColor} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-yellow-600 transition">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {category.description}
                    </p>
                    <div className="mt-3">
                      <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                        {category.audience}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
