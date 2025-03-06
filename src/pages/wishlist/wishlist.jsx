import { useEffect, useState } from "react";
import axios from "axios";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import showToast from "../../components/showToast";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const authToken = useSelector((state) => state.auth.access_token);

  useEffect(() => {
    fetchWishlist();
  }, [authToken]);

  const fetchWishlist = async () => {
    if (!authToken) return;

    try {
      const response = await axios.get("http://13.60.181.56:5004/wishlist", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setWishlist(response.data?.data || []);
      showToast({ label: "Buy the products of your Wislist!", type: "success" });
    } catch (error) {
      console.error("Error fetching wishlist:", error.response?.data || error.message);
      showToast({ label: "Failed to fetch your wishlist", type: "success" });
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistId) => {
    try {
      await axios.delete(`http://13.60.181.56:5004/wishlist/${wishlistId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
  
      setWishlist((prev) => prev.filter((item) => item.wishlist_id !== wishlistId));
      showToast({ label: "Your product is removed from Wishlist!", type: "success" });
    } catch (error) {
      console.error("Error removing product from wishlist:", error);
      showToast({ label: "Failed to remove the product from Wishlist!", type: "error" });
    }
  };
  
  const handleAddToCart = async (productId) => {
    try {
      await axios.post(
        "http://13.60.225.121:5007/cart-items",
        { product_id: productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      showToast({ label: "Product added to Cart", type: "success" });
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast({ label: "Failed to add the product", type: "error" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 mt-15">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Wishlist</h1>

      {/* Loader */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-yellow-500 border-t-transparent"></div>
        </div>
      ) : wishlist.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">Your wishlist is empty.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <motion.div
              key={item.wishlist_id}
              whileHover={{ scale: 1.02 }}
              className="bg-white shadow-md rounded-lg p-4 transition-transform flex flex-col items-center w-64 h-[340px]"
            >
              <img
                src={item.product.main_image || "/placeholder.jpg"}
                alt={item.product.name}
                className="w-full h-40 object-cover rounded-lg"
              />

              <div className="text-center mt-3 w-full">
                <h2 className="text-lg font-semibold text-gray-800 truncate w-full">{item.product.name}</h2>
                <p className="text-gray-600 text-md font-medium mt-1">₹ {item.product.price}</p>
              </div>

              {/* Buttons */}
              <div className="mt-4 flex gap-3 w-full">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                  onClick={() => removeFromWishlist(item.wishlist_id)}
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
