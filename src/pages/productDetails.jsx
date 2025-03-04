import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaHeart, FaShoppingCart, FaStar, FaStarHalfAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import debounce from "lodash/debounce";
import Loader from "../../src/components/loader"; // Adjust path as needed

const ProductDetails = () => {
  const authToken = useSelector((state) => state.auth.access_token);
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similarLoading, setSimilarLoading] = useState(true);
  const [recommendedLoading, setRecommendedLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const INTERACTION_API_URL = "http://127.0.0.1:8002/add_interaction/";

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      setSimilarLoading(true);
      setRecommendedLoading(true);

      let userId = null;
      if (authToken) {
        try {
          const decodedToken = jwtDecode(authToken);
          console.log("Decoded Token:", decodedToken);
          userId = decodedToken.user_id || decodedToken.id;
          setUserId(userId);
        } catch (err) {
          console.error("JWT Decode Error:", err);
          setUserId(null);
        }
      }

      try {
        const productResponse = await axios.get(`http://localhost:5004/products/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setProduct(productResponse.data.product);
        setSelectedImage(productResponse.data.product.main_image);
      } catch (err) {
        setError("Failed to fetch product details: " + (err.response?.data?.message || err.message));
        console.error("Product API Error:", err.response ? err.response.data : err.message);
        setLoading(false);
        return;
      }

      try {
        const similarResponse = await axios.get(`http://127.0.0.1:8001/related-products/${id}/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const similarData = Array.isArray(similarResponse.data.related_products)
          ? similarResponse.data.related_products
              .sort((a, b) => b.similarity_score - a.similarity_score)
              .map((item) => ({
                product_id: item.id,
                name: item.name,
                brand: item.brand,
                price: item.price || "N/A",
                main_image: item.main_image || "/default.jpg",
                similarity_score: item.similarity_score,
              }))
          : [];
        setSimilarProducts(similarData);
      } catch (err) {
        console.error("Similar Products Error:", err.response ? err.response.data : err.message);
        setSimilarProducts([]);
      } finally {
        setSimilarLoading(false);
      }

      if (userId) {
        try {
          const hybridResponse = await axios.get(`http://127.0.0.1:8002/hybrid/${userId}/${id}/`, {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          const recommendedData = Array.isArray(hybridResponse.data.recommended_products)
            ? hybridResponse.data.recommended_products
              .sort((a, b) => b.hybrid_score - a.hybrid_score)
              .map((item) => ({
                product_id: item.id,
                name: item.name,
                brand: item.brand,
                price: item.price || "N/A",
                main_image: item.main_image || "/default.jpg",
                hybrid_score: item.hybrid_score,
              }))
            : [];
          setRecommendedProducts(recommendedData);
        } catch (err) {
          console.error("Hybrid Recommendations Error:", err.response ? err.response.data : err.message);
          setRecommendedProducts([]);
        } finally {
          setRecommendedLoading(false);
          setLoading(false);
        }
      } else {
        setRecommendedProducts([]);
        setRecommendedLoading(false);
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, authToken]);

  const handleLike = () => setLiked(!liked);
  const handleImageClick = (image) => setSelectedImage(image);
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    setZoomPosition({ x: (x / width) * 100, y: (y / height) * 100 });
  };
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setZoomPosition({ x: 0, y: 0 });
  };

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
        setError("Failed to record interaction. Please try again.");
        setTimeout(() => setError(null), 3000);
      }
    }, 300),
    [authToken]
  );

  const handleRelatedProductClick = (productId) => {
    setLoading(true);
    debouncedHandleCardClick(productId); // Record interaction
    navigate(`/product/${productId}`); // Navigate to product page
  };

  if (loading) return <Loader />;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-xl text-red-600 font-medium">{error}</p>
    </div>
  );
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-xl text-gray-600 font-medium">Product not found.</p>
    </div>
  );

  const rating = Number(product.ratings);
  const validRating = isNaN(rating) || rating < 0 ? 0 : rating;
  const fullStars = Math.floor(validRating);
  const hasHalfStar = validRating % 1 >= 0.5;

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    hover: { scale: 1.02, transition: { type: "spring", stiffness: 200 } },
  };

  const buttonVariants = {
    hover: { scale: 1.03, transition: { type: "spring", stiffness: 300 } },
    tap: { scale: 0.98, transition: { duration: 0.15 } },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Main Product Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-xl shadow-md p-6 lg:p-8 border border-gray-100"
        >
          {/* Product Images */}
          <div className="space-y-6">
            <motion.div
              className="relative w-full h-[420px] bg-gray-100 rounded-lg overflow-hidden shadow-sm"
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={selectedImage || product.main_image}
                alt={product.name}
                className="w-full h-full object-contain transition-all duration-300"
                style={{
                  transform: isHovered ? `scale(1.5) translate(-${zoomPosition.x / 3}%, -${zoomPosition.y / 3}%)` : "scale(1)",
                }}
              />
            </motion.div>

            {/* Thumbnail Carousel */}
            <div className="flex gap-2 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {[product.main_image, ...product.cover_images].map((img, index) => (
                <motion.img
                  key={index}
                  src={img}
                  alt={`Thumbnail ${index}`}
                  className={`w-20 h-20 object-cover rounded-md cursor-pointer shadow-sm border-2 ${
                    selectedImage === img ? "border-yellow-500" : "border-gray-200 hover:border-yellow-300"
                  }`}
                  onClick={() => handleImageClick(img)}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <h1 className="text-3xl font-semibold text-gray-900 leading-tight">{product.name}</h1>
            <p className="text-base text-gray-600">
              <span className="font-medium text-gray-800">Brand:</span> {product.brand}
            </p>
            <p className="text-2xl font-bold text-yellow-600">₹ {product.price}</p>

            <div className="flex items-center gap-2">
              {[...Array(fullStars)].map((_, i) => (
                <FaStar key={`full-${i}`} className="text-yellow-400" size={18} />
              ))}
              {hasHalfStar && <FaStarHalfAlt className="text-yellow-400" size={18} />}
              <span className="text-gray-700 ml-2 text-sm">{validRating} / 5</span>
            </div>

            {/* <p className="text-gray-600 text-sm">Likes: <span className="font-medium">{product.likes}</span></p> */}
            <p
              className={`text-base font-medium ${
                product.stock > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
            </p>

            <p className="text-gray-700 leading-relaxed text-sm">{product.description}</p>

            <div className="flex items-center gap-4">
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className={`flex items-center gap-2 bg-yellow-600 text-white font-medium py-2 px-6 rounded-lg shadow-md hover:bg-yellow-700 transition-all duration-200 ${
                  product.stock === 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={product.stock === 0}
              >
                <FaShoppingCart size={20} /> Add to Cart
              </motion.button>
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className={`p-3 rounded-full bg-gray-100 shadow-sm transition-all duration-200 ${
                  liked ? "text-red-500" : "text-gray-400 hover:text-red-500"
                }`}
                onClick={handleLike}
              >
                <FaHeart size={24} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Similar Products Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Similar Products</h2>
          {similarLoading ? (
            <div className="text-center">
              <Loader />
            </div>
          ) : similarProducts.length > 0 ? (
            <div className="relative">
              <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 pb-4">
                {similarProducts.map((similarProduct, index) => (
                  <motion.div
                    key={similarProduct.product_id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    transition={{ delay: index * 0.05 }}
                    className="snap-start flex-shrink-0 w-72 bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer border border-gray-100"
                    onClick={() => handleRelatedProductClick(similarProduct.product_id)}
                  >
                    <div className="relative">
                      <img
                        src={similarProduct.main_image}
                        alt={similarProduct.name}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900 truncate">{similarProduct.name}</h3>
                      <p className="text-sm text-gray-500">{similarProduct.brand}</p>
                      <p className="text-xl font-semibold text-gray-900 mt-2">₹ {similarProduct.price}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-gray-50 to-transparent pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-gray-50 to-transparent pointer-events-none"></div>
            </div>
          ) : (
            <p className="text-center text-gray-600 text-base">No similar products available.</p>
          )}
        </div>

        {/* You May Also Like Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">You May Also Like</h2>
          {recommendedLoading ? (
            <div className="text-center">
              <Loader />
            </div>
          ) : recommendedProducts.length > 0 ? (
            <div className="relative">
              <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 pb-4">
                {recommendedProducts.map((recommendedProduct, index) => (
                  <motion.div
                    key={recommendedProduct.product_id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    transition={{ delay: index * 0.05 }}
                    className="snap-start flex-shrink-0 w-72 bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer border border-gray-100"
                    onClick={() => handleRelatedProductClick(recommendedProduct.product_id)}
                  >
                    <div className="relative">
                      <img
                        src={recommendedProduct.main_image}
                        alt={recommendedProduct.name}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900 truncate">{recommendedProduct.name}</h3>
                      <p className="text-sm text-gray-500">{recommendedProduct.brand}</p>
                      <p className="text-xl font-semibold text-gray-900 mt-2">₹ {recommendedProduct.price}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-gray-50 to-transparent pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-gray-50 to-transparent pointer-events-none"></div>
            </div>
          ) : (
            <p className="text-center text-gray-600 text-base">
              {userId ? "No recommendations available." : "Log in to see personalized recommendations."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;