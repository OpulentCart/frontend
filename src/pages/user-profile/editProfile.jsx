import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

function EditProfile() {
  const authToken = useSelector((state) => state.auth.access_token);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    address: "",
    phone_number: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch existing user profile to prefill the form
  useEffect(() => {
    if (!authToken) return;

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          "http://98.81.204.61:8000/api/auth/user-profile/",
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        setFormData({
          address: response.data.address || "",
          phone_number: response.data.phone_number || "",
        });
      } catch (err) {
        setError("Failed to load user profile");
      }
    };

    fetchUserProfile();
  }, [authToken]);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle phone number change
  const handlePhoneChange = (value) => {
    setFormData({ ...formData, phone_number: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      await axios.put("http://98.81.204.61:8000/api/auth/update-profile/", formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Edit Profile</h2>

        {error && <p className="text-red-500 mb-3">{error}</p>}
        {successMessage && <p className="text-green-500 mb-3">{successMessage}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700">Phone Number</label>
            <PhoneInput
              country={"us"} // Default country
              value={formData.phone_number}
              onChange={handlePhoneChange}
              inputClass="w-full border rounded-lg px-3 py-2 mt-1"
              containerClass="mt-1"
              inputProps={{
                name: "phone_number",
                required: true,
              }}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
