import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import showToast from "../../components/showToast";

const AdminProductApproval = () => {
  const authToken = useSelector((state) => state.auth.access_token);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [selectedTab, setSelectedTab] = useState("pending");
  const [selectedProduct, setSelectedProduct] = useState(null); // Modal state

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5; // Adjust as needed

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://13.60.181.56:5004/products/admin/products",{
        headers:{Authorization: `Bearer ${authToken}`}
      });

      if (!res.data.products || !Array.isArray(res.data.products)) {
        console.error("API response is missing 'products' array.");
        return;
      }

      const allProducts = res.data.products.map((product) => ({
        id: product.product_id,
        name: product.name,
        brand: product.brand,
        description: product.description?.trim() || "No description provided",
        price: product.price,
        stock: product.stock,
        likes: product.likes,
        ratings: product.ratings,
        status: product.status,
        main_image: product.main_image,
        cover_images: product.cover_images || [],
      }));

      setProducts(allProducts);
      showToast({ label: "Manage the Vendor Products!", type: "success" });
    } catch (error) {
      console.error("Error fetching products:", error);
      showToast({ label: "Failed to fetch the products", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const updateProductStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      await axios.put(`http://13.60.181.56:5004/products/${id}`, { status }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      await axios.put(`http://98.81.204.61:8001/products/${id}/embeddings/update/`, { status }, {
      });

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === id ? { ...product, status } : product
        )
      );
      showToast({ label: "Product Status updated successfully!", type: "success" });
    } catch (error) {
      console.error("Error updating product status:", error);
      setError("Failed to update product status. Please try again.");
      showToast({ label: "Failed to update the status!", type: "error" });
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter products based on selected tab
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
      <div className="flex justify-center mb-6 space-x-6">
        <button
          className={`px-6 py-2 border-b-2 font-semibold ${selectedTab === "pending" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500"} focus:outline-none transition`}
          onClick={() => { setSelectedTab("pending"); setCurrentPage(1); }}
        >
          Pending Products
        </button>
        <button
          className={`px-6 py-2 border-b-2 font-semibold ${selectedTab === "approved" ? "border-green-500 text-green-600" : "border-transparent text-gray-500"} focus:outline-none transition`}
          onClick={() => { setSelectedTab("approved"); setCurrentPage(1); }}
        >
          Approved Products
        </button>
        <button
          className={`px-6 py-2 border-b-2 font-semibold ${selectedTab === "rejected" ? "border-red-500 text-red-600" : "border-transparent text-gray-500"} focus:outline-none transition`}
          onClick={() => { setSelectedTab("rejected"); setCurrentPage(1); }}
        >
          Rejected Products
        </button>
      </div>

      {error && <p className="text-center text-red-500 mb-4">{error}</p>}

      {/* Loader */}
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
                <th className="py-4 px-6 text-center">Status</th>
                {selectedTab === "pending" && <th className="py-4 px-6 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-100 transition">
                  <td className="py-4 px-6 cursor-pointer text-blue-600 hover:underline"
                      onClick={() => setSelectedProduct(product)}>
                    {product.name}
                  </td>
                  <td className="py-4 px-6">{product.brand}</td>
                  <td className="py-4 px-6 font-semibold text-center">
                    {product.status === "pending" && <span className="text-blue-600">Pending</span>}
                    {product.status === "approved" && <span className="text-green-600">Approved</span>}
                    {product.status === "rejected" && <span className="text-red-600">Rejected</span>}
                  </td>
                  {selectedTab === "pending" && (
                    <td className="py-4 px-6 flex justify-center space-x-4">
                      <button
                        className="px-5 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition disabled:opacity-50"
                        disabled={updatingId === product.id}
                        onClick={() => updateProductStatus(product.id, "approved")}
                      >
                        Approve
                      </button>
                      <button
                        className="px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50"
                        disabled={updatingId === product.id}
                        onClick={() => updateProductStatus(product.id, "rejected")}
                      >
                        Reject
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>

            <span className="text-gray-700">
              Page {currentPage} of {totalPages}
            </span>

            <button
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>

        </div>
      ) : (
        <p className="text-center text-gray-600 text-lg mt-4">No products found.</p>
      )}

{/* Product Details Modal */}
    {selectedProduct && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 mt-10">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
          {/* Close Button */}
          <button 
            className="absolute top-3 right-3 bg-gray-200 px-3 py-1 rounded-full hover:bg-gray-300 text-gray-700"
            onClick={() => setSelectedProduct(null)}
          >
            ✖
          </button>

          {/* Grid Layout: Image (Left) & Details (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left Side: Main Image */}
            <div className="flex justify-center">
              <img 
                src={selectedProduct.main_image} 
                alt="Main Product" 
                className="w-full max-h-56 object-cover rounded-lg shadow-md"
              />
            </div>

            {/* Right Side: Product Details */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h2>
              <p><strong>Brand:</strong> {selectedProduct.brand}</p>
              <p><strong>Price:</strong> ₹{selectedProduct.price}</p>
              <p><strong>Stock:</strong> {selectedProduct.stock}</p>
              <p><strong>Likes:</strong> {selectedProduct.likes}</p>
              <p><strong>Ratings:</strong> ⭐ {selectedProduct.ratings}</p>
              <p className="text-gray-700"><strong>Description:</strong> {selectedProduct.description}</p>
            </div>
          </div>

          {/* Cover Images Gallery (Scrollable) */}
          {selectedProduct.cover_images.length > 0 && (
            <div className="mt-4 flex space-x-2 overflow-x-auto">
              {selectedProduct.cover_images.map((img, index) => (
                <img 
                  key={index} 
                  src={img} 
                  alt={`Cover ${index + 1}`} 
                  className="w-20 h-20 object-cover rounded-md border border-gray-300 shadow-sm"
                />
              ))}
            </div>
          )}
    </div>
  </div>
)}

    </div>
  );
};

export default AdminProductApproval;
