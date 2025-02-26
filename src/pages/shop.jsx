// import React, { useState } from "react";
// import ShopSidebar from "../components/shopSidebar";
// import ProductCard from "../components/productCard";

// const categories = [
//     { id: 1, name: "Home & Kitchen", subcategories: ["Furniture", "Appliances", "Decor"] },
//     { id: 2, name: "Beauty & Personal Care", subcategories: ["Makeup", "Skincare", "Haircare"] },
//     { id: 3, name: "Health & Wellness", subcategories: ["Supplements", "Medical Equipment", "Fitness"] },
//     { id: 4, name: "Books & Stationery", subcategories: ["Fiction", "Notebooks", "Pens"] },
//     { id: 5, name: "Automotive Accessories", subcategories: ["Car Covers", "Helmets", "Tyres"] },
//     { id: 6, name: "Sports & Outdoors", subcategories: ["Sportswear", "Equipment", "Shoes"] },
//     { id: 7, name: "Grocery & Essentials", subcategories: ["Vegetables", "Dairy", "Snacks"] },
//     { id: 8, name: "Baby Products", subcategories: ["Diapers", "Toys", "Feeding Bottles"] },
//     { id: 9, name: "Electronic Gadgets", subcategories: ["Mobiles", "Laptops", "Cameras"] },
//     { id: 10, name: "Fashion & Clothing", subcategories: ["Men", "Women", "Kids"] }
// ];

// const products = [
//     { id: 1, name: "iPhone 13", price: 799, image: "https://via.placeholder.com/200", category: "Electronic Gadgets" },
//     { id: 2, name: "MacBook Air", price: 999, image: "https://via.placeholder.com/200", category: "Electronic Gadgets" },
//     { id: 3, name: "DSLR Camera", price: 599, image: "https://via.placeholder.com/200", category: "Electronic Gadgets" },
//     { id: 4, name: "Men's Jacket", price: 59, image: "https://via.placeholder.com/200", category: "Fashion & Clothing" },
//     { id: 5, name: "Women's Dress", price: 45, image: "https://via.placeholder.com/200", category: "Fashion & Clothing" },
//     { id: 6, name: "Sofa Set", price: 299, image: "https://via.placeholder.com/200", category: "Home & Kitchen" }
// ];

// const Shop = () => {
//     const [filteredProducts, setFilteredProducts] = useState(products);

//     const filterProducts = (selectedCategories) => {
//         if (selectedCategories.length > 0) {
//             setFilteredProducts(products.filter(p => selectedCategories.includes(p.category)));
//         } else {
//             setFilteredProducts(products);
//         }
//     };

//     return (
//         <div className="flex mt-6 pt-6 "> 
//             {/* Sidebar */}
//             <ShopSidebar categories={categories} onFilterChange={filterProducts} />

//             {/* Product List */}
//             <div className="w-3/4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
//                 {filteredProducts.length > 0 ? (
//                     filteredProducts.map(product => (
//                         <ProductCard key={product.id} product={product} />
//                     ))
//                 ) : (
//                     <p className="text-center text-gray-600 w-full col-span-3">
//                         No products available
//                     </p>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Shop;





import React, { useState, useEffect } from "react";
import ShopSidebar from "../components/shopSidebar";
import ProductCard from "../components/productCard";
import axios from 'axios'; 
import { useSelector } from 'react-redux';

const Shop = () => {

    const authToken = useSelector((state) => state.auth.access_token); 

    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch data from backend when component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch categories
                const categoriesResponse = await axios.get('http://localhost:5004/categories/');
                    
                if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
                const categoriesData = await categoriesResponse.json();
                setCategories(categoriesData);

                // Fetch products
                const productsResponse = await axios.get('http://localhost:5004/products/customer/products',
                    {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    }
                });
                if (!productsResponse.ok) throw new Error('Failed to fetch products');
                const productsData = await productsResponse.json();
                setProducts(productsData);
                setFilteredProducts(productsData); // Initial display of all products
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // Empty dependency array means it runs once on mount

    const filterProducts = (selectedCategories) => {
        if (selectedCategories.length > 0) {
            setFilteredProducts(products.filter(p => selectedCategories.includes(p.Category.name)));
        } else {
            setFilteredProducts(products);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="flex mt-6 pt-6"> 
            {/* Sidebar - Pass categories to ShopSidebar */}
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