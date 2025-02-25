import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminProductApproval = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5004/products/");
      console.log("API Response:", res.data);

      if (!res.data.products || !Array.isArray(res.data.products)) {
        console.error("API response is missing 'products' array.");
        return;
      }

      // Extract necessary fields for all products
      const allProducts = res.data.products.map((product) => ({
        id: product._id, // Ensure correct ID field
        name: product.name,
        brand: product.brand,
        vendorId: product.vendorId,
        category: product.category,
        status: product.status,
      }));

      console.log("All Products:", allProducts);
      setProducts(allProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const updateProductStatus = async (id, status) => {
    try {
      await axios.patch(`http://localhost:5004/products/${id}`, { status });

      // Update UI without refetching API
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === id ? { ...product, status } : product
        )
      );
    } catch (error) {
      console.error("Error updating product status:", error);
    }
  };

  return (
    <div className="p-10 mt-5 ml-64">
      <h1 className="text-3xl font-bold mb-6 text-center">Product Approval</h1>

      {products.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full max-w-6xl mx-auto bg-white border border-gray-300 shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-200 border-b">
                <th className="py-4 px-6 text-left">Product Name</th>
                <th className="py-4 px-6 text-left">Brand</th>
                <th className="py-4 px-6 text-left">Vendor ID</th>
                <th className="py-4 px-6 text-left">Category</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-100 transition">
                  <td className="py-4 px-6">{product.name}</td>
                  <td className="py-4 px-6">{product.brand}</td>
                  <td className="py-4 px-6">{product.vendorId}</td>
                  <td className="py-4 px-6">{product.category}</td>
                  <td className="py-4 px-6 font-semibold text-blue-600 text-center">
                    {product.status}
                  </td>
                  <td className="py-4 px-6 flex justify-center space-x-4">
                    <button
                      className="px-5 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition"
                      onClick={() => updateProductStatus(product.id, "approved")}
                    >
                      Approve
                    </button>
                    <button
                      className="px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition"
                      onClick={() => updateProductStatus(product.id, "rejected")}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-600 text-lg mt-4">Loading products...</p>
      )}
    </div>
  );
};

export default AdminProductApproval;
