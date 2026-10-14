import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFilter, faTimes, faSearch } from "@fortawesome/free-solid-svg-icons"

const ProductFilters = ({ filters, onFilterChange, onSearch, categories, onClearFilters }) => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = (e) => {
    e.preventDefault()
    onSearch(searchTerm)
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Price Range</h3>
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ""}
            onChange={(e) => onFilterChange("minPrice", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ""}
            onChange={(e) => onFilterChange("maxPrice", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Category</h3>
        <select
          value={filters.category || ""}
          onChange={(e) => onFilterChange("category", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Condition */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Condition</h3>
        <div className="space-y-2">
          {["New", "Like New", "Good", "Fair"].map((condition) => (
            <label key={condition} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.condition === condition}
                onChange={() => onFilterChange("condition", condition)}
                className="rounded text-amber-500"
              />
              <span className="text-gray-700 dark:text-gray-300">{condition}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sorting */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Sort By</h3>
        <select
          value={filters.sortBy || "newest"}
          onChange={(e) => onFilterChange("sortBy", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800"
        >
          <option value="newest">Newest First</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {/* Clear Filters */}
      <button
        onClick={onClearFilters}
        className="w-full py-2 text-amber-600 hover:text-amber-700 font-semibold"
      >
        Clear All Filters
      </button>
    </div>
  )

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="w-full py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={faFilter} />
          Filters
        </button>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-sm overflow-y-auto bg-white p-5 shadow-xl dark:bg-gray-900 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Filters</h2>
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <FontAwesomeIcon icon={faTimes} className="text-2xl" />
              </button>
            </div>
            <FilterContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <FilterContent />
      </div>
    </>
  )
}

export default ProductFilters
