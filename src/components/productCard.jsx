// import React from "react";

// const ProductCard = ({ product }) => {
//     return (
//         <div className="bg-white border rounded-lg shadow-lg p-4 transition-transform hover:scale-105 mt-6">
//             <img 
//                 src={product.image} 
//                 alt={product.name} 
//                 className="w-full h-48 object-cover rounded-md"
//             />
//             <h3 className="text-lg font-semibold mt-2 text-gray-900">{product.name}</h3>
//             <p className="text-gray-600 text-md font-medium">${product.price}</p>
//             <button className="mt-3 w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition">
//                 Add to Cart
//             </button>
//         </div>
//     );
// };

// export default ProductCard;


import { useState } from "react";
import { FaHeart, FaShoppingCart, FaInfoCircle } from "react-icons/fa";

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
    <div className="bg-white shadow-lg rounded-2xl p-5 mt-6 mx-4 mb-8 transition-transform transform hover:scale-105 hover:shadow-2xl">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover rounded-lg"
        />
        <button
          className={`absolute top-2 right-2 p-2 rounded-full transition ${
            liked ? "text-red-500" : "text-gray-400"
          }`}
          onClick={handleLike}
        >
          <FaHeart size={22} />
        </button>
      </div>
      <h3 className="text-lg font-semibold mt-3 text-gray-900">{product.name}</h3>
      <p className="text-gray-600 text-md font-medium">${product.price}</p>
      <div className="flex justify-between mt-4 gap-3">
        <button
          className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition w-2/3"
          onClick={handleAddToCart}
        >
          <FaShoppingCart className="inline mr-2" /> Add to Cart
        </button>
        <button className="bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-900 transition w-1/3">
          <FaInfoCircle className="inline mr-1" /> Details
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
