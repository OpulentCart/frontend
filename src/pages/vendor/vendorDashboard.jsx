import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const VendorDashboard = () => {
  const authToken = useSelector((state) => state.auth.access_token);
  const [vendorId, setVendorId] = useState(null);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState(0);
  const [pendingStores, setPendingStores] = useState(0);
  const [approvedStores, setApprovedStores] = useState(0);
  const [pendingProducts, setPendingProducts] = useState(0);
  const [approvedProducts, setApprovedProducts] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVendorDetails();
  }, []);

  useEffect(() => {
    if (vendorId) {
      fetchVendorStores();
      fetchVendorProducts();
      fetchVendorSales();
    }
  }, [vendorId]);

  const fetchVendorDetails = async () => {
    try {
      const res = await axios.get("http://localhost:5002/vendors/", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.data.vendor) {
        setVendorId(res.data.vendor.id);
      }
    } catch (error) {
      console.error("Error fetching vendor details:", error);
    }
  };

  const fetchVendorStores = async () => {
    try {
      const res = await axios.get(`http://localhost:5002/vendors/${vendorId}/stores`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setStores(res.data.stores);

      // Filter pending and approved stores
      const pending = res.data.stores.filter((store) => store.status === "pending").length;
      const approved = res.data.stores.filter((store) => store.status === "approved").length;

      setPendingStores(pending);
      setApprovedStores(approved);
    } catch (error) {
      console.error("Error fetching vendor stores:", error);
    }
  };

  const fetchVendorProducts = async () => {
    try {
      const res = await axios.get(`http://localhost:5002/vendor/${vendorId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setProducts(res.data.products);

      // Filter pending and approved products
      const pending = res.data.products.filter((product) => product.status === "pending").length;
      const approved = res.data.products.filter((product) => product.status === "approved").length;

      setPendingProducts(pending);
      setApprovedProducts(approved);
    } catch (error) {
      console.error("Error fetching vendor products:", error);
    }
  };

  const fetchVendorSales = async () => {
    try {
      const res = await axios.get(`http://localhost:5002/vendors/${vendorId}/sales`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setSales(res.data.total_sales);
    } catch (error) {
      console.error("Error fetching vendor sales:", error);
    }
  };

  return (
    <div className="p-10 bg-gray-100 h-screen overflow-auto mt-10">
      <h1 className="text-2xl font-bold">Vendor Dashboard</h1>

      {/* Action Buttons */}
      <div className="flex space-x-4 mt-6">
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded shadow-md hover:bg-blue-600"
          onClick={() => navigate("/vendor/stores")}
        >
          Manage Stores
        </button>
        <button
          className="bg-green-500 text-white px-6 py-2 rounded shadow-md hover:bg-green-600"
          onClick={() => navigate("/vendor/products")}
        >
          Manage Products
        </button>
        <button
          className="bg-yellow-500 text-white px-6 py-2 rounded shadow-md hover:bg-yellow-600"  
           onClick={() => navigate("/vendor/orders")}
        >
          Manage Orders
        </button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-3 gap-6 mt-6">
        {/* Total Stores */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold">Total Stores</h3>
          <p className="text-gray-600 text-2xl font-bold">{stores.length}</p>
        </div>

        {/* Approved Stores */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-green-300">
          <h3 className="text-xl font-semibold text-green-600">Approved Stores</h3>
          <p className="text-green-600 text-2xl font-bold">{approvedStores}</p>
        </div>

        {/* Pending Stores */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-yellow-300">
          <h3 className="text-xl font-semibold text-yellow-600">Pending Stores</h3>
          <p className="text-yellow-600 text-2xl font-bold">{pendingStores}</p>
        </div>

        {/* Total Products */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold">Total Products</h3>
          <p className="text-gray-600 text-2xl font-bold">{products.length}</p>
        </div>

        {/* Approved Products */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-green-300">
          <h3 className="text-xl font-semibold text-green-600">Approved Products</h3>
          <p className="text-green-600 text-2xl font-bold">{approvedProducts}</p>
        </div>

        {/* Pending Products */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-yellow-300">
          <h3 className="text-xl font-semibold text-yellow-600">Pending Products</h3>
          <p className="text-yellow-600 text-2xl font-bold">{pendingProducts}</p>
        </div>

        {/* Total Sales */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-blue-300 col-span-3">
          <h3 className="text-xl font-semibold text-blue-600">Total Sales</h3>
          <p className="text-blue-600 text-2xl font-bold">${sales}</p>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
