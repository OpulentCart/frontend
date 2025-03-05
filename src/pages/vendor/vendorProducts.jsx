import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const VendorProducts = () => {
  const authToken = useSelector((state) => state.auth.access_token);
  const [products, setProducts] = useState([]);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("approved");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchVendorProducts();
  }, [authToken]);

  const fetchVendorProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5004/products/vendor/", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.data.products) {
        setProducts(res.data.products);
      }
    } catch (error) {
      console.error("Error fetching vendor products:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDetails = async (productId) => {
    if (expandedProduct?.product_id === productId) {
      setExpandedProduct(null);
      return;
    }
    try {
      setLoadingDetails(true);
      const res = await axios.get(`http://localhost:5004/products/${productId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.data.success) {
        setExpandedProduct(res.data.product);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`http://localhost:5004/products/${productId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setProducts(products.filter((product) => product.product_id !== productId));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const updateProduct = (productId) => {
    alert(`Update functionality for product ID: ${productId} (Implement this!)`);
  };

  const filteredProducts = products.filter((product) => product.status === activeTab);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-10 bg-gray-100 min-h-screen overflow-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Vendor Products</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        {["approved", "rejected", "pending"].map((tab) => (
          <button
            key={tab}
            className={`px-6 py-2 rounded-md text-white font-medium transition ${
              activeTab === tab ? "bg-blue-600" : "bg-gray-400 hover:bg-gray-500"
            }`}
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} Products
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <p className="text-gray-600 text-lg animate-pulse">Loading products...</p>
        </div>
      ) : paginatedProducts.length === 0 ? (
        <p className="mt-4 text-gray-500">No {activeTab} products found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="p-3 text-left">Product Name</th>
                <th className="p-3 text-left">Brand</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <React.Fragment key={product.product_id}>
                  <tr className="border-b hover:bg-gray-100">
                    <td className="p-3">{product.name}</td>
                    <td className="p-3">{product.brand}</td>
                    <td className="p-3 text-green-600 font-bold">${product.price}</td>
                    <td className="p-3 text-center">
                      <div className="flex gap-2 justify-center flex-nowrap">
                        <button
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                          onClick={() => toggleDetails(product.product_id)}
                        >
                          {expandedProduct?.product_id === product.product_id ? "Hide Details" : "Details"}
                        </button>
                        <button
                          className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
                          onClick={() => updateProduct(product.product_id)}
                        >
                          Update
                        </button>
                        <button
                          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                          onClick={() => deleteProduct(product.product_id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedProduct?.product_id === product.product_id && (
                    <tr className="bg-gray-50">
                      <td colSpan="4" className="p-4">
                        {loadingDetails ? (
                          <div className="text-center">
                            <p className="text-gray-500 animate-pulse">Loading details...</p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <img
                              src={expandedProduct.main_image}
                              alt={expandedProduct.name}
                              className="w-24 h-24 object-cover rounded-md border"
                            />
                            <div>
                              <p><strong>Name:</strong> {expandedProduct.name}</p>
                              <p><strong>Description:</strong> {expandedProduct.description}</p>
                              <p><strong>Best Seller:</strong> {expandedProduct.is_bestseller ? "Yes" : "No"}</p>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-between mt-6">
            <button
              className={`px-4 py-2 rounded-md text-white font-medium ${
                currentPage === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span className="px-4 py-2 bg-gray-200 rounded-md font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className={`px-4 py-2 rounded-md text-white font-medium ${
                currentPage === totalPages ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProducts;
