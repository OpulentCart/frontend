import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const VendorProducts = () => {
  const authToken = useSelector((state) => state.auth.access_token);
  const [products, setProducts] = useState([]);
  const [expandedProduct, setExpandedProduct] = useState(null); // Toggle dropdown

  useEffect(() => {
    fetchVendorProducts();
  }, [authToken]);

  // Fetch vendor products
  const fetchVendorProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5004/products/vendor/", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.data.products) {
        setProducts(res.data.products); // Correct: Directly setting the array of products
      }
      
    } catch (error) {
      console.error("Error fetching vendor products:", error);
    }
  };

  // Toggle dropdown
  const toggleDetails = (productId) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  return (
    <div className="p-10 bg-gray-100 h-screen overflow-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Vendor Products</h1>

      {products.length === 0 ? (
        <p className="mt-4 text-gray-500">No products found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="p-3 text-left">Product Name</th>
                <th className="p-3 text-left">Brand</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <React.Fragment key={product.product_id}>
                  {/* Main Row */}
                  <tr className="border-b hover:bg-gray-100">
                    <td className="p-3">{product.name}</td>
                    <td className="p-3">{product.brand}</td>
                    <td className="p-3 text-green-600 font-bold">${product.price}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          product.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        onClick={() => toggleDetails(product.product_id)}
                      >
                        {expandedProduct === product.product_id ? "Hide" : "View"} Details
                      </button>
                    </td>
                  </tr>

                  {/* Dropdown Row */}
                  {expandedProduct === product.product_id && (
                    <tr className="bg-gray-50">
                      <td colSpan="5" className="p-4">
                        <div>
                          <h4 className="text-lg font-bold">Product Details</h4>
                          <p><strong>Description:</strong> {product.description}</p>
                          <p><strong>Vendor ID:</strong> {product.vendor_id}</p>
                          <p><strong>Category ID:</strong> {product.sub_category_id}</p>
                          <p><strong>Best Seller:</strong> {product.is_bestseller ? "Yes" : "No"}</p>

                          {/* Product Images */}
                          <div className="flex gap-3 mt-3">
                            <img
                              src={product.main_image}
                              alt="Main"
                              className="w-32 h-32 object-cover rounded shadow"
                            />
                            {product.cover_images.map((img, index) => (
                              <img
                                key={index}
                                src={img}
                                alt={`Cover ${index}`}
                                className="w-20 h-20 object-cover rounded shadow"
                              />
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VendorProducts;
