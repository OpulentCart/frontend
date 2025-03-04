import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useSelector } from "react-redux";
import {loadStripe} from '@stripe/stripe-js'

const CartSidebar = ({ closeSidebar }) => {
  const [cartProducts, setCartProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const authToken = useSelector((state) => state.auth.access_token);
  console.log("Fetched Auth Token:", authToken);
  const cartId = sessionStorage.getItem("cart_id");
  const stripePromise = loadStripe('pk_test_51QwgmpSC0yoSUpha40niA9BO3Q6XnB6CSUDaaifwURXXszTKvfTBEu1SLsD2D1mdaJt5z72nX7tSpOBN5XAddPWh00mAOwPdsb');

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

  // ✅ Function to update cart item quantity
  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return; // Prevent quantity from going below 1

    try {
      await axios.put(
        `http://localhost:5007/cart-items/${cartItemId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      // Update UI instantly
      setCartProducts((prev) =>
        prev.map((item) =>
          item.cart_item_id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
    }
  };

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

  // ✅ Function to handle checkout
  const handleCheckout = async () => {
    if (!authToken || cartProducts.length === 0) return;
  
    let userId, email;
  
    try {
      console.log("Raw authToken:", authToken);
      const decoded = jwtDecode(authToken);
      console.log("Decoded Token:", decoded);
      userId = decoded.user_id; // Extract user ID from token
      email = decoded.email || "customer@example.com"; // Fallback email
  
      if (!userId) {
        console.log("No user_id found in token!");
        alert("Token missing user ID. Please log in again.");
        return;
      }
    } catch (decodeError) {
      alert("Invalid token. Please log in again.");
      console.error("Token decode error:", decodeError);
      return;
    }
  
    const orderData = {
      totalAmount: totalPrice,
      userId,
      email,
      items: cartProducts.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    };
  
    try {
      console.log("Order Data with userId and email:", orderData);
      const response = await axios.post(
        "http://localhost:5009/api/payment/create-checkout-session",
        orderData,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
  
      console.log("Checkout Response:", response.data);
  
      // Use Stripe to redirect to checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to load");
      }
  
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: response.data.id,
      });
  
      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      if (error.response) {
        alert(`Checkout failed: ${error.response.status} - ${error.response.data.message}`);
      } else if (error.request) {
        alert("Network error: Could not reach payment server.");
      } else {
        alert(`Unexpected error during checkout: ${error.message}`);
      }
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

                {/* Quantity Update Section */}
                <div className="flex items-center space-x-2 mt-1">
                  <button
                    className="px-2 py-1 bg-gray-300 rounded-md hover:bg-gray-400"
                    onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <p className="text-sm font-medium">{item.quantity}</p>
                  <button
                    className="px-2 py-1 bg-gray-300 rounded-md hover:bg-gray-400"
                    onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

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
        <button
          className="mt-4 w-full bg-black text-white py-3 rounded-lg text-lg font-semibold hover:bg-gray-800 transition"
          onClick={handleCheckout}
        >
          Proceed to Checkout
        </button>
      )}
    </div>
  );
};

export default CartSidebar;
