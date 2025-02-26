import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

function Profile() {
  const authToken = useSelector((state) => state.auth.access_token);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authToken) return;

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/auth/user-profile/",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        setUser(response.data);
      } catch (err) {
        setError("Failed to fetch user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [authToken]);

  if (!authToken) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-500">
        Please login to view your profile.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-3xl w-full">
        {/* Profile Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Profile Picture */}
          <div className="flex justify-center">
            <div className="w-28 h-28 rounded-full bg-yellow-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
          {/* User Info */}
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <span className="mt-2 inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-sm font-semibold">
              {user?.role}
            </span>
          </div>
        </div>

        {/* User Details */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <p className="border-b pb-2"><strong>Phone:</strong> {user?.phone_number || "Not provided"}</p>
          <p className="border-b pb-2"><strong>Address:</strong> {user?.address || "Not provided"}</p>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <Link to="/edit-profile" className="flex-1">
            <button className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition shadow-md">
              Edit Profile
            </button>
          </Link>
          <Link to="/" className="flex-1">
            <button className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition shadow-md">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Profile;
