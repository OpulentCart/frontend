import { useState, useEffect } from "react";
import { FiShoppingCart, FiTrash2, FiHeart } from "react-icons/fi";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";

const CartSidebar = () => {
    const [cart, setCart] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
  
    useEffect(() => {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) setCart(JSON.parse(savedCart));
    }, []);
  
    useEffect(() => {
      localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);
  
    const addToCart = (product) => {
      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.id === product.id);
        if (existingItem) {
          return prevCart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prevCart, { ...product, quantity: 1 }];
      });
    };
  
    const removeFromCart = (productId) => {
      setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    };
  
    const updateQuantity = (productId, newQuantity) => {
      if (newQuantity < 1) return;
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    };
  
    const toggleWishlist = (productId) => {
      setWishlist((prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId]
      );
    };
  
    const calculateTotal = () => {
      return cart
        .reduce((total, item) => total + item.price * item.quantity, 0)
        .toFixed(2);
    };
  
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Shop Products</h1>
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative p-2 text-gray-600 hover:text-gray-900"
            >
              <FiShoppingCart className="h-6 w-6" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-200 hover:scale-105"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {product.name}
                    </h2>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`p-1 rounded-full ${
                        wishlist.includes(product.id)
                          ? "text-red-500"
                          : "text-gray-400"
                      }`}
                    >
                      <FiHeart className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{product.description}</p>
                  <p className="mt-2 text-xl font-bold text-gray-900">
                    ${product.price}
                  </p>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className={`mt-4 w-full py-2 px-4 rounded-md ${
                      product.stock > 0
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-300 cursor-not-allowed text-gray-500"
                    }`}
                  >
                    {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                  </button>
                </div>
              </div>
            ))}
          </div>
  
          {isCartOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
              <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Shopping Cart</h2>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
  
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Your cart is empty
                  </p>
                ) : (
                  <>
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center py-4 border-b"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="ml-4 flex-1">
                          <h3 className="text-lg font-medium">{item.name}</h3>
                          <p className="text-gray-600">${item.price}</p>
                          <div className="flex items-center mt-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="p-1 rounded-md hover:bg-gray-100"
                            >
                              <AiOutlineMinus />
                            </button>
                            <span className="mx-2">{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="p-1 rounded-md hover:bg-gray-100"
                            >
                              <AiOutlinePlus />
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
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
            </div>
          )}
        </div>
      </div>
    );
  };
  
export default CartSidebar;