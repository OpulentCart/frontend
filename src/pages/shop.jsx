import React, { useState } from "react";
import ShopSidebar from "../components/shopSidebar";
import ProductCard from "../components/productCard";

const categories = [
    { id: 1, name: "Home & Kitchen", subcategories: ["Furniture", "Appliances", "Decor"] },
    { id: 2, name: "Beauty & Personal Care", subcategories: ["Makeup", "Skincare", "Haircare"] },
    { id: 3, name: "Health & Wellness", subcategories: ["Supplements", "Medical Equipment", "Fitness"] },
    { id: 4, name: "Books & Stationery", subcategories: ["Fiction", "Notebooks", "Pens"] },
    { id: 5, name: "Automotive Accessories", subcategories: ["Car Covers", "Helmets", "Tyres"] },
    { id: 6, name: "Sports & Outdoors", subcategories: ["Sportswear", "Equipment", "Shoes"] },
    { id: 7, name: "Grocery & Essentials", subcategories: ["Vegetables", "Dairy", "Snacks"] },
    { id: 8, name: "Baby Products", subcategories: ["Diapers", "Toys", "Feeding Bottles"] },
    { id: 9, name: "Electronic Gadgets", subcategories: ["Mobiles", "Laptops", "Cameras"] },
    { id: 10, name: "Fashion & Clothing", subcategories: ["Men", "Women", "Kids"] }
];

const products = [
    { id: 1, name: "iPhone 13", price: 799, image: "https://via.placeholder.com/200", category: "Electronic Gadgets" },
    { id: 2, name: "MacBook Air", price: 999, image: "https://via.placeholder.com/200", category: "Electronic Gadgets" },
    { id: 3, name: "DSLR Camera", price: 599, image: "https://via.placeholder.com/200", category: "Electronic Gadgets" },
    { id: 4, name: "Men's Jacket", price: 59, image: "https://via.placeholder.com/200", category: "Fashion & Clothing" },
    { id: 5, name: "Women's Dress", price: 45, image: "https://via.placeholder.com/200", category: "Fashion & Clothing" },
    { id: 6, name: "Sofa Set", price: 299, image: "https://via.placeholder.com/200", category: "Home & Kitchen" }
];

const Shop = () => {
    const [filteredProducts, setFilteredProducts] = useState(products);

    const filterProducts = (selectedCategories) => {
        if (selectedCategories.length > 0) {
            setFilteredProducts(products.filter(p => selectedCategories.includes(p.category)));
        } else {
            setFilteredProducts(products);
        }
    };

    return (
        <div className="flex mt-6 pt-6 "> 
            {/* Sidebar */}
            <ShopSidebar categories={categories} onFilterChange={filterProducts} />

            {/* Product List */}
            <div className="w-3/4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <p className="text-center text-gray-600 w-full col-span-3">
                        No products available
                    </p>
                )}
            </div>
        </div>
    );
};

export default Shop;
