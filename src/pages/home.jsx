import React, { useEffect, useState, Component, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import debounce from "lodash/debounce";
import CountdownTimer from "../components/countDown.jsx";
import AdvertisementCarousel from "../components/advertisementCarousel.jsx";
import Loader from "../components/loader.jsx"; // Adjust path based on your project structure
import useCart from "../hooks/useCart.js";

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center text-red-600 py-10">
          <p>Something went wrong: {this.state.error?.message || "Unknown error"}</p>
          <p>Please try refreshing the page or contact support.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const categories = [
  {
    name: "Electronics",
    products: [
      { id: 1, name: "Smartphone", image: "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-m33-1.jpg" },
      { id: 2, name: "Laptop", image: "https://imgs.search.brave.com/OEmn5HVFwJY_x3Pcp1_bmLei8KLdGwqex0W8wiO-DTI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMtbmEuc3NsLWlt/YWdlcy1hbWF6b24u/Y29tL2ltYWdlcy9J/LzgxcHZrU3dRdnRM/LmpwZw" },
      { id: 3, name: "Smartwatch", image: "https://imgs.search.brave.com/62DPJ-ztr-spiUZbD02_rpO9b5muu6JUAhkVGDGfPow/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9saDMu/Z29vZ2xldXNlcmNv/bnRlbnQuY29tL3Ft/SDFxSjN4VTcxaGtp/RXVPT0F2dXdCMXk4/OVFKU19Vc05QSUFw/V0xUYmx3aVJxb2NW/Y1JVbXFqeUdQRWVZ/RkV5YWtNZzV0NFI1/M21rQUJ5RHhJQXdK/dG5feHVLQWhjWTF4/RDBqQXlJWmx5Tng3/WlNYWFk" },
    ],
  },
  {
    name: "Fashion",
    products: [
      { id: 4, name: "T-Shirt", image: "https://imgs.search.brave.com/ls2Y3Ri1Nn6fa1MDG8vjfYa7rCdSj3r70Kp83G4Smbw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzEwLzA1LzU4LzU2/LzM2MF9GXzEwMDU1/ODU2MjhfVzdrb1VU/VTYwMXRJbHlaQUo2/OWNTeHByVWx2R3h6/azYuanBn" },
      { id: 5, name: "Jeans", image: "https://imgs.search.brave.com/cmVMgk7OKDYE1lRrE9eW0m8iiFDJKkERYrrGWLXq3Pg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTEz/MjE1NDM3Ny9waG90/by9qZWFucy5qcGc_/cz02MTJ4NjEyJnc9/MCZrPTIwJmM9VDNL/MV9QZGxaeFhJTEtG/dkdrVG1QaUlmNU0y/RWRJeGtxYTc5QUpU/X3cwWT0" },
      { id: 6, name: "Sneakers", image: "https://imgs.search.brave.com/u9WRHqhEtApbVptlvBxsRKUD4ByaP4Ou8iIWhLX7LGU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/ZnJlZS1waG90by9m/YXNoaW9uLXNob2Vz/LXNuZWFrZXJzXzEy/MDMtNzUyOS5qcGc_/c2VtdD1haXNfaHli/cmlk" },
    ],
  },
  {
    name: "Home & Kitchen",
    products: [
      { id: 7, name: "Blender", image: "https://imgs.search.brave.com/A84OGOAm-417Yr3pfwT3xLhy0QxLu7Fed5Ab4aWDXZ4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTcx/MTE0OTQ4L3Bob3Rv/L2JsZW5kZXIuanBn/P3M9NjEyeDYxMiZ3/PTAmaz0yMCZjPUtv/bldmdDJYQzJhZ2Rz/dkpDczNSd2I0LVNr/UGRJdGdlT3htczBO/bEI2NXc9" },
      { id: 8, name: "Microwave", image: "https://imgs.search.brave.com/UaxARJBLYiMaBpT02GSgXmIxRorfMH2fznHAGDGthdY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA1LzU5LzczLzU4/LzM2MF9GXzU1OTcz/NTgyMF9YZ0xrNkNQ/RzR6c1B2TVdHSEdj/YWhSTjhScVVRdmlO/UC5qcGc" },
      { id: 9, name: "Dining Set", image: "https://via.placeholder.com/150" },
    ],
  },
];

function HomePage() {
  const authToken = useSelector((state) => state.auth.access_token);
  //const cartId = useCart(authToken);
  const navigate = useNavigate();
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [errorRecommendations, setErrorRecommendations] = useState(null);
  const [cartId, setCartId] = useState(() => sessionStorage.getItem("cartId") || "");

  const INTERACTION_API_URL = "http://127.0.0.1:8002/add_interaction/";

  const featuredProducts = [
    {
      id: 1,
      name: "Apple iPhone 14 Pro",
      price: "$999",
      image: "/products/iphone14.jpg",
    },
    {
      id: 2,
      name: "Nike Air Max Sneakers",
      price: "$150",
      image: "/products/nike-air-max.jpg",
    },
    {
      id: 3,
      name: "Sony WH-1000XM4",
      price: "$299",
      image: "/products/sony-headphones.jpg",
    },
    {
      id: 4,
      name: "Samsung Galaxy Watch 5",
      price: "$249",
      image: "/products/samsung-watch.jpg",
    },
  ];

  const getUserIdFromToken = useCallback((token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded?.user_id;
    } catch (error) {
      console.error("Error decoding authToken:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchOrCreateCart = async () => {
      if (!authToken) return; // Exit if no token

      const userId = getUserIdFromToken(authToken);
      if (!userId) return null;

      // Check session storage first
      const storedCartId = sessionStorage.getItem("cartId");
      if (storedCartId) {
        setCartId(storedCartId);
        return;
      }

      try {
        // Fetch existing cart
        const response = await axios.get("http://localhost:5007/carts", {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (response.data.cartId) {
          console.log("Cart exists:", response.data.cartId);
          setCartId(response.data.cartId);
          sessionStorage.setItem("cartId", response.data.cartId);
        } else {
          console.log("No cart found, creating a new one...");

          // Create a new cart
          const createCartResponse = await axios.post(
            "http://localhost:5007/carts",
            { user_id: userId },
            { headers: { Authorization: `Bearer ${authToken}` } }
          );

          console.log("New cart created:", createCartResponse.data.cartId);
          setCartId(createCartResponse.data.cartId);
          sessionStorage.setItem("cartId", createCartResponse.data.cartId);
        }
      } catch (error) {
        console.error("Error fetching/creating cart:", error.response?.data || error.message);
      }
    };

    fetchOrCreateCart();
  }, [authToken]);
    

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoadingRecommendations(true);
      setErrorRecommendations(null);

      let userId = null;
      if (authToken) {
        try {
          const decodedToken = jwtDecode(authToken);
          console.log("Decoded Token:", decodedToken);
          userId = decodedToken.user_id || decodedToken.id;
        } catch (err) {
          console.error("JWT Decode Error:", err);
          setErrorRecommendations("Failed to decode user token.");
          setLoadingRecommendations(false);
          return;
        }
      } else {
        setErrorRecommendations("Please log in to see recommendations.");
        setLoadingRecommendations(false);
        return;
      }

      try {
        const response = await axios.get(`http://127.0.0.1:8003/recommendations/${userId}/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log("Recommendations Response:", response.data);
        setRecommendedProducts(response.data.recommended_products || []);
      } catch (err) {
        console.error("Recommendations Error:", err.response ? err.response.data : err.message);
        setErrorRecommendations("Failed to fetch recommendations: " + (err.response?.data?.message || err.message));
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [authToken]);

  const debouncedHandleCardClick = useCallback(
    debounce(async (productId) => {
      if (!authToken || !productId) {
        console.error("Missing authentication or product ID");
        return;
      }

      try {
        const userId = jwtDecode(authToken).user_id || jwtDecode(authToken).id;
        if (!userId) throw new Error("Invalid user token");

        const payload = {
          user_id: Number(userId),
          product_id: Number(productId),
          interaction_type: "click",
          rating: 0,
          timestamp: new Date().toISOString(),
        };

        const response = await axios.post(
          INTERACTION_API_URL,
          payload,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Interaction recorded:", response.data);
      } catch (error) {
        console.error("Error recording interaction:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
      }
    }, 300),
    [authToken]
  );

  const handleRecommendedProductClick = (productId) => {
    debouncedHandleCardClick(productId); // Record interaction
    navigate(`/product/${productId}`); // Navigate to product page
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white">
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <AdvertisementCarousel />
          
        </div>

        {/* Categories Section */}
        <div className="py-10 px-6">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Explore Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.15)" }}
                className="bg-gray-100 p-5 rounded-lg shadow-md cursor-pointer"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{category.name}</h3>
                <div className="grid grid-cols-3 gap-4">
                  {category.products.map((product) => (
                    <motion.div
                      key={product.id}
                      whileHover={{ scale: 1.1 }}
                      className="flex flex-col items-center"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded-md"
                        onError={(e) => (e.target.src = "/default.jpg")} // Fallback image
                      />
                      <p className="text-sm text-gray-700 mt-2">{product.name}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Limited-Time Offer Section */}
        <div className="w-full bg-amber-100 text-black py-10 px-6 text-center">
          <h2 className="text-3xl font-bold">🔥 Hurry! Limited-Time Offer</h2>
          <p className="mt-2 text-lg">Grab the best deals before time runs out!</p>
          <div className="flex justify-center mt-4">
            <div className="bg-white text-red-600 px-4 py-2 rounded-md text-xl font-bold">
              <CountdownTimer />
            </div>
          </div>
          <div className="mt-6 flex flex-col md:flex-row justify-center items-center gap-6">
            <div className="bg-white p-4 rounded-lg shadow-md text-black w-64">
              <img src="/products/iphone14.jpg" alt="iPhone 14" className="w-full h-40 object-cover rounded-md" />
              <h3 className="mt-2 text-lg font-semibold">Apple iPhone 14 Pro</h3>
              <p className="text-red-500 font-bold">$799 <span className="text-gray-500 line-through">$999</span></p>
              <Link to="/shop" className="mt-3 inline-block px-6 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-700 transition">
                Shop Now
              </Link>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-black w-64">
              <img src="/products/nike-air-max.jpg" alt="Nike Air Max" className="w-full h-40 object-cover rounded-md" />
              <h3 className="mt-2 text-lg font-semibold">Nike Air Max Sneakers</h3>
              <p className="text-red-500 font-bold">$120 <span className="text-gray-500 line-through">$150</span></p>
              <Link to="/shop" className="mt-3 inline-block px-6 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-700 transition">
                Shop Now
              </Link>
            </div>
          </div>
        </div>

        {/* Suggested for You Section - Only visible if recommendations are available */}
        {!loadingRecommendations && !errorRecommendations && recommendedProducts.length > 0 && (
          <div className="max-w-7xl mx-auto py-12 px-6">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">Suggested for You</h2>
            <div className="relative">
              <div
                className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-6 pb-4 hide-scrollbar"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {recommendedProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="snap-start flex-shrink-0 w-72 bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer"
                    onClick={() => handleRecommendedProductClick(product.id)}
                  >
                    <img
                      src={product.main_image || "/default.jpg"}
                      alt={product.name || "Product"}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{product.name || "Unnamed Product"}</h3>
                      <p className="text-sm text-gray-500">{product.brand || "Unknown Brand"}</p>
                      <p className="text-xl font-bold text-gray-900 mt-2">₹ {product.price || "N/A"}</p>
                      <p className="text-sm text-gray-500">
                        Score: {(product.hybrid_score * 100).toFixed(2) || 0}%
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
            </div>
          </div>
        )}

        {/* Featured Products Section */}
        <div className="max-w-7xl mx-auto py-12 px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center">Featured Products</h2>
          <p className="text-gray-600 text-center mt-2">Discover our top picks for you</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-gray-100 p-4 rounded-lg shadow-md hover:shadow-lg transition">
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-md" />
                <h3 className="mt-4 text-lg font-semibold">{product.name}</h3>
                <p className="text-yellow-600 font-bold">{product.price}</p>
                <button className="mt-3 w-full py-2 bg-yellow-500 text-black font-semibold rounded-md hover:bg-yellow-600 transition">
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default HomePage;