import { useState } from "react";

// These must match EXACTLY the category values in your database
const categories = [
  { id: 1, name: "All", slug: "all" },
  { id: 2, name: "Food & Drinks", slug: "food" },
  { id: 3, name: "Academic", slug: "academic" },
  { id: 4, name: "Fashion", slug: "fashion" },
  { id: 5, name: "Tech & Mobile", slug: "tech-mobile" },
  { id: 6, name: "Events & Tickets", slug: "events" },
  { id: 7, name: "Marketplace", slug: "marketplace" },
];

export default function CategoryPills({ activeCategory, onCategoryChange }) {
  const activeSlug = activeCategory || "all";

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.slug)}
          className={`
            px-4 py-2 text-sm font-medium rounded-full transition-all
            ${activeSlug === category.slug 
              ? "text-gray-900 font-semibold border-b-2 border-yellow-400" 
              : "text-gray-500 hover:text-gray-700"
            }
          `}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
