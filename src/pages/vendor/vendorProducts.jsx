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

  const [editingProduct, setEditingProduct] = useState(null);
  const [updatedProduct, setUpdatedProduct] = useState({
    name: "",
    brand: "",
    price: "",
    description: "",
  });

  useEffect(() => {
    console.log("Updated Products:", products);
  }, [products]);
  

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setUpdatedProduct({
      name: product.name,
      brand: product.brand,
      price: product.price,
      description: product.description,
    });
  };

  const handleInputChange = (e) => {
    setUpdatedProduct({ ...updatedProduct, [e.target.name]: e.target.value });
  };
  
  const handleUpdateProduct = async (productId) => {
    if (!productId) {
      console.error("Error: productId is undefined.");
      return alert("Invalid product ID.");
    }
  
    try {
      console.log("Updated Product Data:", JSON.stringify(updatedProduct, null, 2));
  
      const res = await axios.put(
        `http://13.60.181.56:5004/products/details/${productId}`,
        { 
          product_id: productId, 
          ...updatedProduct 
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      if (res.data.success) {
        setProducts((prevProducts) =>
          (prevProducts || [])
            .map((p) =>
              p.product_id === productId
                ? { ...p, ...res.data.data, status: res.data.data.status || p.status }
                : p
            )
            .filter(Boolean) // Removes any undefined/null values
        );
        
        
        setEditingProduct(null);
        alert("Product updated successfully!");
      }
    } catch (error) {
      console.error("Error updating product:", error.response?.data || error);
      alert("Failed to update product.");
    }
    
  };
  
  

  useEffect(() => {
    fetchVendorProducts();
  }, [authToken]);

  const fetchVendorProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://13.60.181.56:5004/products/vendor/", {
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
    console.log("Toggling details for product ID:", productId);
  
    if (expandedProduct?.product_id === productId) {
      console.log("Hiding details for:", productId);
      setExpandedProduct(null);
      return;
    }
  
    try {
      setLoadingDetails(true);
      const res = await axios.get(`http://13.60.181.56:5004/products/${productId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
  
      if (res.data.success) {
        console.log("Product details received:", res.data.product);
        setExpandedProduct(res.data.product);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };
  
  const deleteProduct = async (productId) => {
    if (!authToken) {
      console.error("Auth token is missing. Cannot delete product.");
      return;
    }
  
    if (!window.confirm("Are you sure you want to delete this product?")) return;
  
    try {
      const res = await axios.delete(`http://13.60.181.56:5004/products/${productId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      await axios.delete(`http://127.0.0.1:8001/products/${productId}/embeddings/delete/`, {
      });
  
      if (res.status === 200) {
        setProducts((prevProducts) => prevProducts.filter((product) => product.product_id !== productId));
        alert("Product deleted successfully!");
      } else {
        console.error("Failed to delete product:", res.data);
        alert("Failed to delete product.");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("An error occurred while deleting the product.");
    }
  };
  

  const updateProduct = (productId) => {
    alert(`Update functionality for product ID: ${productId} (Implement this!)`);
  };

  const filteredProducts = (products || [])
  .filter((product) => product && product.status && product.status === activeTab);

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
                    <td className="p-3 text-green-600 font-bold">₹{product.price}</td>
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
                          onClick={() => handleEditClick(product)}

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
          {editingProduct && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Edit Product</h2>
                <input
                  type="text"
                  name="name"
                  value={updatedProduct.name}
                  onChange={handleInputChange}
                  className="border p-2 w-full mb-2"
                  placeholder="Product Name"
                />
                <input
                  type="text"
                  name="brand"
                  value={updatedProduct.brand}
                  onChange={handleInputChange}
                  className="border p-2 w-full mb-2"
                  placeholder="Brand"
                />
                <input
                  type="number"
                  name="price"
                  value={updatedProduct.price}
                  onChange={handleInputChange}
                  className="border p-2 w-full mb-2"
                  placeholder="Price"
                />
                <textarea
                  name="description"
                  value={updatedProduct.description}
                  onChange={handleInputChange}
                  className="border p-2 w-full mb-2"
                  placeholder="Description"
                />
                <div className="flex justify-end space-x-2">
                  <button onClick={() => setEditingProduct(null)} className="px-4 py-2 bg-gray-400 text-white rounded">
                    Cancel
                  </button>
                  <button onClick={() => handleUpdateProduct(editingProduct.product_id)} className="px-4 py-2 bg-blue-500 text-white rounded">
                    Update
                  </button>

                </div>
              </div>
            </div>
          )}


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
