import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import NotificationIcon from "../components/notifications";

const AdminDashboard = () => {
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStores();
    fetchProducts();
    fetchNotifications();
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

  return (
    <div className="flex min-h-screen mt-5 ">
      {/* Sidebar should always be visible */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-10 ml-64">
        {/* Navbar */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <NotificationIcon count={notifications.length} />
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-2 gap-6">
          {/* Pending Stores */}
          <div 
            className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-200 transition"
            onClick={() => navigate("/admin/stores")}
          >
            <h3 className="text-xl font-semibold">Pending Stores</h3>
            <p className="text-gray-600 text-2xl font-bold">{stores.length}</p>
          </div>

          {/* Pending Products */}
          <div 
            className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-200 transition"
            onClick={() => navigate("/admin/products")}
          >
            <h3 className="text-xl font-semibold">Pending Products</h3>
            <p className="text-gray-600 text-2xl font-bold">{products.length}</p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
