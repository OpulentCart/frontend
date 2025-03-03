import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const StoresList = () => {
  const authToken = useSelector((state) => state.auth.access_token);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("approved"); // Default tab
  const navigate = useNavigate(); // ✅ Correct way to navigate

  useEffect(() => {
    if (!authToken) return;

    const fetchStores = async () => {
      try {
        const response = await axios.get("http://localhost:5002/vendors/store", {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });
        setStores(response.data.vendor);
      } catch (err) {
        setError("Failed to fetch stores");
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [authToken]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const approvedStores = stores.filter((store) => store.status === "approved");
  const rejectedStores = stores.filter((store) => store.status !== "approved");

  return (
    <div className="p-4 mt-15 min-h-screen flex flex-col">
      <h2 className="text-xl font-bold mb-4">Your Stores</h2>

      {/* Tab Navigation */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab("approved")}
          className={`p-2 w-1/2 text-center ${
            activeTab === "approved" ? "border-b-2 border-yellow-500 font-semibold" : "text-gray-500"
          }`}
        >
          Approved Stores
        </button>
        <button
          onClick={() => setActiveTab("rejected")}
          className={`p-2 w-1/2 text-center ${
            activeTab === "rejected" ? "border-b-2 border-red-500 font-semibold" : "text-gray-500"
          }`}
        >
          Rejected Stores
        </button>
      </div>

      {/* Store List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 flex-grow">
        {(activeTab === "approved" ? approvedStores : rejectedStores).length === 0 ? (
          <p>No {activeTab} stores found.</p>
        ) : (
          (activeTab === "approved" ? approvedStores : rejectedStores).map((store) => (
            <div
              key={store.vendor_id}
              className="border rounded-lg p-3 shadow-md h-44 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-md font-semibold">{store.store_name}</h3>
                <p className="text-gray-600 text-sm truncate">{store.store_description}</p>
                <p className="text-xs"><strong>Email:</strong> {store.business_email}</p>
                <p className="text-xs"><strong>Phone:</strong> {store.business_phone}</p>
                <p className="text-xs"><strong>Location:</strong> {store.city}, {store.state}</p>
                <p className={`text-xs font-semibold ${store.status === "approved" ? "text-green-600" : "text-red-600"}`}>
                  Status: {store.status}
                </p>
              </div>

              {/* Register Product Button for Approved Stores */}
              {activeTab === "approved" && (
                <button
                  onClick={() => navigate("/vendor/product-form")} // ✅ Correct way to navigate
                  className="p-1 text-xs bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                >
                  Register Product
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StoresList;
