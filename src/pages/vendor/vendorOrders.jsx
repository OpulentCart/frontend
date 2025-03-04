import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("delivered"); // Default tab
  const [expandedOrder, setExpandedOrder] = useState(null); // Track which order is expanded
  const navigate = useNavigate();

  // Dummy orders data (hardcoded) with additional details for the dropdown
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
          customer_name: "John Doe",
          customer_email: "john.doe@email.com",
          order_date: "2025-02-15",
          shipping_address: "123 Main St, City, Country",
          tracking_number: "TRACK123456",
        },
        {
          order_id: "ORD002",
          product_name: "Wireless Headphones",
          quantity: 1,
          total_price: 99.99,
          status: "pending",
          customer_name: "Jane Smith",
          customer_email: "jane.smith@email.com",
          order_date: "2025-02-20",
          shipping_address: "456 Oak Ave, Town, Country",
          tracking_number: "TRACK789012",
        },
        {
          order_id: "ORD003",
          product_name: "Laptop Pro",
          quantity: 1,
          total_price: 1299.00,
          status: "shipped",
          customer_name: "Mike Johnson",
          customer_email: "mike.johnson@email.com",
          order_date: "2025-02-25",
          shipping_address: "789 Pine Rd, Village, Country",
          tracking_number: "TRACK345678",
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
              <React.Fragment key={order.order_id}>
                <tr className="hover:bg-gray-50">
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
                      onClick={() => setExpandedOrder(order.order_id === expandedOrder ? null : order.order_id)}
                      className="p-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      {expandedOrder === order.order_id ? "Hide Details" : "View Details"}
                    </button>
                  </td>
                </tr>
                {expandedOrder === order.order_id && (
                  <tr>
                    <td colSpan="6" className="py-4 px-4 bg-gray-50 border-t">
                      <div className="grid gap-2 text-sm text-gray-600">
                        <p><strong>Customer Name:</strong> {order.customer_name}</p>
                        <p><strong>Customer Email:</strong> {order.customer_email}</p>
                        <p><strong>Order Date:</strong> {order.order_date}</p>
                        <p><strong>Shipping Address:</strong> {order.shipping_address}</p>
                        <p><strong>Tracking Number:</strong> {order.tracking_number}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorOrders;