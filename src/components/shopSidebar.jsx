import React, { useState } from "react";
import { Menu, X } from "lucide-react";

const ShopSidebar = ({ categories, onFilterChange }) => {
    const [selectedCategories, setSelectedCategories] = useState(new Set());
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleCategoryChange = (category) => {
        const updatedCategories = new Set(selectedCategories);
        if (updatedCategories.has(category)) {
            updatedCategories.delete(category);
        } else {
            updatedCategories.add(category);
        }
        setSelectedCategories(updatedCategories);
        onFilterChange(Array.from(updatedCategories));
    };

    const handleSelectAll = () => {
        if (selectedCategories.size === categories.length) {
            setSelectedCategories(new Set());
            onFilterChange([]);
        } else {
            const allCategories = new Set(categories.map(cat => cat.name));
            setSelectedCategories(allCategories);
            onFilterChange(Array.from(allCategories));
        }
    };

    return (
        <>
            {/* Hamburger Icon for Small Screens */}
            <button 
                className="lg:hidden p-2 fixed top-4 left-4 bg-gray-800 text-white rounded-md z-50"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                aria-label="Toggle Sidebar"
            >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <div className={`fixed lg:relative top-0 left-0 h-full lg:h-auto w-64 lg:w-1/4 p-4 bg-gray-900 text-white border-r border-gray-700 
                transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                lg:translate-x-0 lg:block z-40 shadow-lg overflow-y-auto`}
            >
                <h2 className="text-lg font-semibold mb-4 text-yellow-400">Filters</h2>

                {/* Select All Checkbox */}
                <div className="flex items-center mb-4">
                    <input
                        type="checkbox"
                        className="mr-2 cursor-pointer accent-yellow-400"
                        onChange={handleSelectAll}
                        checked={selectedCategories.size === categories.length}
                    />
                    <label className="font-medium text-white cursor-pointer">All Products</label>
                </div>

                {categories.map(category => (
                    <div key={category.id} className="relative mb-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                className="mr-2 cursor-pointer accent-yellow-400"
                                onChange={() => handleCategoryChange(category.name)}
                                checked={selectedCategories.has(category.name)}
                            />
                            <h3
                                className="cursor-pointer font-medium hover:text-yellow-400 transition-colors duration-500 flex-1"
                                onMouseEnter={() => !selectedCategories.has(category.name) && setHoveredCategory(category.id)}
                                onMouseLeave={() => setHoveredCategory(null)}
                                onClick={() => {
                                    handleCategoryChange(category.name); // Toggle the checkbox when category is clicked
                                    setExpandedCategory(expandedCategory === category.id ? null : category.id);
                                }}
                            >
                                {category.name}
                            </h3>
                        </div>

                        {/* Hover Effect for Subcategories (Only if Not Checked) */}
                        <div
                            className={`ml-4 text-sm text-gray-300 space-y-1 bg-gray-800 rounded-lg p-2 shadow-lg transition-all duration-1000 ease-in-out overflow-hidden 
                                ${hoveredCategory === category.id ? "opacity-100 max-h-40" : "opacity-0 max-h-0"}`}
                        >
                            {category.subcategories.map(sub => (
                                <li key={sub} className="hover:text-yellow-400 cursor-pointer list-none">
                                    {sub}
                                </li>
                            ))}
                        </div>

                        {/* Expandable Subcategories */}
                        <div
                            className={`ml-4 text-sm text-gray-300 space-y-1 transition-all duration-300 ease-in-out overflow-hidden 
                                ${expandedCategory === category.id ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
                        >
                            {category.subcategories.map(sub => (
                                <div key={sub} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="mr-2 cursor-pointer accent-yellow-400"
                                        onChange={() => handleCategoryChange(sub)}
                                        checked={selectedCategories.has(sub)}
                                    />
                                    {sub}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Overlay to close sidebar on mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 lg:hidden z-30"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </>
    );
};

export default ShopSidebar;