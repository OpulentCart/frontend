import React, { useState, useEffect } from "react";
import ShopSidebar from "../components/shopSidebar";
import ProductCard from "../components/productCard";
import axios from "axios";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

const Shop = () => {
  const authToken = useSelector((state) => state.auth.access_token);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesResponse = await axios.get(
          "http://localhost:5004/categories/",
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        setCategories(categoriesResponse.data.categories || []);

        const productsResponse = await axios.get(
          "http://localhost:5004/products/customer/products",
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        const productsData = productsResponse.data.products || [];
        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (err) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authToken]);

  const filterProducts = (selectedCategories) => {
    if (selectedCategories.length > 0) {
      setFilteredProducts(
        products.filter((p) =>
          selectedCategories.includes(p.Category?.name || p.categoryName)
        )
      );
    } else {
      setFilteredProducts(products);
    }
  };

  return (
    <div className="relative mt-20 mb-20">
      {/* Loader with Transparent Background */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50">
          <motion.div
            className="w-14 h-14 border-4 border-t-yellow-400 border-gray-300 rounded-full animate-spin"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        </div>
      )}

      {/* Open Sidebar Button */}
      <button
        className="p-2 fixed top-4 left-4 bg-gray-800 text-white rounded-md z-50"
        onClick={() => setIsSidebarOpen(true)}
      >
        Open Filters
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white border-r border-gray-700 transition-transform duration-300 ease-in-out transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } z-50`}
      >
        <ShopSidebar
          categories={categories.map((cat) => ({
            id: cat.category_id,
            name: cat.name,
          }))}
          onFilterChange={filterProducts}
          closeSidebar={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Background Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Product List */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6 px-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.product_id}
              product={{
                id: product.product_id,
                name: product.name,
                brand: product.brand,
                price: product.price,
                ratings: product.ratings,
                main_image: product.main_image || "/default.jpg",
              }}
              onLike={(id, liked) => console.log("Like toggled", id, liked)}
              onAddToCart={(id) => console.log("Added to Cart", id)}
            />
          ))
        ) : (
          <p className="text-center text-gray-600 w-full col-span-4">
            No products available
          </p>
        )}
      </div>
    </div>
  );
};

export default Shop;
