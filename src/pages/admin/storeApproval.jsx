import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const ApproveStore = () => {

  const authToken = useSelector((state) => state.auth.access_token);

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [selectedTab, setSelectedTab] = useState("pending"); // "pending" or "approved"

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchStores();
  }, [authToken]);

  const fetchStores = async () => {
    
    if (!authToken) {
      setError("Unauthorized: Please log in.");
      setLoading(false);
      return;
    }

    try {
      setError("");
      setLoading(true);
      
    const res = await axios.get("http://localhost:5002/vendors/", {
      headers: {
        Authorization: `Bearer ${authToken}`, // Pass token in headers
      },
    });
      setStores(res.data.vendors);
    } catch (error) {
      console.error("Error fetching stores:", error);
      setError("Failed to load stores. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateStoreStatus = async (vendorId, newStatus) => {
    console.log(`Sending request to update vendor ${vendorId} to status ${newStatus}`);
  
    try {
      const response = await axios.put(
        `http://localhost:5002/vendors/${vendorId}`, // Check if vendorId is correctly added
        { status: newStatus }, // Sending status in request body
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
  
      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error updating store status:", error);
    }
  };
  
  

  const filteredStores = stores.filter((store) => store.status === selectedTab);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStores.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);

  return (
    <div className="p-10 mt-5">
      <h1 className="text-3xl font-bold mb-6 text-center">Approve Stores</h1>

      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <button
          className={`px-6 py-2 border-b-2 font-semibold ${
            selectedTab === "pending" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500"
          } focus:outline-none transition`}
          onClick={() => {
            setSelectedTab("pending");
            setCurrentPage(1);
          }}
        >
          Pending Stores
        </button>
        <button
          className={`px-6 py-2 border-b-2 font-semibold ${
            selectedTab === "approved" ? "border-green-500 text-green-600" : "border-transparent text-gray-500"
          } focus:outline-none transition`}
          onClick={() => {
            setSelectedTab("approved");
            setCurrentPage(1);
          }}
        >
          Approved Stores
        </button>
      </div>

      {error && <p className="text-center text-red-500 mb-4">{error}</p>}

      {/* Loader */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin h-12 w-12 border-4 border-blue-400 border-t-transparent rounded-full"></div>
        </div>
      ) : currentItems.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full max-w-6xl mx-auto bg-white border border-gray-300 shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-200 border-b">
                <th className="py-4 px-6 text-left">Store Name</th>
                <th className="py-4 px-6 text-left">Description</th>
                <th className="py-4 px-6 text-left">Business Email</th>
                <th className="py-4 px-6 text-left">City</th>
                <th className="py-4 px-6 text-center">Status</th>
                {selectedTab === "pending" && <th className="py-4 px-6 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((store) => (
                <tr key={store.vendor_id} className="border-b hover:bg-gray-100 transition">
                  <td className="py-4 px-6">{store.store_name}</td>
                  <td className="py-4 px-6">{store.store_description}</td>
                  <td className="py-4 px-6">{store.business_email}</td>
                  <td className="py-4 px-6">{store.city}</td>
                  <td className="py-4 px-6 font-semibold text-center">
                    {store.status === "pending" ? (
                      <span className="text-blue-600">Pending</span>
                    ) : (
                      <span className="text-green-600">Approved</span>
                    )}
                  </td>
                  {selectedTab === "pending" && (
                    <td className="py-4 px-6 flex justify-center space-x-4">
                      <button
                        className="px-5 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition disabled:opacity-50 flex items-center"
                        disabled={updatingId === store.vendor_id}
                        onClick={() => updateStoreStatus(store.vendor_id, "approved")}
                      >
                        {updatingId === store.vendor_id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        ) : null}
                        Approve
                      </button>
                      <button
                        className="px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50 flex items-center"
                        disabled={updatingId === store.vendor_id}
                        onClick={() => updateStoreStatus(store.vendor_id, "rejected")}
                      >
                        {updatingId === store.vendor_id ? (
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

          {/* Pagination */}
          {totalPages > 1 && (
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
          )}
        </div>
      ) : (
        <p className="text-center text-gray-600 text-lg mt-4">
          {selectedTab === "pending" ? "No pending stores to review." : "No approved stores yet."}
        </p>
      )}
    </div>
  );
};

export default ApproveStore;
