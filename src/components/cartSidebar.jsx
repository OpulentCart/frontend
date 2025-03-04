import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_51QwgmpSC0yoSUpha40niA9BO3Q6XnB6CSUDaaifwURXXszTKvfTBEu1SLsD2D1mdaJt5z72nX7tSpOBN5XAddPWh00mAOwPdsb");

const CartSidebar = ({ closeSidebar }) => {
  const [cartProducts, setCartProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const authToken = useSelector((state) => state.auth.access_token);
  const cartId = sessionStorage.getItem("cart_id");
  
  const [shippingDetails, setShippingDetails] = useState({
    streetAddress: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });

  useEffect(() => {
    if (!authToken || !cartId) {
      setError("Please log in and ensure a cart exists.");
      return;
    }
    
    const fetchCartItems = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`http://localhost:5007/cart-items/${cartId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (!data.cartItems?.length) {
          setCartProducts([]);
        } else {
          const detailedCartItems = await Promise.all(
            data.cartItems.map(async (item) => {
              const productRes = await axios.get(`http://localhost:5004/products/${item.product_id}`, {
                headers: { Authorization: `Bearer ${authToken}` },
              });
              return { ...item, ...productRes.data.product };
            })
          );
          setCartProducts(detailedCartItems);
        }
      } catch (error) {
        setError("Error fetching cart items. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [authToken, cartId]);

  const handleDeleteItem = async (cartItemId) => {
    try {
      await axios.delete(`http://localhost:5007/cart-items/${cartItemId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setCartProducts((prev) => prev.filter((item) => item.cart_item_id !== cartItemId));
    } catch {
      setError("Failed to delete item. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    setShippingDetails((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckout = async () => {
    if (!authToken || !cartProducts.length || Object.values(shippingDetails).some((val) => !val)) {
      setError("Please log in, add items to your cart, and complete shipping details.");
      return;
    }
    try {
      setLoading(true);
      const decoded = jwtDecode(authToken);
      const { user_id: userId, email } = decoded;
      
      const orderData = {
        totalAmount: cartProducts.reduce((sum, item) => sum + item.price * item.quantity, 0),
        userId,
        email: email || "customer@example.com",
        shippingDetails,
        items: cartProducts.map(({ product_id, name, quantity, price }) => ({
          product_id, // Include product_id
          name,
          quantity,
          price,
        })),
      };
  
      console.log("Order Data being sent:", orderData); // Debugging log
  
      const response = await axios.post("http://localhost:5009/api/payment/create-checkout-session", orderData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
  
      console.log("Stripe Checkout Session Response:", response.data); // Debugging log
  
      const stripe = await stripePromise;
      if (stripe) await stripe.redirectToCheckout({ sessionId: response.data.id });
    } catch (error) {
      console.error("Checkout Error:", error); // Debugging log
      setError("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
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
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 truncate w-52">{item.name}</p>
                <p className="text-sm text-gray-500">Brand: {item.brand}</p>
                <p className="text-sm text-gray-700 font-semibold">₹ {item.price.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                <p className="text-sm font-semibold text-gray-800">Total: ₹ {(item.price * item.quantity).toFixed(2)}</p>
              </div>
              <button className="text-red-500 hover:text-red-700 absolute top-2 right-2" onClick={() => handleDeleteItem(item.cart_item_id)}>🗑</button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">Your cart is empty.</p>
      )}
      {cartProducts.length > 0 && (
        <>
        {/* Shipping Details Form */}
<div className="mt-6">
  <h3 className="text-lg font-semibold mb-4 text-gray-900">Shipping Details</h3>
  <div className="space-y-4">
    <input
      type="text"
      name="streetAddress"
      value={shippingDetails.streetAddress}
      onChange={handleInputChange}
      placeholder="Street Address"
      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
      required
    />
    <input
      type="text"
      name="city"
      value={shippingDetails.city}
      onChange={handleInputChange}
      placeholder="City"
      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
      required
    />
    <input
      type="text"
      name="state"
      value={shippingDetails.state}
      onChange={handleInputChange}
      placeholder="State"
      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
      required
    />
    <input
      type="text"
      name="country"
      value={shippingDetails.country}
      onChange={handleInputChange}
      placeholder="Country"
      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
      required
    />
    <input
      type="text"
      name="pincode"
      value={shippingDetails.pincode}
      onChange={handleInputChange}
      placeholder="Pincode"
      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
      required
    />
  </div>
</div>

          <div className="mt-6 p-4 bg-gray-200 rounded-lg flex justify-between text-lg font-semibold">
            <span>Total Price:</span>
            <span>₹{cartProducts.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
          </div>
          <button className="mt-4 w-full bg-black text-white py-3 rounded-lg text-lg font-semibold hover:bg-gray-800 transition" onClick={handleCheckout} disabled={loading}>
            {loading ? "Processing..." : "Proceed to Checkout"}
          </button>
        </>
      )}
    </div>
  );
};

export default CartSidebar;
