import { useState } from "react";
import { FaHeart, FaShoppingCart, FaStar } from "react-icons/fa";
import { motion } from "framer-motion"; // Import Framer Motion
import { useNavigate } from "react-router-dom"; // For navigation
import axios from "axios";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode"; // For decoding JWT

const API_URL = "http://localhost:5007/cart-items";

const ProductCard = ({ product, onLike }) => {
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();

  // Get authToken from Redux store
  const authToken = useSelector((state) => state.auth.access_token);

  // Function to decode user_id from authToken
  const getUserIdFromToken = (token) => {
    try {
      const decoded = jwtDecode(token); // Decode JWT
      return decoded?.user_id; // Extract user_id
    } catch (error) {
      console.error("Error decoding authToken:", error);
      return null;
    }
  };

  const getOrCreateCart = async () => {
    if (!authToken) {
      console.error("❌ No authToken found.");
      return null;
    }
  
    const userId = getUserIdFromToken(authToken);
    if (!userId) {
      console.error("❌ Invalid user ID from token.");
      return null;
    }
  
    try {
      // Step 1: Check sessionStorage for existing cart_id
      let cartId = sessionStorage.getItem("cart_id");
      console.log("🔍 SessionStorage cart_id before API call:", cartId);
  
      if (!cartId || cartId === "undefined") {  // Fix: Handle "undefined" case
        console.log("📡 Fetching existing cart for user_id:", userId);
        const response = await axios.get("http://localhost:5007/carts", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
  
        console.log("✅ Cart API Response:", response.data);
        cartId = response.data?.cart?.cart_id;
  
        if (!cartId) {
          console.log("⚡ No existing cart found, creating a new one...");
          const createResponse = await axios.post(
            "http://localhost:5007/carts",
            { user_id: userId },
            { headers: { Authorization: `Bearer ${authToken}` } }
          );
  
          console.log("✅ New cart created:", createResponse.data);
          cartId = createResponse.data?.cart?.cart_id;
        }
  
        if (cartId) {
          sessionStorage.setItem("cart_id", cartId);
          console.log("✅ Stored cart_id in sessionStorage:", cartId);
        } else {
          console.error("❌ Failed to retrieve or create cart ID.");
          return null;
        }
      }
  
      return cartId;
    } catch (error) {
      console.error("❌ Error fetching or creating cart:", error.response?.data || error.message);
      return null;
    }
  };
  

  const handleAddToCart = async () => {
    try {
      const cartId = await getOrCreateCart();

      if (!cartId) {
        console.error("❌ Failed to retrieve or create cart.");
        return;
      }

      console.log(`✅ Adding product_id: ${product.id} to cart_id: ${cartId}`);

      const response = await axios.post(
        "http://localhost:5007/cart-items",
        {
          cart_id: cartId,
          product_id: product.id,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Product added to cart:", response.data);
    } catch (error) {
      console.error("❌ Error adding product to cart:", error.response?.data || error.message);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    onLike(product.id, !liked);
  };

  const handleNavigate = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-5 w-full flex flex-col justify-between transition-transform transform hover:scale-105 hover:shadow-2xl">
      <div>
        {/* Product Image */}
        <div className="relative">
          <img
            src={product.image || product.main_image}
            alt={product.name}
            className="w-full h-52 object-contain rounded-lg"
          />

          {/* Like Button */}
          <motion.button
            whileTap={{ scale: 0.8 }}
            whileHover={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 
              ${liked ? "text-red-500 scale-110" : "text-gray-400 hover:text-red-500"}`}
            onClick={handleLike}
          >
            <FaHeart size={22} />
          </motion.button>
        </div>

        {/* Clickable Product Title */}
        <h3
          className="text-lg font-semibold mt-3 text-gray-900 truncate cursor-pointer hover:text-blue-500 transition duration-300"
          onClick={handleNavigate}
        >
          {product.name}
        </h3>

        {/* Brand Name */}
        <p className="text-gray-500 text-sm">
          Brand: <span className="font-medium">{product.brand}</span>
        </p>

        {/* Price */}
        <p className="text-gray-600 text-md font-medium">₹ {product.price}</p>

        {/* Ratings */}
        <div className="flex items-center mt-2">
          <FaStar className="text-yellow-500" />
          <span className="text-gray-700 text-sm ml-1">{product.ratings} / 5</span>
        </div>
      </div>

      {/* "Add to Cart" Button */}
      <div className="mt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-semibold py-2 px-4 rounded-lg shadow-md hover:from-yellow-500 hover:to-yellow-600 hover:shadow-lg transition-all duration-300"
          onClick={handleAddToCart}
        >
          <FaShoppingCart size={18} /> Add to Cart
        </motion.button>
      </div>
    </div>
  );
};

export default ProductCard;
