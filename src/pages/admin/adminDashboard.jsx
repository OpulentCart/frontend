
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NotificationIcon from "../../components/notifications";
import { useSelector } from "react-redux";

const AdminDashboard = () => {

  const authToken = useSelector((state) => state.auth.access_token);
  
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [userCounts, setUserCounts] = useState({
    total_users: 0,
    customer: 0,
    vendors: 0,
  });

  useEffect(() => {
    if (authToken) {
      fetchUserCounts();
    }
  }, [authToken]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchStores();
    fetchProducts();
    fetchNotifications();
    fetchUserCounts();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await axios.get("http://localhost:5004/stores/pending");
      setStores(res.data.stores);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5004/products/pending");
      setProducts(res.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:5004/notifications");
      setNotifications(res.data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchUserCounts = async () => {
    try {
      if (!authToken) {
        console.error("Auth token is missing");
        return;
      }
  
      console.log("Fetching user counts with token:", authToken);
  
      const res = await axios.get("http://127.0.0.1:8000/api/auth/user-counts/", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
  
      console.log("User counts response:", res.data);
  
      setUserCounts(res.data);
    } catch (error) {
      console.error("Error fetching user counts:", error.response ? error.response.data : error);
    }
  };
  

  return (
    <div className="p-10 bg-gray-100 h-full overflow-auto mt-10">
      {/* Navbar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <NotificationIcon count={notifications.length} />
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-3 gap-6">
        {/* Pending Stores Card */}
        <div
          className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-200 transition"
          onClick={() => navigate("/admin/stores")}
        >
          <h3 className="text-xl font-semibold">Pending Stores</h3>
          <p className="text-gray-600 text-2xl font-bold">{stores.length}</p>
        </div>

        {/* Pending Products Card */}
        <div
          className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-200 transition"
          onClick={() => navigate("/admin/products")}
        >
          <h3 className="text-xl font-semibold">Pending Products</h3>
          <p className="text-gray-600 text-2xl font-bold">{products.length}</p>
        </div>

        {/* Total Users Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold">Total Users</h3>
          <p className="text-gray-600 text-2xl font-bold">{userCounts.total_users}</p>
        </div>

        {/* Customers Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold">Customers</h3>
          <p className="text-gray-600 text-2xl font-bold">{userCounts.customer}</p>
        </div>

        {/* Vendors Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold">Vendors</h3>
          <p className="text-gray-600 text-2xl font-bold">{userCounts.vendors}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
