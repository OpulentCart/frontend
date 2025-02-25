import React, { useState, useEffect } from "react";
import axios from "axios";

const ApproveStore = () => {
  const [stores, setStores] = useState([]);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await axios.get("http://localhost:5002/vendors/");
      console.log("API Response:", res.data);
      setStores(res.data.vendors); // Extract vendors array
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  return (
    <div className="p-10 ml-64 mt-5">
      <h1 className="text-3xl font-bold mb-6 text-center">Approve Stores</h1>

      {stores.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full max-w-6xl mx-auto bg-white border border-gray-300 shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-200 border-b">
                <th className="py-4 px-6 text-left">Store Name</th>
                <th className="py-4 px-6 text-left">Description</th>
                <th className="py-4 px-6 text-left">Business Email</th>
                <th className="py-4 px-6 text-left">City</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.vendor_id} className="border-b hover:bg-gray-100 transition">
                  <td className="py-4 px-6">{store.store_name}</td>
                  <td className="py-4 px-6">{store.store_description}</td>
                  <td className="py-4 px-6">{store.business_email}</td>
                  <td className="py-4 px-6">{store.city}</td>
                  <td className="py-4 px-6 font-semibold text-blue-600 text-center">
                    {store.status}
                  </td>
                  <td className="py-4 px-6 flex justify-center space-x-4">
                    <button className="px-5 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition">
                      Approve
                    </button>
                    <button className="px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition">
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-600 text-lg mt-4">Loading stores...</p>
      )}
    </div>
  );
};

export default ApproveStore;
