import { useEffect, useState, useCallback } from "react";
import { FaHeart, FaShoppingCart, FaStar } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";

const API_URL = "http://localhost:5007/cart-items";
const WISHLIST_API = "http://localhost:5004/wishlist"; // Wishlist API endpoint

const ProductCard = ({ product }) => {
  const [liked, setLiked] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const navigate = useNavigate();
  const authToken = useSelector((state) => state.auth.access_token);

  const productName = String(product?.name || "Unknown Product");
  const productBrand = String(product?.brand || "Unknown Brand");
  const productPrice = Number(product?.price) || 0;
  const productImage = product?.image || product?.main_image || "/placeholder.jpg";

  useEffect(() => {
    const initializeCartForUser = async () => {
      if (!authToken) return;

      let cartId = sessionStorage.getItem("cart_id");

      if (!cartId || cartId === "undefined") {
        try {
          const userId = getUserIdFromToken(authToken);
          if (!userId) return;

          const createResponse = await axios.post(
            "http://localhost:5007/carts",
            { user_id: userId },
            { headers: { Authorization: `Bearer ${authToken}` } }
          );

          cartId = createResponse.data?.cart?.cart_id;
          if (cartId) sessionStorage.setItem("cart_id", cartId);
        } catch (error) {
          console.error("Error creating cart for user:", error.response?.data || error.message);
        }
      }
    };

    initializeCartForUser();
  }, [authToken]);

  useEffect(() => {
    const fetchCartItems = async () => {
      const cartId = sessionStorage.getItem("cart_id");
      if (!cartId) return;

      try {
        const response = await axios.get(`${API_URL}/${cartId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const existingItem = response.data.cartItems.find(
          (item) => item.product_id === product?.id
        );

        setIsInCart(!!existingItem);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    fetchCartItems();
  }, [product?.id, authToken]);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!authToken) return;

      try {
        const response = await axios.get(WISHLIST_API, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const wishlistItems = response.data?.data || [];
        const isProductInWishlist = wishlistItems.some(
          (item) => item.product_id === product?.id
        );

        setLiked(isProductInWishlist);
      } catch (error) {
        console.error("Error fetching wishlist:", error.response?.data || error.message);
      }
    };

    fetchWishlist();
  }, [authToken, product?.id]);

  const getUserIdFromToken = useCallback((token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded?.user_id;
    } catch (error) {
      console.error("Error decoding authToken:", error);
      return null;
    }
  }, []);

  const getOrCreateCart = useCallback(async () => {
    if (!authToken) return null;

    const userId = getUserIdFromToken(authToken);
    if (!userId) return null;

    try {
      let cartId = sessionStorage.getItem("cart_id");

      if (!cartId || cartId === "undefined") {
        const response = await axios.get("http://localhost:5007/carts", {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        cartId = response.data?.cart?.cart_id;

        if (!cartId) {
          const createResponse = await axios.post(
            "http://localhost:5007/carts",
            { user_id: userId },
            { headers: { Authorization: `Bearer ${authToken}` } }
          );
          cartId = createResponse.data?.cart?.cart_id;
        }

        if (cartId) sessionStorage.setItem("cart_id", cartId);
      }

      return cartId;
    } catch (error) {
      console.error("Error fetching or creating cart:", error.response?.data || error.message);
      return null;
    }
  }, [authToken, getUserIdFromToken]);

  const handleAddToCart = async () => {
    if (isInCart) return;

    try {
      const cartId = await getOrCreateCart();
      if (!cartId) return;

      await axios.post(
        API_URL,
        { cart_id: cartId, product_id: product?.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" } }
      );

      setIsInCart(true);
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  const handleLike = async () => {
    if (!authToken) {
      console.error("User is not authenticated.");
      return;
    }

    const newLikedState = !liked;
    setLiked(newLikedState);

    try {
      if (newLikedState) {
        // Add to wishlist
        await axios.post(
          WISHLIST_API,
          { product_id: product?.id },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
      } else {
        // Remove from wishlist
        await axios.delete(`${WISHLIST_API}/${product?.id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
      }
    } catch (error) {
      console.error("Error updating wishlist:", error.response?.data || error.message);
      setLiked(!newLikedState); // Revert state if there was an error
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-5 w-full flex flex-col justify-between transition-transform transform hover:scale-105 hover:shadow-2xl">
      {/* Product Image & Like Button */}
      <div className="relative">
        <img
          src={productImage}
          alt={productName}
          className="w-full h-52 object-contain rounded-lg"
          onError={(e) => (e.target.src = "/placeholder.jpg")}
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

      {/* Product Info */}
      <h3
        className="text-lg font-semibold mt-3 text-gray-900 truncate cursor-pointer hover:text-blue-500 transition duration-300"
        onClick={() => navigate(`/product/${product?.id}`)}
      >
        {productName}
      </h3>

      <p className="text-gray-500 text-sm">Brand: <span className="font-medium">{productBrand}</span></p>
      <p className="text-gray-600 text-md font-medium">₹ {productPrice.toFixed(2)}</p>

      {/* Ratings */}
      <div className="flex items-center mt-2">
        <FaStar className="text-yellow-500" />
        <span className="text-gray-700 text-sm ml-1">{product?.ratings || "No Rating"} / 5</span>
      </div>

      {/* "Add to Cart" Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 200 }}
        className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg shadow-md transition-all duration-300
          ${isInCart ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 hover:shadow-lg text-gray-900 font-semibold"}`}
        onClick={handleAddToCart}
        disabled={isInCart}
      >
        <FaShoppingCart size={18} /> {isInCart ? "Added to Cart" : "Add to Cart"}
      </motion.button>
    </div>
  );
};

export default ProductCard;
