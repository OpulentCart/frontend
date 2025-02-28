import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const CartSidebar = ({ closeSidebar }) => {
  const [cartProducts, setCartProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const authToken = useSelector((state) => state.auth.access_token);
  const cartId = sessionStorage.getItem("cart_id");

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!authToken || !cartId) return;

      try {
        setLoading(true);

        const cartResponse = await axios.get(`http://localhost:5007/cart-items/${cartId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const cartItemsData = cartResponse.data.cartItems;

        const productRequests = cartItemsData.map(async (item) => {
          const productRes = await axios.get(`http://localhost:5004/products/${item.product_id}`, {
            headers: { Authorization: `Bearer ${authToken}` },
          });

          return {
            cart_item_id: item.cart_item_id,
            product_id: item.product_id,
            quantity: item.quantity,
            name: productRes.data.product.name,
            brand: productRes.data.product.brand,
            price: productRes.data.product.price,
            image: productRes.data.product.main_image,
          };
        });

        const detailedCartItems = await Promise.all(productRequests);
        setCartProducts(detailedCartItems);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [authToken, cartId]);

  // ✅ Calculate total price
  const totalPrice = cartProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ✅ Function to delete a cart item
  const handleDeleteItem = async (cartItemId) => {
    try {
      await axios.delete(`http://localhost:5007/cart-items/${cartItemId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // Update the cart after deletion
      setCartProducts((prev) => prev.filter((item) => item.cart_item_id !== cartItemId));
    } catch (error) {
      console.error("Error deleting cart item:", error);
    }
  };

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-xl z-50 p-5 overflow-y-auto">
      {/* Close Button */}
      <button className="absolute top-3 right-3 text-gray-600 hover:text-gray-800" onClick={closeSidebar}>
        ✖
      </button>

      {/* Header */}
      <h2 className="text-xl font-semibold mb-6 text-gray-900">Your Cart</h2>

      {/* Loader */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
        </div>
      ) : cartProducts.length > 0 ? (
        <div className="space-y-4">
          {cartProducts.map((item) => (
            <div key={item.cart_item_id} className="flex items-center gap-4 p-3 bg-gray-100 rounded-lg relative">
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 truncate w-52">{item.name}</p>
                <p className="text-sm text-gray-500">Brand: {item.brand}</p>
                <p className="text-sm text-gray-700 font-semibold">₹ {item.price.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                <p className="text-sm font-semibold text-gray-800">
                  Total: ₹ {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
              {/* Delete Button */}
              <button
                className="text-red-500 hover:text-red-700 absolute top-2 right-2"
                onClick={() => handleDeleteItem(item.cart_item_id)}
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">Your cart is empty.</p>
      )}

      {/* Total Price Section */}
      {cartProducts.length > 0 && !loading && (
        <div className="mt-6 p-4 bg-gray-200 rounded-lg">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total Price:</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Checkout Button */}
      {cartProducts.length > 0 && !loading && (
        <button className="mt-4 w-full bg-black text-white py-3 rounded-lg text-lg font-semibold hover:bg-gray-800 transition">
          Proceed to Checkout
        </button>
      )}
    </div>
  );
};

export default CartSidebar;
