import React, { useState, useEffect } from "react";
import ShopSidebar from "../components/shopSidebar";
import ProductCard from "../components/productCard";
import axios from "axios";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <p className="text-red-500 text-center">Something went wrong in the sidebar.</p>;
    }
    return this.props.children;
  }
}

const Shop = () => {
  const authToken = useSelector((state) => state.auth.access_token);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, subcategoriesRes, productsRes] = await Promise.all([
          axios.get("http://localhost:5004/categories/", {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          axios.get("http://localhost:5004/subcategories", {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          axios.get("http://localhost:5004/products/customer/products", {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
        ]);

        setCategories(categoriesRes.data.categories || []);
        setSubcategories(subcategoriesRes.data.subCategories || []);
        const productsData = productsRes.data.products || [];
        console.log("Sample product:", productsData[0]); // Log to verify structure
        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authToken]);

  const filterProducts = (selectedCategories, selectedSubcategories) => {
    console.log("Filtering with:", { selectedCategories, selectedSubcategories });

    const filtered = products.filter((p) => {
      // Filter by category_id
      if (selectedCategories.length > 0) {
        const selectedCategory = categories.find((cat) => cat.name === selectedCategories[0]);
        const categoryId = selectedCategory ? selectedCategory.category_id : null;
        console.log(`Checking category_id ${p.category_id} against ${categoryId}`);
        return categoryId && p.category_id === categoryId;
      }

      // Filter by sub_category_id
      if (selectedSubcategories.length > 0) {
        const selectedSubcategory = subcategories.find((sub) => sub.name === selectedSubcategories[0]);
        const subcategoryId = selectedSubcategory ? selectedSubcategory.sub_category_id : null;
        console.log(`Checking sub_category_id ${p.sub_category_id} against ${subcategoryId}`);
        return subcategoryId && p.sub_category_id === subcategoryId;
      }

      return true; // If no filters, show all products
    });

    console.log("Filtered products:", filtered);
    setFilteredProducts(filtered);
  };

  const sidebarCategories = categories.map((cat) => ({
    id: cat.category_id,
    name: cat.name,
    subcategories: subcategories
      .filter((sub) => sub.category_id === cat.category_id)
      .map((sub) => ({
        subcategory_id: sub.sub_category_id,
        name: sub.name,
      })),
  }));

  return (
    <div className="relative mt-20 mb-20">
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

      <button
        className="p-2 fixed top-4 left-4 bg-gray-800 text-white rounded-md z-50 hover:bg-gray-700 transition-colors duration-200"
        onClick={() => setIsSidebarOpen(true)}
      >
        Categories
      </button>

      <ErrorBoundary>
        <div
          className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl border-r border-gray-700 transition-transform duration-300 ease-in-out transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } z-50`}
        >
          <ShopSidebar
            categories={sidebarCategories}
            onFilterChange={filterProducts}
            closeSidebar={() => setIsSidebarOpen(false)}
          />
        </div>
      </ErrorBoundary>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

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
            {error ? error : "No products available"}
          </p>
        )}
      </div>
    </div>
  );
};

export default Shop;