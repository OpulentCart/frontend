import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import showToast from "../../components/showToast";

const OrderPage = () => {
  const authToken = useSelector((state) => state.auth.access_token);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});

  useEffect(() => {
    if (!authToken) return;

    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:5006/orders/", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setOrders(response.data.orders);
        showToast({ label: "Here are your recent orders!", type: "success" });
      } catch (err) {
        setError("Oops! Failed to fetch your orders.");
        showToast({ label: "Error fetching your orders", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [authToken]);

  const toggleExpand = async (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }

    if (orderDetails[orderId]) {
      setExpandedOrderId(orderId);
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5006/orders/${orderId}/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      let items = response.data.order_items;
      if (!Array.isArray(items)) {
        items = [items];
      }

      const productDetailsPromises = items.map(async (item) => {
        try {
          const productRes = await axios.get(`http://localhost:5004/products/${item.product_id}`, {
            headers: { Authorization: `Bearer ${authToken}` },
          });

          return {
            ...item,
            product: productRes.data.product,
          };
        } catch (err) {
          return { ...item, product: null };
        }
      });

      const itemsWithDetails = await Promise.all(productDetailsPromises);
      setOrderDetails((prev) => ({ ...prev, [orderId]: itemsWithDetails }));
      setExpandedOrderId(orderId);
    } catch (err) {
      showToast({ label: "Failed to fetch order details", type: "error" });
    }
  };

  const getStatusStep = (status) => {
    const steps = ["Pending", "Shipped", "Delivered"];
    return steps.indexOf(status);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-gray-600 text-lg">Fetching your orders...</p>
      </div>
    );
  }

  if (error) return <p className="text-center text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 mt-15">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Your Orders</h1>
        <p className="text-gray-600 mt-2">
          Here’s a list of your recent orders. Click on an order to view details and track progress.
        </p>
      </div>

      {/* Order List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {orders.length === 0 ? (
          <p className="text-center text-gray-600 text-lg col-span-full">No orders found. Start shopping now!</p>
        ) : (
          orders.map((order) => (
            <div key={order.order_id} className="bg-white shadow-lg rounded-lg p-5 border border-gray-200">
              <div className="flex flex-col gap-2">
                <p className="text-lg font-semibold text-gray-800">Order #{order.order_id}</p>
                <p className="text-sm text-gray-500">Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
                <p className={`font-medium ${order.status === "Delivered" ? "text-green-600" : "text-yellow-600"}`}>
                  Status: {order.status}
                </p>
                <p className="text-xl font-bold text-green-600">Total: ₹{order.total_amount}</p>
              </div>

              {/* Order Tracking */}
              <div className="mt-4 relative">
                <h3 className="text-lg font-semibold text-gray-700">Order Tracking</h3>

                {/* Transparent Line */}
                <div className="absolute top-1/2 left-0 w-full h-[3px] bg-gray-300/50 transform -translate-y-1/2">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                    style={{
                      width: `${(getStatusStep(order.status) / 2) * 100}%`,
                    }}
                  />
                </div>

                {/* Status Steps */}
                <div className="flex justify-between items-center mt-6 relative">
                  {["Pending", "Shipped", "Delivered"].map((step, index) => (
                    <div key={step} className="relative flex flex-col items-center w-1/3">
                      {/* Status Circle */}
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 ${
                          index <= getStatusStep(order.status)
                            ? "bg-blue-600 border-blue-600 shadow-md"
                            : "bg-gray-300 border-gray-300"
                        }`}
                      />

                      {/* Status Label */}
                      <p className="text-xs mt-2 text-gray-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expand Button */}
              <button
                onClick={() => toggleExpand(order.order_id)}
                className="mt-4 px-4 py-2 w-full bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition"
              >
                {expandedOrderId === order.order_id ? "Hide Details" : "View Details"}
              </button>

              {/* Order Details Section */}
              {expandedOrderId === order.order_id && orderDetails[order.order_id] && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-700">Order Items</h3>
                  <div className="space-y-3">
                    {orderDetails[order.order_id].map((item) => (
                      <div key={item.product_id} className="flex items-center gap-4 p-3 bg-gray-100 rounded-lg">
                        {item.product?.main_image && (
                          <img
                            src={item.product.main_image}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-md shadow"
                          />
                        )}
                        <div>
                          <p className="font-semibold">{item.product?.name || "Product not available"}</p>
                          <p className="text-gray-700">Quantity: {item.quantity}</p>
                          <p className="text-gray-900 font-medium">₹{item.subtotal}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderPage;
