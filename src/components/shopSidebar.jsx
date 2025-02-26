import React, { useState, useEffect } from "react";
import { X } from "lucide-react"; // Import Close Icon
import axios from "axios";
import { useSelector } from "react-redux";

const ShopSidebar = ({ categories, onFilterChange, closeSidebar }) => {
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [expandedCategory, setExpandedCategory] = useState(null);
  const authToken = useSelector((state) => state.auth.access_token);

  useEffect(() => {
    // Fetch subcategories if needed
  }, [categories, authToken]);

  const handleCategoryChange = (category) => {
    const updatedCategories = new Set(selectedCategories);
    updatedCategories.has(category)
      ? updatedCategories.delete(category)
      : updatedCategories.add(category);
    setSelectedCategories(updatedCategories);
    onFilterChange(Array.from(updatedCategories));
  };

  return (
    <div className="h-full w-64 bg-gray-900 text-white border-r border-gray-700">
      {/* Sidebar Header with Close Button */}
      <div className="flex justify-between items-center p-4 bg-gray-800">
        <h2 className="text-lg font-semibold text-yellow-400">Filters</h2>
        <button
          className="text-white p-2 bg-gray-700 rounded-md hover:bg-gray-600 transition"
          onClick={closeSidebar} // Close Sidebar on Click
          aria-label="Close Sidebar"
        >
          <X size={24} />
        </button>
      </div>

      {/* Categories List */}
      <div className="p-4">
        {Array.isArray(categories) &&
          categories.map((category) => (
            <div key={category.id} className="relative mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2 cursor-pointer accent-yellow-400"
                  onChange={() => handleCategoryChange(category.name)}
                  checked={selectedCategories.has(category.name)}
                />
                <h3
                  className="cursor-pointer font-medium hover:text-yellow-400 transition"
                  onClick={() =>
                    setExpandedCategory(expandedCategory === category.id ? null : category.id)
                  }
                >
                  {category.name}
                </h3>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ShopSidebar;
