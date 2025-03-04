import { useEffect, useState, useCallback } from "react";
import { FaHeart, FaShoppingCart, FaStar } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import debounce from "lodash/debounce";

const API_URL = "http://localhost:5007/cart-items";
const INTERACTION_API_URL = "http://127.0.0.1:8002/add_interaction/";
const WISHLIST_API = "http://localhost:5004/wishlist";

const ProductCard = ({ product, onLike }) => {
  const [liked, setLiked] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const authToken = useSelector((state) => state.auth.access_token);

  const productName = String(product?.name || "Unknown Product");
  const productBrand = String(product?.brand || "Unknown Brand");
  const productPrice = Number(product?.price) || 0;
  const productImage = product?.image || product?.main_image || "/placeholder.jpg";

  console.log("Frontend: ProductCard rendered with product:", product);

  // Initialize cart for user (unchanged)
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
          console.error("Error creating cart:", error.response?.data || error.message);
        }
      }
    };

    initializeCartForUser();
  }, [authToken]);

  // Fetch cart items to check if product is in cart (unchanged)
  useEffect(() => {
    const fetchCartItems = async () => {
      const cartId = sessionStorage.getItem("cart_id");
      if (!cartId || !authToken) return;

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

  // Fetch wishlist status (unchanged)
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
      console.error("Error managing cart:", error.response?.data || error.message);
      return null;
    }
  }, [authToken, getUserIdFromToken]);

  const handleAddToCart = async () => {
    if (isInCart || !authToken) return;

    setIsLoading(true);
    try {
      const cartId = await getOrCreateCart();
      if (!cartId) {
        throw new Error("Failed to get or create cart");
      }

      await axios.post(
        API_URL,
        { cart_id: cartId, product_id: product?.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" } }
      );
      setIsInCart(true);

      const userId = getUserIdFromToken(authToken);
      if (!userId) throw new Error("Invalid user token");

      const interactionPayload = {
        user_id: Number(userId),
        product_id: Number(product.id),
        interaction_type: "add_to_cart",
        rating: 0,
        timestamp: new Date().toISOString(),
      };

      const interactionResponse = await axios.post(
        INTERACTION_API_URL,
        interactionPayload,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Interaction recorded:", interactionResponse.data);
    } catch (error) {
      console.error("Error in handleAddToCart:", {
        message: error.message,
        response: error.response?.data,
      });
      setError("Failed to add to cart or record interaction. Please try again.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!authToken) {
      console.error("User is not authenticated.");
      return;
    }

    const newLikedState = !liked;
    setLiked(newLikedState);
    if (onLike) onLike(product?.id, newLikedState);

    try {
      // Step 1: Update the wishlist
      if (newLikedState) {
        await axios.post(
          WISHLIST_API,
          { product_id: product?.id },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
      } else {
        await axios.delete(`${WISHLIST_API}/${product?.id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
      }

      // Step 2: Record the "liked" interaction with the same payload structure as "add_to_cart"
      const userId = getUserIdFromToken(authToken);
      if (!userId) throw new Error("Invalid user token");

      const interactionPayload = {
        user_id: Number(userId),
        product_id: Number(product.id),
        interaction_type: "wishlist", // Only difference from "add_to_cart"
        rating: 0,
        timestamp: new Date().toISOString(),
      };

      const interactionResponse = await axios.post(
        INTERACTION_API_URL,
        interactionPayload,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Like interaction recorded:", interactionResponse.data);
    } catch (error) {
      console.error("Error updating wishlist or recording interaction:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setLiked(!newLikedState); // Revert state on error
      setError("Failed to update wishlist or record interaction. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const debouncedHandleCardClick = useCallback(
    debounce(async (e) => {
      e.stopPropagation();
      if (!authToken || !product?.id) {
        console.error("Missing authentication or product data");
        return;
      }

      setIsLoading(true);
      try {
        const userId = getUserIdFromToken(authToken);
        if (!userId) throw new Error("Invalid user token");

        const payload = {
          user_id: Number(userId),
          product_id: Number(product.id),
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
        setError("Failed to record interaction. Please try again.");
        setTimeout(() => setError(null), 3000);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [authToken, product?.id, getUserIdFromToken]
  );

  const handleProductNameClick = (e) => {
    e.stopPropagation();
    debouncedHandleCardClick(e); // Record interaction
    navigate(`/product/${product?.id}`);
  };

  return (
    <motion.div
      className={`bg-white shadow-lg rounded-2xl p-5 w-full flex flex-col justify-between transition-transform transform hover:scale-105 hover:shadow-2xl ${
        isLoading ? "opacity-75" : ""
      }`}
      onClick={debouncedHandleCardClick}
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="relative">
        <img
          src={productImage}
          alt={productName}
          className="w-full h-52 object-contain rounded-lg"
          onError={(e) => (e.target.src = "/placeholder.jpg")}
        />
        <motion.button
          whileTap={{ scale: 0.8 }}
          whileHover={{ scale: 1.2 }}
          transition={{ type: "spring", stiffness: 300 }}
          className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 
            ${liked ? "text-red-500 scale-110" : "text-gray-400 hover:text-red-500"}`}
          onClick={(e) => {
            e.stopPropagation();
            handleLike();
          }}
        >
          <FaHeart size={22} />
        </motion.button>
      </div>

      <h3
        className="text-lg font-semibold mt-3 text-gray-900 truncate cursor-pointer hover:text-blue-500 transition duration-300"
        onClick={handleProductNameClick}
      >
        {productName}
      </h3>

      <p className="text-gray-500 text-sm">
        Brand: <span className="font-medium">{productBrand}</span>
      </p>

      <p className="text-gray-600 text-md font-medium">₹ {productPrice.toFixed(2)}</p>

      <div className="flex items-center mt-2">
        <FaStar className="text-yellow-500" />
        <span className="text-gray-700 text-sm ml-1">{product?.ratings || "No Rating"} / 5</span>
      </div>

      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 200 }}
        className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg shadow-md transition-all duration-300
          ${
            isInCart
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 hover:shadow-lg text-gray-900 font-semibold"
          }
          ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          handleAddToCart();
        }}
        disabled={isInCart || isLoading}
      >
        <FaShoppingCart size={18} />
        {isLoading ? "Processing..." : isInCart ? "Added to Cart" : "Add to Cart"}
      </motion.button>
    </motion.div>
  );
};

export default ProductCard;