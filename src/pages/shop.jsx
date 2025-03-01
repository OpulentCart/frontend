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
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const cartId = sessionStorage.getItem("cart_id");

  // Fetch initial data (categories, subcategories, products)
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

        const categoriesData = categoriesRes.data.categories || [];
        const subcategoriesData = subcategoriesRes.data.subCategories || [];
        const productsData = productsRes.data.products || [];

        console.log("Categories:", categoriesData);
        console.log("Subcategories:", subcategoriesData);
        console.log("Sample product:", productsData[0]);

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

  // Fetch cart items
  useEffect(() => {
    const fetchCartItems = async () => {
      if (!cartId || !authToken) return;

      try {
        const cartResponse = await axios.get(`http://localhost:5007/cart-items/${cartId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const cartItemsData = cartResponse.data.cartItems || [];
        const productRequests = cartItemsData.map((item) =>
          axios.get(`http://127.0.0.1:8001/related-products/${item.product_id}/`, {
            headers: { Authorization: `Bearer ${authToken}` },
          })
        );

        const productResponses = await Promise.all(productRequests);
        const products = productResponses.map((res) => res.data);

        setCartItems(products);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    fetchCartItems();
  }, [cartId, authToken]);

  // Filter products based on category and subcategory IDs
  const filterProducts = ({ categoryId, subcategoryId }) => {
    console.log("Filtering with:", { categoryId, subcategoryId });

    let filtered = [...products];

    if (subcategoryId) {
      filtered = filtered.filter((p) => p.sub_category_id === subcategoryId);
    } else if (categoryId) {
      const subIds = subcategories
        .filter((sub) => sub.category_id === categoryId)
        .map((sub) => sub.sub_category_id);
      filtered = filtered.filter((p) => subIds.includes(p.sub_category_id));
    }

    console.log("Filtered products:", filtered);
    setFilteredProducts(filtered);
  };

  // Add product to cart and open cart sidebar
  const handleAddToCart = async (productId) => {
    if (!authToken || !cartId) {
      console.error("No auth token or cart ID available");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5007/cart-items/add`,
        { cart_id: cartId, product_id: productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      const updatedCartItems = await axios.get(`http://localhost:5007/cart-items/${cartId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const cartItemsData = updatedCartItems.data.cartItems || [];
      const productRequests = cartItemsData.map((item) =>
        axios.get(`http://127.0.0.1:8001/related-products/${item.product_id}/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
      );

      const productResponses = await Promise.all(productRequests);
      const products = productResponses.map((res) => res.data);

      setCartItems(products);
      setIsCartOpen(true); // Open cart sidebar after adding item
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
              onAddToCart={() => handleAddToCart(product.product_id)}
            />
          ))
        ) : (
          <p className="text-center text-gray-600 w-full col-span-4">No products available</p>
        )}
      </div>
    </div>
  );
};

export default Shop;