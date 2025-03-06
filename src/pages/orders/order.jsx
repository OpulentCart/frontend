import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import showToast from "../../components/showToast";
import { Link } from "react-router-dom";

const OrderPage = () => {
  const authToken = useSelector((state) => state.auth.access_token);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});
  const [buttonLoading, setButtonLoading] = useState(null);

  const steps = ["Pending", "Shipped", "Delivered"];

  useEffect(() => {
    if (!authToken) return;

    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://13.60.181.56:5006/orders/", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setOrders(response.data.orders);
        showToast({ label: "Orders loaded successfully!", type: "success" });
      } catch (err) {
        setError("Failed to fetch orders. Please try again later.");
        showToast({ label: "Error fetching orders", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [authToken]);

  const openModal = async (orderId) => {
    setButtonLoading(orderId);
    if (orderDetails[orderId]) {
      setSelectedOrder(orderId);
      setButtonLoading(null);
      return;
    }

    try {
      const response = await axios.get(`http://13.60.181.56:5006/orders/${orderId}/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      let items = response.data.order_items;
      if (!Array.isArray(items)) {
        items = [items];
      }

      const productDetails = await Promise.all(
        items.map(async (item) => {
          try {
            const productRes = await axios.get(`http://13.60.181.56:5004/products/${item.product_id}`, {
              headers: { Authorization: `Bearer ${authToken}` },
            });

            return { ...item, product: productRes.data.product };
          } catch (err) {
            return { ...item, product: null };
          }
        })
      );

      setOrderDetails((prev) => ({ ...prev, [orderId]: productDetails }));
      setSelectedOrder(orderId);
    } catch (err) {
      showToast({ label: "Error fetching order details", type: "error" });
    } finally {
      setButtonLoading(null);
    }
  };

  const closeModal = () => setSelectedOrder(null);

  const getStatusStep = (orderId) => {
    if (!orderDetails[orderId] || orderDetails[orderId].length === 0) return 0;

    // Extract status from the first order item
    const orderItemStatus = orderDetails[orderId][0]?.status || "Pending";

    // Find the step index based on the order item status
    return steps.indexOf(orderItemStatus) !== -1 ? steps.indexOf(orderItemStatus) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 mt-15">
      <h1 className="text-4xl font-bold text-center mb-6">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-10">
          <p className="text-lg text-gray-600 mb-4">No orders placed yet.</p>
          <Link to="/shop" className="px-6 py-3 bg-green-500 text-white rounded-md font-semibold hover:bg-green-600 transition">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div key={order.order_id} className="bg-white shadow-md rounded-lg p-5 border border-gray-200">
              <p className="text-lg font-semibold">Order #{order.order_id}</p>
              <p className="text-sm text-gray-500">Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p className={`font-medium ${order.status === "Delivered" ? "text-green-600" : "text-yellow-600"}`}>
                Status: {order.status}
              </p>
              <p className="text-xl font-bold text-green-600">Total: ₹{order.total_amount}</p>

              {/* Order Tracking */}
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Order Tracking</h3>
                <div className="relative flex justify-between items-center mt-4">
                  <div className="absolute top-1/2 left-0 w-full h-[3px] bg-gray-300 -translate-y-1/2"></div>
                  <div
                    className="absolute top-1/2 left-0 h-[3px] bg-green-500 transition-all duration-500"
                    style={{
                      width: `${(getStatusStep(order.order_id) / (steps.length - 1)) * 100 || 5}%`,
                    }}
                  ></div>
                  {steps.map((step, index) => (
                    <div key={step} className="relative flex flex-col items-center w-1/3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                          ${index <= getStatusStep(order.order_id) ? "bg-green-600 border-green-600 text-white" : "bg-gray-300 border-gray-300"}
                        `}
                      />
                      <p className="text-sm mt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* View Details Button */}
              <button
                onClick={() => openModal(order.order_id)}
                className="mt-4 px-4 py-2 w-full bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition flex items-center justify-center"
                disabled={buttonLoading === order.order_id}
              >
                {buttonLoading === order.order_id ? (
                  <div className="animate-spin h-5 w-5 border-t-2 border-white border-solid rounded-full"></div>
                ) : (
                  "View Details"
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Order Details */}
      {selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Order Details</h2>
            {orderDetails[selectedOrder]?.length > 0 ? (
              orderDetails[selectedOrder].map((item) => (
                <div key={item.product_id} className="flex items-center gap-4 p-3 border-b border-gray-300">
                   {item.product?.main_image ? (
                    <img
                      src={item.product.main_image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                      No Image
                    </div>
                  )}
                  <p className="text-gray-800 font-medium">{item.product?.name || "Product not available"}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No items found in this order.</p>
            )}
            <button onClick={closeModal} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPage;
