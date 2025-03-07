import React, { useState, useEffect } from "react";
import ShopSidebar from "../components/shopSidebar";
import ProductCard from "../components/productCard";
import CartSidebar from "../components/cartSidebar";
import axios from "axios";
import { useSelector } from "react-redux";
import Loader from "../../src/components/loader";
import { ShoppingCart } from "lucide-react";

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
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartProductIds, setCartProductIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const cartId = sessionStorage.getItem("cart_id");

  // Fetch initial data (categories, subcategories, products)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, subcategoriesRes, productsRes] = await Promise.all([
          axios.get("http://13.60.181.56:5004/categories/", {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          axios.get("http://13.60.181.56:5004/subcategories", {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          axios.get("http://13.60.181.56:5004/products/customer/products", {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
        ]);

        const categoriesData = categoriesRes.data.categories || [];
        const subcategoriesData = subcategoriesRes.data.subCategories || [];
        const productsData = productsRes.data.products || [];

        setCategories(categoriesData);
        setSubcategories(subcategoriesData);
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

  // Check for cart id, create a new cart if it doesn't exist
  useEffect(() => {
    const fetchCartId = async () => {
      let cartId = sessionStorage.getItem("cart_id");
  
      if (!cartId && authToken) {
        try {
          const response = await axios.post(
            "http://13.60.225.121:5007/carts",
            {}, // No need to pass user_id as authToken
            { headers: { Authorization: `Bearer ${authToken}` } }
          );
  
          if (response.data.success && response.data.cart_id) {
            cartId = response.data.cart_id;
            sessionStorage.setItem("cart_id", cartId);
          }
        } catch (error) {
          console.error("Error creating cart:", error.response?.data || error.message);
        }
      }
    };
  
    if (authToken) {
      fetchCartId();
    }
  }, [authToken]);
  

  // Fetch cart items
  useEffect(() => {
    const fetchCartItems = async () => {
      const cartId = sessionStorage.getItem("cart_id");
      if (!cartId || !authToken) return;
  
      try {
        const cartResponse = await axios.get(`http://13.60.225.121:5007/cart-items/${cartId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
  
        const cartItemsData = cartResponse.data.cartItems || [];
        
        setCartItems(cartItemsData);
        setCartProductIds(new Set(cartItemsData.map((item) => item.product_id)));
  
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };
  
    if (authToken) {
      fetchCartItems();
    }
  }, [authToken]);
  

  // Filter products based on category and subcategory IDs
  const filterProducts = ({ categoryId, subcategoryId }) => {
    setPageLoading(true);
    let filtered = [...products];

    if (subcategoryId) {
      filtered = filtered.filter((p) => p.sub_category_id === subcategoryId);
    } else if (categoryId) {
      const subIds = subcategories
        .filter((sub) => sub.category_id === categoryId)
        .map((sub) => sub.sub_category_id);
      filtered = filtered.filter((p) => subIds.includes(p.sub_category_id));
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
    setTimeout(() => setPageLoading(false), 500);
  };

  // Add product to cart and open cart sidebar
  const handleAddToCart = async (productId) => {
    const cartId = sessionStorage.getItem("cart_id");
    
    if (!authToken || !cartId) {
      console.error("No auth token or cart ID available");
      return;
    }
  
    try {
      const response = await axios.post(
        `http://13.60.225.121:5007/cart-items/add`,
        { cart_id: cartId, product_id: productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
  
      if (response.data.success) {
        // Fetch updated cart items only after successful addition
        const updatedCartItemsResponse = await axios.get(`http://13.60.225.121:5007/cart-items/${cartId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
  
        const cartItemsData = updatedCartItemsResponse.data.cartItems || [];
        setCartItems(cartItemsData);
        setCartProductIds(new Set(cartItemsData.map((item) => item.product_id)));
  
        setIsCartOpen(true); // Open cart sidebar
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };
  

  // Prepare sidebar categories structure
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

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => {
    setPageLoading(true);
    setCurrentPage(pageNumber);
    setTimeout(() => setPageLoading(false), 500);
  };

  // Generate page numbers for display
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  if (loading) return <Loader />;
  if (error) return <p className="text-center text-gray-600 py-10">{error}</p>;

  return (
    <div className="relative mt-20 mb-20">
      {/* Sidebar Toggle Button */}
      <button
        className="p-2 fixed top-4 left-4 bg-gray-800 text-white rounded-md z-50 hover:bg-gray-700 transition-colors duration-200"
        onClick={() => setIsSidebarOpen(true)}
      >
        Categories
      </button>

      {/* Cart Toggle Button */}
      <button
        className="p-2 fixed top-2 right-4 text-yellow-500 rounded-full z-50 hover:text-yellow-400 transition-transform duration-200 flex items-center justify-center w-12 h-12"
        onClick={() => setIsCartOpen(true)}
      >
        <ShoppingCart size={28} strokeWidth={2} />
        {cartItems.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
            {cartItems.length}
          </span>
        )}
      </button>

      {/* Shop Sidebar */}
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

      {/* Cart Sidebar */}
      <ErrorBoundary>
        {isCartOpen && (
          <CartSidebar
            cartItems={cartItems}
            closeSidebar={() => setIsCartOpen(false)}
          />
        )}
      </ErrorBoundary>

      {/* Overlay for Sidebar and Cart */}
      {(isSidebarOpen || isCartOpen) && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={() => {
            setIsSidebarOpen(false);
            setIsCartOpen(false);
          }}
        />
      )}

      {/* Product Grid */}
      <div className="w-full px-4">
        {pageLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
              {currentProducts.length > 0 ? (
                currentProducts.map((product) => (
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
                    onAddToCart={() => handleAddToCart(product.product_id)}
                    isAddedToCart={cartProductIds.has(product.product_id)}
                  />
                ))
              ) : (
                <p className="text-center text-gray-600 w-full col-span-4">No products available</p>
              )}
            </div>

            {/* Enhanced Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center mt-10">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-800 text-white rounded-l-md disabled:bg-gray-400 hover:bg-gray-700 transition-colors duration-200 flex items-center"
                  >
                    ← Prev
                  </button>
                  
                  {/* Page Numbers */}
                  {pageNumbers.map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-4 py-2 ${
                        currentPage === number
                          ? "bg-yellow-500 text-white"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      } transition-colors duration-200`}
                    >
                      {number}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-800 text-white rounded-r-md disabled:bg-gray-400 hover:bg-gray-700 transition-colors duration-200 flex items-center"
                  >
                    Next →
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Showing {indexOfFirstProduct + 1} - {Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Shop;