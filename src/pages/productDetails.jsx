import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaHeart, FaShoppingCart, FaStar, FaStarHalfAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import Loader from "../../src/components/loader"; // Adjust path as needed

const ProductDetails = () => {
  const authToken = useSelector((state) => state.auth.access_token);
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Main product loading
  const [relatedLoading, setRelatedLoading] = useState(true); // Related products loading
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      setRelatedLoading(true);

      try {
        // Fetch main product
        const productResponse = await axios.get(`http://localhost:5004/products/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setProduct(productResponse.data.product);
        setSelectedImage(productResponse.data.product.main_image);
      } catch (err) {
        setError("Failed to fetch product details.");
        console.error("Product API Error:", err.response ? err.response.data : err.message);
        setLoading(false);
        return; // Stop if product fetch fails
      }

      try {
        // Fetch related products
        const relatedResponse = await axios.get(`http://127.0.0.1:8001/related-products/${id}/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        console.log("Related Products Response:", relatedResponse.data);

        const relatedData = Array.isArray(relatedResponse.data.related_products)
          ? relatedResponse.data.related_products
              .sort((a, b) => b.similarity_score - a.similarity_score) // Sort by similarity
              .map((item) => ({
                product_id: item.id,
                name: item.name,
                brand: item.brand,
                price: item.price || "N/A",
                main_image: item.main_image || "/default.jpg",
                similarity_score: item.similarity_score, // Include similarity score
              }))
          : [];
        setRelatedProducts(relatedData);
      } catch (err) {
        console.error("Related Products Error:", err.response ? err.response.data : err.message);
        setRelatedProducts([]); // Fallback to empty array
      } finally {
        setRelatedLoading(false);
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, authToken]);

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const xPercent = (x / width) * 100;
    const yPercent = (y / height) * 100;
    setZoomPosition({ x: xPercent, y: yPercent });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setZoomPosition({ x: 0, y: 0 });
  };

  const handleRelatedProductClick = (productId) => {
    setLoading(true); // Trigger loader immediately
    navigate(`/product/${productId}`);
  };

  if (loading) return <Loader />;
  if (error) return <p className="text-center text-red-600 py-10">{error}</p>;
  if (!product) return <p className="text-center text-gray-600 py-10">Product not found.</p>;

  const rating = Number(product.ratings);
  const validRating = isNaN(rating) || rating < 0 ? 0 : rating;
  const fullStars = Math.floor(validRating);
  const hasHalfStar = validRating % 1 >= 0.5;

  return (
    <div className="container mx-auto px-4 py-10 mt-20 mb-20 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Images */}
        <div className="flex flex-col gap-4 relative">
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

          <div className="flex gap-2">
            <img
              key={`main-${product.product_id}`}
              src={product.main_image}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-md cursor-pointer shadow-md hover:scale-110 transition-transform bg-transparent"
              onClick={() => handleImageClick(product.main_image)}
            />
            {product.cover_images.map((img, index) => (
              <img
                key={`${product.product_id}-cover-${index}`}
                src={img}
                alt={`Cover ${index}`}
                className="w-20 h-20 object-cover rounded-md cursor-pointer shadow-md hover:scale-110 transition-transform bg-transparent"
                onClick={() => handleImageClick(img)}
              />
            ))}
          </div>

          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-full top-0 w-[500px] h-[500px] rounded-lg shadow-md overflow-hidden z-10 ml-6 bg-transparent"
              style={{
                backgroundImage: `url(${selectedImage})`,
                backgroundSize: "300%",
                backgroundRepeat: "no-repeat",
                backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              }}
            >
              <img
                src={selectedImage}
                alt="Zoomed View"
                className="w-full h-full object-contain opacity-0 bg-transparent"
              />
            </motion.div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-600 text-md font-medium mt-2">
            Brand: <span className="font-semibold">{product.brand}</span>
          </p>
          <p className="text-xl font-semibold text-yellow-600 mt-2">₹ {product.price}</p>

          <div className="flex items-center mt-2">
            {[...Array(fullStars)].map((_, i) => (
              <FaStar key={`full-${i}`} className="text-yellow-500" />
            ))}
            {hasHalfStar && <FaStarHalfAlt key="half" className="text-yellow-500" />}
            <span className="text-gray-700 ml-2">{validRating} / 5</span>
          </div>

          <p className="text-gray-600 mt-2">Likes: {product.likes}</p>
          <p
            className={`mt-2 font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}
          >
            {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
          </p>

          <p className="text-gray-700 mt-4">{product.description}</p>

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

      {/* Similar Products Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Similar Products</h2>
        {relatedLoading ? (
          <div className="text-center">
            <Loader />
          </div>
        ) : relatedProducts.length > 0 ? (
          <div className="relative">
            <div
              className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-6 pb-4 hide-scrollbar"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.product_id}
                  className="snap-start flex-shrink-0 w-72 cursor-pointer"
                  onClick={() => handleRelatedProductClick(relatedProduct.product_id)}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
                  >
                    <img
                      src={relatedProduct.main_image}
                      alt={relatedProduct.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{relatedProduct.name}</h3>
                      <p className="text-sm text-gray-500">{relatedProduct.brand}</p>
                      <p className="text-xl font-bold text-gray-900 mt-2">₹ {relatedProduct.price}</p>
                      {/* <p className="text-sm text-gray-500">
                        Similarity: {(relatedProduct.similarity_score * 100).toFixed(0)}%
                      </p> */}
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
            <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
          </div>
        ) : (
          <p className="text-center text-gray-600">No similar products available.</p>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;