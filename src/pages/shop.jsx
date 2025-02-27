// import React, { useState, useEffect } from "react";
// import ShopSidebar from "../components/shopSidebar";
// import ProductCard from "../components/productCard";
// import CartSidebar from "../components/cartSidebar";
// import axios from "axios";
// import { useSelector } from "react-redux";
// import { motion } from "framer-motion";

// const Shop = () => {
//   const authToken = useSelector((state) => state.auth.access_token);

//   const [categories, setCategories] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const categoriesResponse = await axios.get(
//           "http://localhost:5004/categories/",
//           { headers: { Authorization: `Bearer ${authToken}` } }
//         );
//         setCategories(categoriesResponse.data.categories || []);

//         const productsResponse = await axios.get(
//           "http://localhost:5004/products/customer/products",
//           { headers: { Authorization: `Bearer ${authToken}` } }
//         );
//         const productsData = productsResponse.data.products || [];
//         setProducts(productsData);
//         setFilteredProducts(productsData);
//       } catch (err) {
//         setError(err.message || "Failed to fetch data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [authToken]);

//   const filterProducts = (selectedCategories) => {
//     if (selectedCategories.length > 0) {
//       setFilteredProducts(
//         products.filter((p) =>
//           selectedCategories.includes(p.Category?.name || p.categoryName)
//         )
//       );
//     } else {
//       setFilteredProducts(products);
//     }
//   };

//   return (
//     <div className="relative mt-20 mb-20">
//       {/* Loader with Transparent Background */}
//       {loading && (
//         <div className="absolute inset-0 bg-white bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50">
//           <motion.div
//             className="w-14 h-14 border-4 border-t-yellow-400 border-gray-300 rounded-full animate-spin"
//             initial={{ rotate: 0 }}
//             animate={{ rotate: 360 }}
//             transition={{ repeat: Infinity, duration: 1 }}
//           />
//         </div>
//       )}

//       {/* Open Sidebar Button */}
//       <button
//         className="p-2 fixed top-4 left-4 bg-gray-800 text-white rounded-md z-50"
//         onClick={() => setIsSidebarOpen(true)}
//       >
//         Open Filters
//       </button>

//       {/* Sidebar */}
//       <div
//         className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white border-r border-gray-700 transition-transform duration-300 ease-in-out transform ${
//           isSidebarOpen ? "translate-x-0" : "-translate-x-full"
//         } z-50`}
//       >
//         <ShopSidebar
//           categories={categories.map((cat) => ({
//             id: cat.category_id,
//             name: cat.name,
//           }))}
//           onFilterChange={filterProducts}
//           closeSidebar={() => setIsSidebarOpen(false)}
//         />
//       </div>

//       {/* Background Overlay */}
//       {isSidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black opacity-50 z-40"
//           onClick={() => setIsSidebarOpen(false)}
//         />
//       )}

//       {/* Product List */}
//       <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6 px-4">
//         {filteredProducts.length > 0 ? (
//           filteredProducts.map((product) => (
//             <ProductCard
//               key={product.product_id}
//               product={{
//                 id: product.product_id,
//                 name: product.name,
//                 brand: product.brand,
//                 price: product.price,
//                 ratings: product.ratings,
//                 main_image: product.main_image || "/default.jpg",
//               }}
//               onLike={(id, liked) => console.log("Like toggled", id, liked)}
//               onAddToCart={(id) => console.log("Added to Cart", id)}
//             />
//           ))
//         ) : (
//           <p className="text-center text-gray-600 w-full col-span-4">
//             No products available
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Shop;









// import React, { useState, useEffect } from "react";
// import ShopSidebar from "../components/shopSidebar";
// import ProductCard from "../components/productCard";
// import axios from "axios";
// import { useSelector } from "react-redux";
// import { motion } from "framer-motion";
// import { FiShoppingCart, FiTrash2 } from "react-icons/fi";
// import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";

// const Shop = () => {
//   const authToken = useSelector((state) => state.auth.access_token);

//   const [categories, setCategories] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [cart, setCart] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [isCartOpen, setIsCartOpen] = useState(false);

//   // Fetch initial data (categories, products, and cart)
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch categories
//         const categoriesResponse = await axios.get(
//           "http://localhost:5004/categories/",
//           { headers: { Authorization: `Bearer ${authToken}` } }
//         );
//         setCategories(categoriesResponse.data.categories || []);

//         // Fetch products
//         const productsResponse = await axios.get(
//           "http://localhost:5004/products/customer/products",
//           { headers: { Authorization: `Bearer ${authToken}` } }
//         );
//         const productsData = productsResponse.data.products || [];
//         setProducts(productsData);
//         setFilteredProducts(productsData);

//         // Fetch cart
//         const cartResponse = await axios.get("http://localhost:5007/carts", {
//           headers: { Authorization: `Bearer ${authToken}` },
//         });
//         setCart(cartResponse.data.cart || []);
//       } catch (err) {
//         setError(err.message || "Failed to fetch data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (authToken) fetchData();
//   }, [authToken]);

//   // Filter products based on selected categories
//   const filterProducts = (selectedCategories) => {
//     if (selectedCategories.length > 0) {
//       setFilteredProducts(
//         products.filter((p) =>
//           selectedCategories.includes(p.Category?.name || p.categoryName)
//         )
//       );
//     } else {
//       setFilteredProducts(products);
//     }
//   };

//   // Add item to cart
//   const addToCart = async (productId) => {
//     try {
//       const response = await axios.post(
//         "http://localhost:5007/cart-items",
//         { product_id: productId, quantity: 1 },
//         { headers: { Authorization: `Bearer ${authToken}` } }
//       );
//       setCart(response.data.cart || []);
//     } catch (err) {
//       console.error("Failed to add to cart:", err);
//     }
//   };

//   // Remove item from cart
//   const removeFromCart = async (productId) => {
//     try {
//       await axios.delete(`http://localhost:5007/carts/remove/${productId}`, {
//         headers: { Authorization: `Bearer ${authToken}` },
//       });
//       setCart((prevCart) => prevCart.filter((item) => item.product_id !== productId));
//     } catch (err) {
//       console.error("Failed to remove from cart:", err);
//     }
//   };

//   // Update item quantity in cart
//   const updateQuantity = async (productId, newQuantity) => {
//     if (newQuantity < 1) return;
//     try {
//       const response = await axios.put(
//         "http://localhost:5007/cart-items/${productId}",
//         { product_id: productId, quantity: newQuantity },
//         { headers: { Authorization: `Bearer ${authToken}` } }
//       );
//       setCart(response.data.cart || []);
//     } catch (err) {
//       console.error("Failed to update quantity:", err);
//     }
//   };

//   // Calculate cart total
//   const calculateTotal = () => {
//     return cart
//       .reduce((total, item) => total + (item.price || 0) * (item.quantity || 0), 0)
//       .toFixed(2);
//   };

//   return (
//     <div className="relative mt-20 mb-20">
//       {/* Loader */}
//       {loading && (
//         <div className="absolute inset-0 bg-white bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50">
//           <motion.div
//             className="w-14 h-14 border-4 border-t-yellow-400 border-gray-300 rounded-full animate-spin"
//             initial={{ rotate: 0 }}
//             animate={{ rotate: 360 }}
//             transition={{ repeat: Infinity, duration: 1 }}
//           />
//         </div>
//       )}

//       {/* Cart Toggle Button */}
//       <button
//         className="p-2 fixed top-4 right-4 bg-gray-800 text-white rounded-md z-50"
//         onClick={() => setIsCartOpen(true)}
//       >
//         <FiShoppingCart className="h-6 w-6" />
//         {cart.length > 0 && (
//           <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
//             {cart.length}
//           </span>
//         )}
//       </button>

//       {/* Open Sidebar Button */}
//       <button
//         className="p-2 fixed top-4 left-4 bg-gray-800 text-white rounded-md z-50"
//         onClick={() => setIsSidebarOpen(true)}
//       >
//         Open Filters
//       </button>

//       {/* Filter Sidebar */}
//       <div
//         className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white border-r border-gray-700 transition-transform duration-300 ease-in-out transform ${
//           isSidebarOpen ? "translate-x-0" : "-translate-x-full"
//         } z-50`}
//       >
//         <ShopSidebar
//           categories={categories.map((cat) => ({
//             id: cat.category_id,
//             name: cat.name,
//           }))}
//           onFilterChange={filterProducts}
//           closeSidebar={() => setIsSidebarOpen(false)}
//         />
//       </div>

//       {/* Filter Sidebar Overlay */}
//       {isSidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black opacity-50 z-40"
//           onClick={() => setIsSidebarOpen(false)}
//         />
//       )}

//       {/* Product List */}
//       <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6 px-4">
//         {filteredProducts.length > 0 ? (
//           filteredProducts.map((product) => (
//             <ProductCard
//               key={product.product_id}
//               product={{
//                 id: product.product_id,
//                 name: product.name,
//                 brand: product.brand,
//                 price: product.price,
//                 ratings: product.ratings,
//                 main_image: product.main_image || "/default.jpg",
//               }}
//               onLike={(id, liked) => console.log("Like toggled", id, liked)}
//               onAddToCart={() => addToCart(product.product_id)}
//             />
//           ))
//         ) : (
//           <p className="text-center text-gray-600 w-full col-span-4">
//             No products available
//           </p>
//         )}
//       </div>

//       {/* Cart Sidebar */}
//       {isCartOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
//           <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl p-6 overflow-y-auto">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-2xl font-bold">Shopping Cart</h2>
//               <button
//                 onClick={() => setIsCartOpen(false)}
//                 className="text-gray-500 hover:text-gray-700 text-2xl"
//               >
//                 ×
//               </button>
//             </div>

//             {cart.length === 0 ? (
//               <p className="text-gray-500 text-center py-8">Your cart is empty</p>
//             ) : (
//               <>
//                 {cart.map((item) => (
//                   <div key={item.product_id} className="flex items-center py-4 border-b">
//                     <img
//                       src={item.main_image || "/default.jpg"}
//                       alt={item.name}
//                       className="w-20 h-20 object-cover rounded"
//                     />
//                     <div className="ml-4 flex-1">
//                       <h3 className="text-lg font-medium">{item.name}</h3>
//                       <p className="text-gray-600">${item.price}</p>
//                       <div className="flex items-center mt-2">
//                         <button
//                           onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
//                           className="p-1 rounded-md hover:bg-gray-100"
//                         >
//                           <AiOutlineMinus />
//                         </button>
//                         <span className="mx-2">{item.quantity}</span>
//                         <button
//                           onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
//                           className="p-1 rounded-md hover:bg-gray-100"
//                         >
//                           <AiOutlinePlus />
//                         </button>
//                       </div>
//                     </div>
//                     <button
//                       onClick={() => removeFromCart(item.product_id)}
//                       className="p-2 text-red-500 hover:text-red-700"
//                     >
//                       <FiTrash2 />
//                     </button>
//                   </div>
//                 ))}
//                 <div className="mt-6 border-t pt-4">
//                   <div className="flex justify-between text-lg font-semibold">
//                     <span>Total:</span>
//                     <span>${calculateTotal()}</span>
//                   </div>
//                   <button className="mt-4 w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition duration-200">
//                     Proceed to Checkout
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Shop;







import React, { useState, useEffect } from "react";
import ShopSidebar from "../components/shopSidebar";
import ProductCard from "../components/productCard";
import axios from "axios";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FiShoppingCart, FiTrash2 } from "react-icons/fi";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";

const Shop = () => {
  const authToken = useSelector((state) => state.auth.access_token);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Fetch initial data (categories, products, and cart)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await axios.get(
          "http://localhost:5004/categories/",
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        setCategories(categoriesResponse.data.categories || []);

        // Fetch products
        const productsResponse = await axios.get(
          "http://localhost:5004/products/customer/products",
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        const productsData = productsResponse.data.products || [];
        setProducts(productsData);
        setFilteredProducts(productsData);

        // Fetch cart
        const cartResponse = await axios.get("http://localhost:5007/carts", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setCart(cartResponse.data.cart || []);
      } catch (err) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    if (authToken) fetchData();
  }, [authToken]);

  // Filter products based on selected categories
  const filterProducts = (selectedCategories) => {
    if (selectedCategories.length > 0) {
      setFilteredProducts(
        products.filter((p) =>
          selectedCategories.includes(p.Category?.name || p.categoryName)
        )
      );
    } else {
      setFilteredProducts(products);
    }
  };

  // Add item to cart
  const addToCart = async (productId) => {
    try {
      const response = await axios.post(
        "http://localhost:5007/cart-items",
        { product_id: productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setCart(response.data.cart || []);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`http://localhost:5007/cart-items/${productId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setCart((prevCart) => prevCart.filter((item) => item.product_id !== productId));
    } catch (err) {
      console.error("Failed to remove from cart:", err);
    }
  };

  // Update item quantity in cart
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const response = await axios.put(
        "http://localhost:5007/cart-items/${productId}",
        { product_id: productId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setCart(response.data.cart || []);
    } catch (err) {
      console.error("Failed to update quantity:", err);
    }
  };

  // Calculate cart total
  const calculateTotal = () => {
    return cart
      .reduce((total, item) => total + (item.price || 0) * (item.quantity || 0), 0)
      .toFixed(2);
  };

  return (
    <div className="relative mt-20 mb-20">
      {/* Loader */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50">
          <motion.div
            className="w-14 h-14 border-4 border-t-yellow-400 border-gray-300 rounded-full animate-spin"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        </div>
      )}

      {/* Cart Toggle Button */}
      <button
        className="p-2 fixed top-4 right-4 bg-gray-800 text-white rounded-md z-50"
        onClick={() => setIsCartOpen(true)}
      >
        <FiShoppingCart className="h-6 w-6" />
        {cart.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {cart.length}
          </span>
        )}
      </button>

      {/* Open Sidebar Button */}
      <button
        className="p-2 fixed top-4 left-4 bg-gray-800 text-white rounded-md z-50"
        onClick={() => setIsSidebarOpen(true)}
      >
        Open Filters
      </button>

      {/* Filter Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white border-r border-gray-700 transition-transform duration-300 ease-in-out transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } z-50`}
      >
        <ShopSidebar
          categories={categories.map((cat) => ({
            id: cat.category_id,
            name: cat.name,
          }))}
          onFilterChange={filterProducts}
          closeSidebar={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Filter Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Product List */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6 px-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.product_id}
              product={{
                id: product.product_id,
                name: product.name,
                brand: product.brand,
                price: product.price,
                ratings: product.ratings,
                main_image: product.main_image || "/default.jpg",
              }}
              onLike={(id, liked) => console.log("Like toggled", id, liked)}
              onAddToCart={() => addToCart(product.product_id)}
            />
          ))
        ) : (
          <p className="text-center text-gray-600 w-full col-span-4">
            No products available
          </p>
        )}
      </div>

      {/* Cart Sidebar (without background overlay) */}
      {isCartOpen && (
        <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl p-6 overflow-y-auto z-50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Shopping Cart</h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Your cart is empty</p>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.product_id} className="flex items-center py-4 border-b">
                  <img
                    src={item.main_image || "/default.jpg"}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium">{item.name}</h3>
                    <p className="text-gray-600">${item.price}</p>
                    <div className="flex items-center mt-2">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="p-1 rounded-md hover:bg-gray-100"
                      >
                        <AiOutlineMinus />
                      </button>
                      <span className="mx-2">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="p-1 rounded-md hover:bg-gray-100"
                      >
                        <AiOutlinePlus />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
              <div className="mt-6 border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>${calculateTotal()}</span>
                </div>
                <button className="mt-4 w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition duration-200">
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Shop;