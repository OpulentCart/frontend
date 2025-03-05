import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import showToast from "../../components/showToast";

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("delivered");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const authToken = useSelector((state) => state.auth.access_token);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:5006/orders/vendor", {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (response.data.success) {
          const orderedProducts = response.data.orderedProducts;
          
          const ordersWithDetails = await Promise.all(
            orderedProducts.map(async (order) => {
              try {
                const productResponse = await axios.get(
                  `http://localhost:5004/products/${order.product_id}`,
                  { headers: { Authorization: `Bearer ${authToken}` } }
                );
                return {
                  ...order,
                  productDetails: productResponse.data,
                };
              } catch (error) {
                console.error("Error fetching product details:", error);
                return { ...order, productDetails: {} };
              }
            })
          );

          setOrders(ordersWithDetails);
          showToast({ label: "Manage your Orders!", type: "success" });
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        showToast({ label: "Failed to fetch your Orders!", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [authToken]);

  const updateOrderStatus = async (orderItemId, newStatus) => {
    try {
      console.log("Updating order ID:", orderItemId);

      await axios.put(
        `http://localhost:5006/orders/${orderItemId}`, // Use order_item_id
        { status: newStatus },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_item_id === orderItemId ? { ...order, status: newStatus } : order
        )
      );
      showToast({ label: "Your Order is updated sucessfully!", type: "success" });
    } catch (error) {
      console.error("Error updating order status:", error);
      showToast({ label: "Failed to update your Order", type: "error" });
    }
  };

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

  const filteredOrders = {
    delivered: orders.filter((order) => order.status === "delivered"),
    shipped: orders.filter((order) => order.status === "shipped"),
    pending: orders.filter((order) => order.status === "pending"),
  };

  return (
    <div className="p-4 mt-15 min-h-screen flex flex-col">
      <h2 className="text-xl font-bold mb-4">Your Orders</h2>

      <div className="flex border-b mb-4">
        {["delivered", "shipped", "pending"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`p-2 w-1/3 text-center ${
              activeTab === tab ? "border-b-2 border-green-500 font-semibold" : "text-gray-500"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left text-gray-600">Order Item ID</th>
              <th className="py-2 px-4 border-b text-left text-gray-600">Product Name</th>
              <th className="py-2 px-4 border-b text-left text-gray-600">Quantity</th>
              <th className="py-2 px-4 border-b text-left text-gray-600">Price</th>
              <th className="py-2 px-4 border-b text-left text-gray-600">Status</th>
              <th className="py-2 px-4 border-b text-left text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders[activeTab].map((order) => (
              <React.Fragment key={order.order_item_id}>
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{order.order_item_id}</td>
                  <td className="py-2 px-4 border-b">{order.productDetails?.name || order.product_name}</td>
                  <td className="py-2 px-4 border-b">{order.quantity}</td>
                  <td className="py-2 px-4 border-b">${order.productDetails?.price || order.price}</td>
                  <td className="py-2 px-4 border-b">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.order_item_id, e.target.value)}
                      className="px-2 py-1 border rounded text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => setExpandedOrder(expandedOrder === order.order_item_id ? null : order.order_item_id)}
                      className="p-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      {expandedOrder === order.order_item_id ? "Hide Details" : "View Details"}
                    </button>
                  </td>
                </tr>
                {expandedOrder === order.order_item_id && (
                  <tr>
                    <td colSpan="6" className="py-4 px-4 bg-gray-50 border-t">
                      <div className="grid gap-2 text-sm text-gray-600">
                        <p><strong>Customer ID:</strong> {order.customer_id}</p>
                        <p><strong>Order Item ID:</strong> {order.order_item_id}</p>
                        <p><strong>Product Name:</strong> {order.productDetails?.name || order.product_name}</p>
                        <p><strong>Price:</strong> ${order.productDetails?.price || order.price}</p>
                        <p><strong>Quantity:</strong> {order.quantity}</p>
                        <p><strong>Status:</strong> {order.status}</p>
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
