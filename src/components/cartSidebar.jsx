import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_51QwgmpSC0yoSUpha40niA9BO3Q6XnB6CSUDaaifwURXXszTKvfTBEu1SLsD2D1mdaJt5z72nX7tSpOBN5XAddPWh00mAOwPdsb");

const CartSidebar = ({ closeSidebar }) => {
  const [cartProducts, setCartProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const authToken = useSelector((state) => state.auth.access_token);
  const cartId = sessionStorage.getItem("cart_id");

  useEffect(() => {
    fetchCartItems();
  }, [authToken, cartId]);

  const fetchCartItems = async () => {
    if (!authToken || !cartId) {
      setError("Please log in and ensure a cart exists.");
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.get(`http://localhost:5007/cart-items/${cartId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!data.cartItems?.length) {
        setCartProducts([]);
        return;
      }

      // Fetch product details
      const detailedCartItems = await Promise.all(
        data.cartItems.map(async (item) => {
          try {
            const productRes = await axios.get(`http://localhost:5004/products/${item.product_id}`, {
              headers: { Authorization: `Bearer ${authToken}` },
            });
            console.log("Product Data:", productRes.data.product); // Debugging
            return { ...item, ...productRes.data.product };
          } catch (err) {
            console.error("Error fetching product:", err);
            return item; // Return without additional product data
          }
        })
      );

      setCartProducts(detailedCartItems);
    } catch (error) {
      setError("Error fetching cart items. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await axios.patch(`http://localhost:5007/cart-items/${cartItemId}`, { quantity: newQuantity }, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      fetchCartItems(); // Refetch cart items instead of manually updating state
    } catch (error) {
      setError("Failed to update quantity. Please try again.");
      console.error(error);
    }
  };

  const handleDeleteItem = async (cartItemId) => {
    try {
      await axios.delete(`http://localhost:5007/cart-items/${cartItemId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      fetchCartItems();
    } catch (error) {
      setError("Failed to delete item. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-xl z-50 p-5 overflow-y-auto">
      <button className="absolute top-3 right-3 text-gray-600 hover:text-gray-800" onClick={closeSidebar}>✖</button>
      <h2 className="text-xl font-semibold mb-6 text-gray-900">Your Cart</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
        </div>
      ) : cartProducts.length > 0 ? (
        <div className="space-y-4">
          {cartProducts.map((item) => (
            <div key={item.cart_item_id} className="flex items-center gap-4 p-3 bg-gray-100 rounded-lg relative">
              <img src={item.main_image} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 truncate w-52">{item.name}</p>
                <p className="text-sm text-gray-500">Brand: {item.brand}</p>
                <p className="text-sm text-gray-700 font-semibold">₹ {item.price?.toFixed(2) || "N/A"}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity - 1)} disabled={item.quantity <= 1} className="px-2 py-1 bg-gray-300 rounded">-</button>
                  <p className="text-sm text-gray-600">{item.quantity}</p>
                  <button onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity + 1)} className="px-2 py-1 bg-gray-300 rounded">+</button>
                </div>
                <p className="text-sm font-semibold text-gray-800">Total: ₹ {(item.price * item.quantity)?.toFixed(2) || "N/A"}</p>
              </div>
              <button className="text-red-500 hover:text-red-700 absolute top-2 right-2" onClick={() => handleDeleteItem(item.cart_item_id)}>🗑</button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">Your cart is empty.</p>
      )}
    </div>
  );
};

export default CartSidebar;
