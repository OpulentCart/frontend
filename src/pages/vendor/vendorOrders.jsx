import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("delivered"); // Default tab
  const navigate = useNavigate();

  // Dummy orders data (hardcoded)
  useEffect(() => {
    // Simulate loading delay for 1 second to mimic API call
    const timer = setTimeout(() => {
      setOrders([
        {
          order_id: "ORD001",
          product_name: "Smartphone X",
          quantity: 2,
          total_price: 599.98,
          status: "delivered",
        },
        {
          order_id: "ORD002",
          product_name: "Wireless Headphones",
          quantity: 1,
          total_price: 99.99,
          status: "pending",
        },
        {
          order_id: "ORD003",
          product_name: "Laptop Pro",
          quantity: 1,
          total_price: 1299.00,
          status: "shipped",
        },
      ]);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer); // Cleanup timer
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return <p className="text-center text-gray-500">No orders found.</p>;
  }

  // Filter orders by status
  const deliveredOrders = orders.filter((order) => order.status === "delivered");
  const shippedOrders = orders.filter((order) => order.status === "shipped");
  const pendingOrders = orders.filter((order) => order.status === "pending");

  // Handle status change for an order
  const handleStatusChange = (orderId, newStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.order_id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  // Define possible status transitions
  const getAvailableStatuses = (currentStatus) => {
    switch (currentStatus) {
      case "pending":
        return ["pending", "shipped"]; // Can change to "shipped" only
      case "shipped":
        return ["shipped", "delivered"]; // Can change to "delivered" only
      case "delivered":
        return ["delivered"]; // No change allowed (already delivered)
      default:
        return [currentStatus];
    }
  };

  return (
    <div className="p-4 mt-15 min-h-screen flex flex-col">
      <h2 className="text-xl font-bold mb-4">Your Orders</h2>

      {/* Tab Navigation */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab("delivered")}
          className={`p-2 w-1/3 text-center ${
            activeTab === "delivered" ? "border-b-2 border-green-500 font-semibold" : "text-gray-500"
          }`}
        >
          Delivered
        </button>
        <button
          onClick={() => setActiveTab("shipped")}
          className={`p-2 w-1/3 text-center ${
            activeTab === "shipped" ? "border-b-2 border-blue-500 font-semibold" : "text-gray-500"
          }`}
        >
          Shipped
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`p-2 w-1/3 text-center ${
            activeTab === "pending" ? "border-b-2 border-yellow-500 font-semibold" : "text-gray-500"
          }`}
        >
          Pending
        </button>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left text-gray-600">Order ID</th>
              <th className="py-2 px-4 border-b text-left text-gray-600">Product Name</th>
              <th className="py-2 px-4 border-b text-left text-gray-600">Quantity</th>
              <th className="py-2 px-4 border-b text-left text-gray-600">Total Price</th>
              <th className="py-2 px-4 border-b text-left text-gray-600">Status</th>
              <th className="py-2 px-4 border-b text-left text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(activeTab === "delivered"
              ? deliveredOrders
              : activeTab === "shipped"
              ? shippedOrders
              : pendingOrders
            ).map((order) => (
              <tr key={order.order_id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{order.order_id}</td>
                <td className="py-2 px-4 border-b">{order.product_name}</td>
                <td className="py-2 px-4 border-b">{order.quantity}</td>
                <td className="py-2 px-4 border-b">${order.total_price || 0}</td>
                <td className="py-2 px-4 border-b">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      order.status === "delivered"
                        ? "bg-green-200 text-green-800"
                        : order.status === "pending"
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-blue-200 text-blue-800"
                    }`}
                  >
                    {getAvailableStatuses(order.status).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => navigate(`/vendor/order-details/${order.order_id}`)}
                    className="p-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorOrders;