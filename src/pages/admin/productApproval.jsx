import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminProductApproval = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [selectedTab, setSelectedTab] = useState("pending");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5; // Change this as needed

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5005/products/admin");
  
      if (!res.data.products || !Array.isArray(res.data.products)) {
        console.error("API response is missing 'products' array.");
        return;
      }
  
      const allProducts = res.data.products.map((product) => ({
        id: product.product_id,
        name: product.name,
        brand: product.brand,
        description: product.description?.trim() || "No description provided",
        status: product.status,
      }));
  
      console.log("Fetched Products:", allProducts);
      setProducts(allProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProductStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      await axios.patch(`http://localhost:5005/products/${id}`, { status });

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === id ? { ...product, status } : product
        )
      );
    } catch (error) {
      console.error("Error updating product status:", error);
      setError("Failed to update product status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter products based on tab
  const filteredProducts = products.filter((product) => product.status === selectedTab);

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const paginatedProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <div className="p-10 mt-5">
      <h1 className="text-3xl font-bold mb-6 text-center">Product Approval</h1>

      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <button
          className={`px-6 py-2 border-b-2 font-semibold ${
            selectedTab === "pending" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500"
          } focus:outline-none transition`}
          onClick={() => { setSelectedTab("pending"); setCurrentPage(1); }}
        >
          Pending Products
        </button>
        <button
          className={`px-6 py-2 border-b-2 font-semibold ${
            selectedTab === "approved" ? "border-green-500 text-green-600" : "border-transparent text-gray-500"
          } focus:outline-none transition`}
          onClick={() => { setSelectedTab("approved"); setCurrentPage(1); }}
        >
          Approved Products
        </button>
      </div>

      {error && <p className="text-center text-red-500 mb-4">{error}</p>}

      {/* Full Page Loader */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin h-12 w-12 border-4 border-blue-400 border-t-transparent rounded-full"></div>
        </div>
      ) : paginatedProducts.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full max-w-6xl mx-auto bg-white border border-gray-300 shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-200 border-b">
                <th className="py-4 px-6 text-left">Product Name</th>
                <th className="py-4 px-6 text-left">Brand</th>
                <th className="py-4 px-6 text-left">Description</th>
                <th className="py-4 px-6 text-center">Status</th>
                {selectedTab === "pending" && <th className="py-4 px-6 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-100 transition">
                  <td className="py-4 px-6">{product.name}</td>
                  <td className="py-4 px-6">{product.brand}</td>
                  <td className="py-4 px-6">{product.description || "No description provided"}</td>
                  <td className="py-4 px-6 font-semibold text-center">
                    {product.status === "pending" ? (
                      <span className="text-blue-600">Pending</span>
                    ) : (
                      <span className="text-green-600">Approved</span>
                    )}
                  </td>
                  {selectedTab === "pending" && (
                    <td className="py-4 px-6 flex justify-center space-x-4">
                      <button
                        className="px-5 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition disabled:opacity-50 flex items-center"
                        disabled={updatingId === product.id}
                        onClick={() => updateProductStatus(product.id, "approved")}
                      >
                        {updatingId === product.id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        ) : null}
                        Approve
                      </button>
                      <button
                        className="px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50 flex items-center"
                        disabled={updatingId === product.id}
                        onClick={() => updateProductStatus(product.id, "rejected")}
                      >
                        {updatingId === product.id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        ) : null}
                        Reject
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center space-x-2 mt-5">
              <button
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 disabled:opacity-50"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === index + 1 ? "bg-yellow-500 text-white" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}

              <button
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 disabled:opacity-50"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>

        </div>
      ) : (
        <p className="text-center text-gray-600 text-lg mt-4">
          {selectedTab === "pending" ? "No pending products to review." : "No approved products yet."}
        </p>
      )}
    </div>
  );
};

export default AdminProductApproval;
