import React, { useState } from "react";
import { X } from "lucide-react";

const ShopSidebar = ({ categories, onFilterChange, closeSidebar }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const handleCategoryChange = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      console.log("Deselecting category, showing all products");
      onFilterChange([], []);
    } else {
      setSelectedCategory(category);
      setSelectedSubcategory(null);
      console.log("Selected category:", category);
      onFilterChange([category], []);
    }
  };

  const handleSubcategoryChange = (subcategory) => {
    if (selectedSubcategory === subcategory) {
      setSelectedSubcategory(null);
      setSelectedCategory(null);
      console.log("Deselecting subcategory, showing all products");
      onFilterChange([], []);
    } else {
      setSelectedSubcategory(subcategory);
      setSelectedCategory(null);
      console.log("Selected subcategory:", subcategory);
      onFilterChange([], [subcategory]);
    }
  };

  return (
    <div className="h-full w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl border-r border-gray-700 transition-all duration-300">
      <div className="flex justify-between items-center p-5 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700">
        <h2 className="text-xl font-bold text-yellow-300 tracking-wide">Filters</h2>
        <button
          className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors duration-200"
          onClick={closeSidebar}
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-5 overflow-y-auto h-[calc(100%-5rem)]">
        {Array.isArray(categories) && categories.length > 0 ? (
          categories.map((category) => (
            <div
              key={category.id}
              className="mb-4 rounded-lg bg-gray-800/50 p-3 hover:bg-gray-700/70 transition-all duration-200"
            >
              <div className="flex items-center group">
                <input
                  type="checkbox"
                  className="mr-3 w-4 h-4 cursor-pointer accent-yellow-400 transition-transform duration-200 group-hover:scale-110"
                  onChange={() => handleCategoryChange(category.name)}
                  checked={selectedCategory === category.name}
                />
                <h3
                  className="flex-1 cursor-pointer text-base font-semibold text-gray-100 group-hover:text-yellow-300 transition-colors duration-200"
                  onClick={() =>
                    setExpandedCategory(expandedCategory === category.id ? null : category.id)
                  }
                >
                  {category.name}
                </h3>
                <span
                  className={`text-xs transform transition-transform duration-300 ${
                    expandedCategory === category.id ? "rotate-180" : "rotate-0"
                  }`}
                >
                  ▼
                </span>
              </div>

              {expandedCategory === category.id && (
                <div className="pl-6 mt-3 space-y-2 animate-fade-in">
                  {Array.isArray(category.subcategories) && category.subcategories.length > 0 ? (
                    category.subcategories.map((sub) => (
                      <div
                        key={sub.subcategory_id}
                        className="flex items-center group rounded-md p-1 hover:bg-gray-600/50 transition-colors duration-200"
                      >
                        <input
                          type="checkbox"
                          className="mr-2 w-4 h-4 cursor-pointer accent-yellow-400 transition-transform duration-200 group-hover:scale-110"
                          onChange={() => handleSubcategoryChange(sub.name)}
                          checked={selectedSubcategory === sub.name}
                        />
                        <span className="text-sm text-gray-200 group-hover:text-yellow-200 transition-colors duration-200">
                          {sub.name}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 italic pl-2">No subcategories available</p>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 text-center">No categories available</p>
        )}
      </div>
    </div>
  );
};

export default ShopSidebar;