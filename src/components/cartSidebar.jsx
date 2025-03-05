import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your Publishable Key
const stripePromise = loadStripe('pk_test_51QwgmpSC0yoSUpha40niA9BO3Q6XnB6CSUDaaifwURXXszTKvfTBEu1SLsD2D1mdaJt5z72nX7tSpOBN5XAddPWh00mAOwPdsb');

const CartSidebar = ({ closeSidebar }) => {
  const [cartProducts, setCartProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authToken = useSelector((state) => state.auth.access_token);
  const cartId = sessionStorage.getItem("cart_id");

  // State for shipping details
  const [shippingDetails, setShippingDetails] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!authToken || !cartId) {
        setError("Please log in and ensure a cart exists.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const cartResponse = await axios.get(`http://localhost:5007/cart-items/${cartId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const cartItemsData = cartResponse.data.cartItems;
        if (!cartItemsData || cartItemsData.length === 0) {
          setCartProducts([]);
          setLoading(false);
          return;
        }

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
        if (error.response) {
          setError(`Failed to fetch cart: ${error.response.status} - ${error.response.data.message}`);
        } else if (error.request) {
          setError("Network error: Could not reach the server.");
        } else {
          setError("Unexpected error while fetching cart.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [authToken, cartId]);

  const totalPrice = cartProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleDeleteItem = async (cartItemId) => {
    if (!authToken) {
      setError("Please log in to delete items.");
      return;
    }

    try {
      await axios.delete(`http://localhost:5007/cart-items/${cartItemId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setCartProducts((prev) => prev.filter((item) => item.cart_item_id !== cartItemId));
      setError(null);
    } catch (error) {
      console.error("Error deleting cart item:", error);
      setError("Failed to delete item. Please try again.");
    }
  };

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return; // Prevent setting quantity below 1

    try {
      await axios.put(
        `http://localhost:5007/cart-items/${cartItemId}`,
        { quantity: newQuantity },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      // Update the quantity in the cart state
      setCartProducts((prev) =>
        prev.map((item) =>
          item.cart_item_id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
      setError(null);
    } catch (error) {
      console.error("Error updating quantity:", error);
      setError("Failed to update quantity. Please try again.");
    }
  };

  // Handle input changes for shipping details
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateShippingDetails = () => {
    const { street, city, state, country, pincode } = shippingDetails;
    if (!street || !city || !state || !country || !pincode) {
      setError("Please fill in all shipping details.");
      return false;
    }
    return true;
  };

  const handleCheckout = async () => {
    if (!authToken) {
      setError("Please log in to proceed with checkout.");
      return;
    }
    if (cartProducts.length === 0) {
      setError("Your cart is empty.");
      return;
    }
  
    // Validate shipping details
    if (!validateShippingDetails()) {
      return;
    }
  
    let userId, email;
    try {
      const decoded = jwtDecode(authToken);
      userId = decoded.user_id;
      email = decoded.email;
      if (!userId) {
        setError("Token missing user ID. Please log in again.");
        return;
      }
    } catch (decodeError) {
      setError("Invalid token. Please log in again.");
      return;
    }
  
    const orderData = {
      totalAmount: totalPrice,
      userId: userId,
      email: email || 'customer@example.com',
      shippingDetails: shippingDetails,
      items: cartProducts.map((item) => ({
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    };
  
    try {
      setError(null);
      setLoading(true);
  
      // Step 1: Send shipping details to a dummy API
      await axios.post("https://jsonplaceholder.typicode.com/posts", {
        title: "Shipping Details",
        body: JSON.stringify(shippingDetails),
        userId: userId,
      });
  
      // Step 2: Proceed with the checkout process
      const response = await axios.post(
        "http://localhost:5009/api/payment/create-checkout-session",
        orderData,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
  
      const stripe = await stripePromise;
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: response.data.id,
      });
  
      if (stripeError) {
        throw new Error(stripeError.message);
      }
  
      // Step 3: If payment is successful, delete cart items
      await axios.delete(`http://localhost:5007/carts`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
  
      setCartProducts([]); // Clear the cart in UI
    } catch (error) {
      setError("Unexpected error during checkout: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-xl z-50 p-5 overflow-y-auto">
      <button className="absolute top-3 right-3 text-gray-600 hover:text-gray-800" onClick={closeSidebar}>
        ✖
      </button>
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantityChange(item.cart_item_id, item.quantity - 1)}
                    className="text-gray-500 hover:text-gray-700"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="text-sm text-gray-600">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.cart_item_id, item.quantity + 1)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  Total: ₹ {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
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
      {cartProducts.length > 0 && !loading && (
        <>
          <div className="mt-6 p-4 bg-gray-200 rounded-lg">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Price:</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
          </div>
          {/* Shipping Details Form */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Shipping Details</h3>
            <div className="space-y-4">
              <input
                type="text"
                name="street"
                value={shippingDetails.street}
                onChange={handleInputChange}
                placeholder="Street"
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
        </>
      )}
      {cartProducts.length > 0 && (
        <button
          className={`mt-4 w-full bg-black text-white py-3 rounded-lg text-lg font-semibold hover:bg-gray-800 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Proceed to Checkout'}
        </button>
      )}
    </div>
  );
};

export default CartSidebar;
