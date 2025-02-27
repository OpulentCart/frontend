import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

function Profile() {
  const authToken = useSelector((state) => state.auth.access_token);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!authToken) return;

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/auth/user-profile/", // Replace with your actual API endpoint
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        setUser(response.data);
      } catch (err) {
        setError("Failed to fetch user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();

    // Dummy Orders Data
    const dummyOrders = [
      {
        id: "ORD12345",
        status: "Shipped",
        total_price: 49.99,
        created_at: "2025-02-25T12:30:00Z",
      },
      {
        id: "ORD67890",
        status: "Processing",
        total_price: 79.99,
        created_at: "2025-02-20T09:15:00Z",
      },
      {
        id: "ORD24680",
        status: "Delivered",
        total_price: 129.99,
        created_at: "2025-02-15T17:45:00Z",
      },
    ];
    setOrders(dummyOrders);
  }, [authToken]);

  if (!authToken) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-500">
        Please login to view your profile.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center mt-15 mb-10">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-5xl w-full">
        {/* Profile Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center pb-6 border-b">
          {/* Profile Picture */}
          <div className="flex justify-center">
            <div className="w-28 h-28 rounded-full bg-yellow-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
          {/* User Info */}
          <div className="md:col-span-2 text-center md:text-left">
            <h2 className="text-3xl font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <span className="mt-2 inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-sm font-semibold">
              {user?.role}
            </span>
          </div>
        </div>

        {/* User Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 mt-6">
          <p className="border-b pb-2"><strong>Phone:</strong> {user?.phone_number || "Not provided"}</p>
          <p className="border-b pb-2"><strong>Address:</strong> {user?.address || "Not provided"}</p>
        </div>

        {/* Orders Section */}
        <div className="mt-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Your Orders</h3>
          {orders.length === 0 ? (
            <p className="text-gray-600">No orders found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-lg p-4 shadow-md bg-white hover:shadow-xl transition-all"
                >
                  <p className="text-lg font-medium"><strong>Order ID:</strong> {order.id}</p>
                  <p className="text-sm text-gray-600"><strong>Status:</strong> 
                    <span className={`ml-1 px-2 py-1 text-xs font-semibold rounded-lg ${order.status === "Shipped" ? "bg-blue-100 text-blue-700" : order.status === "Processing" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                      {order.status}
                    </span>
                  </p>
                  <p className="text-sm"><strong>Total:</strong> ${order.total_price.toFixed(2)}</p>
                  <p className="text-xs text-gray-500"><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
                  <Link to={`/orders/${order.id}`} className="text-yellow-500 text-sm mt-2 inline-block hover:underline">
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Link to="/edit-profile">
            <button className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition shadow-md">
              Edit Profile
            </button>
          </Link>
          <Link to="/">
            <button className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition shadow-md">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Profile;
