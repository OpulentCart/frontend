import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import showToast from "../../components/showToast";

const ApproveStore = () => {
  const authToken = useSelector((state) => state.auth.access_token);

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [selectedTab, setSelectedTab] = useState("pending"); // "pending", "approved", "rejected"
  const [expandedStoreId, setExpandedStoreId] = useState(null); // For dropdown

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

      const res = await axios.get("http://13.60.181.56:5002/vendors/", {
        headers: { Authorization: `Bearer ${authToken}` },
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
    console.log(`Updating vendor ${vendorId} to status ${newStatus}`);
    setUpdatingId(vendorId); // Show loader

    try {
      await axios.put(
        `http://13.60.181.56:5002/vendors/${vendorId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      fetchStores(); // Refresh list
      showToast({ label: "Store status updated successfully!", type: "success" });
    } catch (error) {
      console.error("Error updating store status:", error);
      showToast({ label: "Failed to update the store status", type: "error" });
    } finally {
      setUpdatingId(null); // Hide loader
    }
  };

  const filteredStores = stores.filter((store) => store.status === selectedTab);

  // Pagination Logic
  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStores.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="p-10 mt-5">
      <h1 className="text-3xl font-bold mb-6 text-center">Approve Stores</h1>

      {/* Tabs */}
      <div className="flex justify-center mb-6">
        {["pending", "approved", "rejected"].map((tab) => (
          <button
            key={tab}
            className={`px-6 py-2 border-b-2 font-semibold ${
              selectedTab === tab ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500"
            } focus:outline-none transition`}
            onClick={() => {
              setSelectedTab(tab);
              setCurrentPage(1); // Reset to first page on tab change
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} Stores
          </button>
        ))}
      </div>

      {error && <p className="text-center text-red-500 mb-4">{error}</p>}

      {/* Loader */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin h-12 w-12 border-4 border-blue-400 border-t-transparent rounded-full"></div>
        </div>
      ) : currentItems.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full max-w-6xl mx-auto bg-white border border-gray-300 shadow-md rounded-lg">
              <thead>
                <tr className="bg-gray-200 border-b">
                  <th className="py-4 px-6 text-left">Store Name</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  {selectedTab === "pending" && <th className="py-4 px-6 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {currentItems.map((store) => (
                  <React.Fragment key={store.vendor_id}>
                    {/* Clickable Store Header */}
                    <tr
                      className="border-b bg-gray-100 hover:bg-gray-200 cursor-pointer transition"
                      onClick={() => setExpandedStoreId(expandedStoreId === store.vendor_id ? null : store.vendor_id)}
                    >
                      <td className="py-4 px-6 font-semibold flex justify-between items-center">
                        {store.store_name}
                        <span className="text-gray-500 text-lg">
                          {expandedStoreId === store.vendor_id ? "🔼" : "🔽"}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-center">
                        {store.status === "pending" ? (
                          <span className="text-blue-600">Pending</span>
                        ) : store.status === "approved" ? (
                          <span className="text-green-600">Approved</span>
                        ) : (
                          <span className="text-red-600">Rejected</span>
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

                    {/* Dropdown Content - Full Store Details */}
                    {expandedStoreId === store.vendor_id && (
                      <tr>
                        <td colSpan="3" className="p-4 bg-gray-50 border-b">
                          <p><strong>Email:</strong> {store.business_email}</p>
                          <p><strong>Phone:</strong> {store.business_phone}</p>
                          <p>
                            <strong>Address:</strong>{" "}
                            {store.address
                              ? `${store.address.street}, ${store.address.city}, ${store.address.state}, ${store.address.country} - ${store.address.pincode}`
                              : "N/A"}
                          </p>

                          <p><strong>Description:</strong> {store.store_description}</p>
                          <p><strong>Business Document:</strong> {store.business_document}</p>
                          <p><strong>Certificate:</strong> {store.certificate}</p>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
              
            </table>
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
        </>
      ) : (
        <p className="text-center text-gray-600 text-lg mt-4">No {selectedTab} stores available.</p>
      )}
    </div>
  );
};

export default ApproveStore;
