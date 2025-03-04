import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

const OrderPage = () => {
  const authToken = useSelector((state) => state.auth.access_token);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState({});
  const [orderLoading, setOrderLoading] = useState(false); // Loader for order items

  useEffect(() => {
    if (!authToken) return;

    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:5006/orders/", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setOrders(response.data.orders);
      } catch (err) {
        setError("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [authToken]);

  const fetchOrderItems = async (orderId) => {
    if (orderItems[orderId]) {
      setExpandedOrder(expandedOrder === orderId ? null : orderId); // Toggle visibility
      return;
    }

    setOrderLoading(true); // Start loader

    try {
      const response = await axios.get(`http://localhost:5006/orders/${orderId}/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      let items = response.data.order_items;

      // Convert single object into an array
      if (!Array.isArray(items)) {
        items = [items];
      }

      setOrderItems((prev) => ({ ...prev, [orderId]: items }));
      setExpandedOrder(orderId);
    } catch (err) {
      console.error("Error fetching order items:", err);
    } finally {
      setOrderLoading(false); // Stop loader
    }
  };

  // 🔹 Full-page Loader (Spinner)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) return <p className="text-center text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 mt-15">
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-200 text-gray-700 text-lg">
                <th className="px-6 py-3 text-left">Order ID</th>
                <th className="px-6 py-3 text-left">Total</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <React.Fragment key={order.order_id}>
                  <tr className="border-b hover:bg-gray-100 transition-all duration-200">
                    <td className="px-6 py-4 font-medium text-gray-800">{order.order_id}</td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">${order.total_amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full shadow-sm ${
                        order.status === "shipped"
                          ? "bg-blue-200 text-blue-800"
                          : order.status === "pending"
                          ? "bg-yellow-200 text-yellow-800"
                          : order.status === "delivered"
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => fetchOrderItems(order.order_id)}
                        className="text-blue-600 underline"
                      >
                        {expandedOrder === order.order_id ? "Hide Items" : "View Items"}
                      </button>
                    </td>
                  </tr>

                  {/* Order Items Section */}
                  {expandedOrder === order.order_id && (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 bg-gray-50">
                        {orderLoading ? (
                          <div className="flex justify-center py-4">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : orderItems[order.order_id] ? (
                          <ul className="list-disc pl-6 text-gray-700">
                            {orderItems[order.order_id].map((item, index) => (
                              <li key={index} className="border p-2 rounded-md bg-white shadow-sm mb-2">
                                <p><span className="font-semibold">Product ID:</span> {item.product_id}</p>
                                <p><span className="font-semibold">Unit Price:</span> ${item.unit_price}</p>
                                <p><span className="font-semibold">Subtotal:</span> ${item.subtotal}</p>
                                <p><span className="font-semibold">Order Date:</span> {new Date(item.createdAt).toLocaleDateString()}</p>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>No items found.</p>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
