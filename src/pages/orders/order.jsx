import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import showToast from "../../components/showToast";

const OrderPage = () => {
  const authToken = useSelector((state) => state.auth.access_token);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    if (!authToken) return;

    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:5006/orders/", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setOrders(response.data.orders);
        showToast({ label: "Have a look at Your Orders!", type: "success" });
      } catch (err) {
        setError("Failed to fetch orders");
        showToast({ label: "Error in fetching your orders", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [authToken]);

  const fetchOrderDetails = async (orderId) => {
    setOrderLoading(true);
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
            product: {
              name: productRes.data.product.name,
              main_image: productRes.data.product.main_image,
              price: productRes.data.product.price,
            },
          };
        } catch (err) {
          console.error("Error fetching product details:", err);
          return { ...item, product: null };
        }
      });

      const itemsWithDetails = await Promise.all(productDetailsPromises);
      setModalData(itemsWithDetails);
    } catch (err) {
      console.error("Error fetching order details:", err);
      showToast({ label: "Failed to fetch Order Details", type: "error" });
    } finally {
      setOrderLoading(false);
    }
  };

  const closeModal = () => {
    setModalData(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-gray-600 text-lg">Loading your orders...</p>
      </div>
    );
  }

  if (error) return <p className="text-center text-red-600">{error}</p>;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-6">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Orders</h2>
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="px-6 py-3 text-left">Order ID</th>
              <th className="px-6 py-3 text-right">Total</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {orders.map((order) => (
              <tr key={order.order_id} className="hover:bg-gray-100 transition">
                <td className="px-6 py-4">{order.order_id}</td>
                <td className="px-6 py-4 text-right text-green-600 font-medium">₹{order.total_amount}</td>
                <td className="px-6 py-4">{order.status}</td>
                <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => fetchOrderDetails(order.order_id)}
                    className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 transition"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Popup Modal */}
      {modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-xl font-bold"
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold text-center mb-4">Order Details</h3>
            {orderLoading ? (
              <p className="text-center text-gray-600">Loading items...</p>
            ) : (
              <div className="space-y-4">
                {modalData.map((item) => (
                  <div key={item.product_id} className="flex items-center gap-4 border-b pb-3">
                    {item.product?.main_image && (
                      <img
                        src={item.product.main_image}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-md shadow"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-blue-600">{item.product?.name}</p>
                      <p className="text-gray-700">Qty: {item.quantity}</p>
                      <p className="text-gray-900 font-medium">₹{item.subtotal}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPage;
