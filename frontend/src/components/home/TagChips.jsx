import { useState } from "react";

const tags = ["All", "Popular", "New Arrivals", "Price Drop", "Near You"];

export default function TagChips({ onTagChange }) {
  const [activeTag, setActiveTag] = useState("All");

  const handleTagClick = (tag) => {
    setActiveTag(tag);
    onTagChange(tag);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => handleTagClick(tag)}
          className={`
            px-4 py-1.5 text-sm rounded-full border transition-all duration-200
            ${activeTag === tag 
              ? "border-yellow-400 text-yellow-600 bg-yellow-50" 
              : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }
          `}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
