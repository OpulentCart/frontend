import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Store, Package, Clock, CheckCircle, ShoppingBag, DollarSign } from "lucide-react";
import showToast from "../../components/showToast";

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

      const pending = res.data.stores.filter((store) => store.status === "pending").length;
      const approved = res.data.stores.filter((store) => store.status === "approved").length;

      setPendingStores(pending);
      setApprovedStores(approved);
      showToast({ label: "Manage your Stores!", type: "success" });
    } catch (error) {
      console.error("Error fetching vendor stores!", error);
      showToast({ label: "Failed to fetch your stores!", type: "error" });
    }
  };

  const fetchVendorProducts = async () => {
    try {
      const res = await axios.get(`http://localhost:5002/vendor/${vendorId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setProducts(res.data.products);

      const pending = res.data.products.filter((product) => product.status === "pending").length;
      const approved = res.data.products.filter((product) => product.status === "approved").length;

      setPendingProducts(pending);
      setApprovedProducts(approved);
      showToast({ label: "Manage your products!", type: "success" });
    } catch (error) {
      console.error("Error fetching vendor products:", error);
      showToast({ label: "Failed to fetch the products!", type: "error" });
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
        <DashboardCard title="Total Stores" value={stores.length} icon={<Store size={28} />} />

        {/* Approved Stores */}
        <DashboardCard title="Approved Stores" value={approvedStores} color="text-green-600" border="border-green-300" icon={<CheckCircle size={28} className="text-green-600" />} />

        {/* Pending Stores */}
        <DashboardCard title="Pending Stores" value={pendingStores} color="text-yellow-600" border="border-yellow-300" icon={<Clock size={28} className="text-yellow-600" />} />

        {/* Total Products */}
        <DashboardCard title="Total Products" value={products.length} icon={<Package size={28} />} />

        {/* Approved Products */}
        <DashboardCard title="Approved Products" value={approvedProducts} color="text-green-600" border="border-green-300" icon={<CheckCircle size={28} className="text-green-600" />} />

        {/* Pending Products */}
        <DashboardCard title="Pending Products" value={pendingProducts} color="text-yellow-600" border="border-yellow-300" icon={<Clock size={28} className="text-yellow-600" />} />

        {/* Total Sales */}
        <DashboardCard title="Total Sales" value={`$${sales}`} color="text-blue-600" border="border-blue-300" icon={<DollarSign size={28} className="text-blue-600" />} colSpan="col-span-3" />
      </div>
    </div>
  );
};

// Reusable Dashboard Card Component
const DashboardCard = ({ title, value, color = "text-gray-600", border = "border-gray-200", icon, colSpan = "" }) => {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-md border ${border} flex items-center ${colSpan}`}>
      <div className="mr-4">{icon}</div>
      <div>
        <h3 className={`text-xl font-semibold ${color}`}>{title}</h3>
        <p className={`${color} text-2xl font-bold`}>{value}</p>
      </div>
    </div>
  );
};

export default VendorDashboard;
