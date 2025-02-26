import { useState } from "react";
import { FaHeart, FaShoppingCart, FaInfoCircle, FaStar } from "react-icons/fa";
import { motion } from "framer-motion"; // Import Framer Motion

const ProductCard = ({ product, onLike, onAddToCart }) => {
  const [liked, setLiked] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const handleLike = () => {
    setLiked(!liked);
    onLike(product.id, !liked);
  };

  const handleAddToCart = () => {
    setCartCount(cartCount + 1);
    onAddToCart(product.id);
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-5 w-full flex flex-col justify-between transition-transform transform hover:scale-105 hover:shadow-2xl">
      <div>
        {/* Product Image */}
        <div className="relative">
          <img
            src={product.image || product.main_image} // Use main_image from Product Service
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

        {/* ✅ Product Name - Limited to 1 Line */}
        <h3 className="text-lg font-semibold mt-3 text-gray-900 truncate">{product.name}</h3>

        {/* ✅ Brand Name */}
        <p className="text-gray-500 text-sm">Brand: <span className="font-medium">{product.brand}</span></p>

        {/* ✅ Price */}
        <p className="text-gray-600 text-md font-medium">₹ {product.price}</p>

        {/* ✅ Ratings with Star Icons */}
        <div className="flex items-center mt-2">
          <FaStar className="text-yellow-500" />
          <span className="text-gray-700 text-sm ml-1">{product.ratings} / 5</span>
        </div>
      </div>

      {/* ✅ Buttons are always at the bottom */}
      <div className="mt-4 flex justify-between gap-3">
        {/* Add to Cart Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:from-yellow-500 hover:to-yellow-600 hover:shadow-lg transition-all duration-300"
          onClick={handleAddToCart}
        >
          <FaShoppingCart size={18} /> Add to Cart
        </motion.button>

        {/* Details Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transition-all duration-300"
        >
          <FaInfoCircle size={18} /> Details
        </motion.button>
      </div>
    </div>
  );
};

export default ProductCard;
