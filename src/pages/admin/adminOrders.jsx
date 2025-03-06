import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

function AdminOrders() {
  const authToken = useSelector((state) => state.auth.access_token);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTab, setSelectedTab] = useState("all"); // 'all', 'pending', 'shipped', 'delivered'
  const ordersPerPage = 5;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://13.60.181.56:5006/orders/admin", {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (response.data.success) {
          setOrders(response.data.orders);
        } else {
          setError("Failed to fetch orders.");
        }
      } catch (err) {
        setError("Error fetching orders.");
      } finally {
        setLoading(false);
      }
    };

    if (authToken) {
      fetchOrders();
    }
  }, [authToken]);

  // Filter orders based on selected tab
  const filteredOrders =
    selectedTab === "all" ? orders : orders.filter((order) => order.status === selectedTab);

  // Pagination logic
  const lastIndex = currentPage * ordersPerPage;
  const firstIndex = lastIndex - ordersPerPage;
  const currentOrders = filteredOrders.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  return (
    <div className="p-6 max-w-6xl mx-auto mt-15">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
        📦 Total Orders Table (Admin)
      </h2>

      {/* Tabs for filtering orders */}
      <div className="flex justify-center mb-6 space-x-4">
        {["all", "pending", "shipped", "delivered"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setSelectedTab(tab);
              setCurrentPage(1); // Reset to first page when switching tabs
            }}
            className={`px-4 py-2 rounded-md text-lg font-semibold transition-all ${
              selectedTab === tab
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse">
          <div className="h-12 bg-gray-300 rounded-md mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-300 rounded-md mb-2"></div>
          ))}
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <>
          <div className="overflow-x-auto shadow-lg rounded-lg">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-blue-600 text-white text-lg">
                  <th className="border px-6 py-3">Order ID</th>
                  <th className="border px-6 py-3">User ID</th>
                  <th className="border px-6 py-3">Total Amount</th>
                  <th className="border px-6 py-3">Status</th>
                  <th className="border px-6 py-3">Order Date</th>
                  <th className="border px-6 py-3">Delivery Date</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.length > 0 ? (
                  currentOrders.map((order, index) => (
                    <tr
                      key={order.order_id}
                      className={`text-center text-gray-800 ${
                        index % 2 === 0 ? "bg-gray-100" : "bg-white"
                      } hover:bg-gray-200 transition`}
                    >
                      <td className="border px-6 py-3">{order.order_id}</td>
                      <td className="border px-6 py-3">{order.user_id}</td>
                      <td className="border px-6 py-3 font-semibold text-green-600">
                        ₹{order.total_amount}
                      </td>
                      <td
                        className={`border px-6 py-3 font-semibold ${
                          order.status === "shipped"
                            ? "text-blue-500"
                            : order.status === "delivered"
                            ? "text-green-500"
                            : "text-orange-500"
                        }`}
                      >
                        {order.status}
                      </td>
                      <td className="border px-6 py-3">
                        {new Date(order.order_date).toLocaleDateString()}
                      </td>
                      <td className="border px-6 py-3">
                        {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-gray-500">
                      No orders found for {selectedTab} status.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-6 space-x-4">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md shadow-md transition-all ${
                  currentPage === 1
                    ? "bg-gray-300 cursor-not-allowed text-gray-600"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                ⬅️ Previous
              </button>

              <span className="text-lg font-semibold">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md shadow-md transition-all ${
                  currentPage === totalPages
                    ? "bg-gray-300 cursor-not-allowed text-gray-600"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Next ➡️
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminOrders;
