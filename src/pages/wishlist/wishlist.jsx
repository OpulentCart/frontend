import { useEffect, useState } from "react";
import axios from "axios";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const authToken = useSelector((state) => state.auth.access_token);

  useEffect(() => {
    fetchWishlist();
  }, [authToken]);

  const fetchWishlist = async () => {
    if (!authToken) return;

    try {
      const response = await axios.get("http://localhost:5004/wishlist", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setWishlist(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error.response?.data || error.message);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete(`http://localhost:5004/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setWishlist((prev) => prev.filter((item) => item.product_id !== productId));
    } catch (error) {
      console.error("Error removing product from wishlist:", error);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await axios.post(
        "http://localhost:5007/cart-items",
        { product_id: productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      alert("Product added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 mt-15">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Wishlist</h1>

      {wishlist.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">Your wishlist is empty.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <motion.div
              key={item.wishlist_id}
              whileHover={{ scale: 1.02 }}
              className="bg-white shadow-md rounded-lg p-4 transition-transform flex flex-col items-center"
            >
              <img
                src={item.product.main_image || "/placeholder.jpg"}
                alt={item.product.name}
                className="w-full h-48 object-cover rounded-lg"
              />

              <div className="text-center mt-3">
                <h2 className="text-lg font-semibold text-gray-800">{item.product.name}</h2>
                <p className="text-gray-600 text-md font-medium mt-1">₹ {item.product.price}</p>
              </div>

              {/* Buttons */}
              <div className="mt-4 flex gap-3 w-full">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                  onClick={() => removeFromWishlist(item.product_id)}
                >
                  <FaHeart /> Remove
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                  onClick={() => handleAddToCart(item.product_id)}
                >
                  <FaShoppingCart /> Add to Cart
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
