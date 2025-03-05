import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import showToast from "../../components/showToast";

const VendorProducts = () => {
  const authToken = useSelector((state) => state.auth.access_token);
  const [vendorId, setVendorId] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchVendorDetails();
  }, []);

  useEffect(() => {
    if (vendorId) {
      fetchVendorProducts();
    }
  }, [vendorId]);

  // Fetch vendor details to get vendor_id
  const fetchVendorDetails = async () => {
    try {
      const res = await axios.get("http://localhost:5002/vendors/", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.data.vendor_id) {
        setVendorId(res.data.vendor_id);
      }
    } catch (error) {
      console.error("Error fetching vendor details:", error);
    }
  };

  // Fetch products for this vendor
  const fetchVendorProducts = async () => {
    try {
      const res = await axios.get(`http://localhost:5004/products/vendor/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setProducts(res.data.products);
    } catch (error) {
      console.error("Error fetching vendor products:", error);
    }
  };

  return (
    <div className="p-10 bg-gray-100 h-screen overflow-auto mt-10">
      <h1 className="text-2xl font-bold">Vendor Products</h1>

      {products.length === 0 ? (
        <p className="mt-4 text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-3 gap-6 mt-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">{product.product_name}</h3>
              <p className="text-gray-600">{product.description}</p>
              <p className="text-green-600 font-bold">${product.price}</p>
              <p className={`mt-2 px-2 py-1 rounded text-sm ${product.status === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {product.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorProducts;
