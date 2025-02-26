import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaHeart, FaShoppingCart, FaStar, FaStarHalfAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import Loader from "../../src/components/loader"; // Import the Loader component

const ProductDetails = () => {
  const authToken = useSelector((state) => state.auth.access_token);
  const { id } = useParams(); // Get Product ID from URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // State for clicked image
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 }); // Position for zoom lens
  const [isHovered, setIsHovered] = useState(false); // Track hover state

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5004/products/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setProduct(response.data.product);
        setSelectedImage(response.data.product.main_image); // Default to main image
      } catch (err) {
        setError("Failed to fetch product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, authToken]);

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image); // Set the clicked image
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left; // Cursor X relative to image
    const y = e.clientY - top; // Cursor Y relative to image
    const xPercent = (x / width) * 100; // Percentage X position
    const yPercent = (y / height) * 100; // Percentage Y position
    setZoomPosition({ x: xPercent, y: yPercent });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setZoomPosition({ x: 0, y: 0 }); // Reset zoom position on leave
  };

  // Show only the loader until loading completes
  if (loading) return <Loader />;
  if (error) return <p className="text-center text-red-600 py-10">{error}</p>;

  // Ensure product.ratings is a valid number and >= 0
  const rating = Number(product.ratings);
  const validRating = isNaN(rating) || rating < 0 ? 0 : rating;

  // Number of full stars
  const fullStars = Math.floor(validRating);
  // Check if there's a half star
  const hasHalfStar = validRating % 1 >= 0.5;

  return (
    <div className="container mx-auto px-4 py-10 mt-20 mb-20 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Images (Left Column) */}
        <div className="flex flex-col gap-4 relative">
          {/* Fixed-Size Selected Image */}
          <div
            className="w-full h-96 rounded-lg shadow-md overflow-hidden cursor-zoom-in relative bg-transparent"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-contain bg-transparent"
            />
          </div>

          {/* Thumbnail Images */}
          <div className="flex gap-2">
            <img
              src={product.main_image}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-md cursor-pointer shadow-md hover:scale-110 transition-transform bg-transparent"
              onClick={() => handleImageClick(product.main_image)}
            />
            {product.cover_images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Cover ${index}`}
                className="w-20 h-20 object-cover rounded-md cursor-pointer shadow-md hover:scale-110 transition-transform bg-transparent"
                onClick={() => handleImageClick(img)}
              />
            ))}
          </div>

          {/* Zoom Box (Appears on Hover, Positioned Beside) */}
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-full top-0 w-[500px] h-[500px] rounded-lg shadow-md overflow-hidden z-10 ml-6 bg-transparent"
              style={{
                backgroundImage: `url(${selectedImage})`,
                backgroundSize: "300%", // 3x magnification for more detail
                backgroundRepeat: "no-repeat",
                backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              }}
            >
              <img
                src={selectedImage}
                alt="Zoomed View"
                className="w-full h-full object-contain opacity-0 bg-transparent" // Invisible image for sizing
              />
            </motion.div>
          )}
        </div>

        {/* Product Details (Right Column) */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-600 text-md font-medium mt-2">
            Brand: <span className="font-semibold">{product.brand}</span>
          </p>
          <p className="text-xl font-semibold text-yellow-600 mt-2">₹ {product.price}</p>

          {/* Ratings */}
          <div className="flex items-center mt-2">
            {[...Array(fullStars)].map((_, i) => (
              <FaStar key={i} className="text-yellow-500" />
            ))}
            {hasHalfStar && <FaStarHalfAlt className="text-yellow-500" />}
            <span className="text-gray-700 ml-2">{validRating} / 5</span>
          </div>

          {/* Likes & Stock */}
          <p className="text-gray-600 mt-2">Likes: {product.likes}</p>
          <p
            className={`mt-2 font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}
          >
            {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
          </p>

          {/* Description */}
          <p className="text-gray-700 mt-4">{product.description}</p>

          {/* Buttons */}
          <div className="flex mt-6 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:from-yellow-500 hover:to-yellow-600 hover:shadow-lg transition-all duration-300"
            >
              <FaShoppingCart size={18} /> Add to Cart
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.8 }}
              whileHover={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`p-3 rounded-full transition-all duration-300 ${
                liked ? "text-red-500 scale-110" : "text-gray-400 hover:text-red-500"
              }`}
              onClick={handleLike}
            >
              <FaHeart size={24} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;