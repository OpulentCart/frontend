import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { jwtDecode } from "jwt-decode";
import { useSelector } from "react-redux";
import showToast from "../components/showToast";

const VendorStoreForm = () => {
  const [categories, setCategories] = useState([]); 
  const [step, setStep] = useState(1);
  const steps = ["Business Details", "Store Details"];
  const [formData, setFormData] = useState({
    businessEmail: "",
    businessPhone: "",
    store_description: "", 
    storeName: "",
    category: "",
    address: "",
    city: "",
    country: "",
    state: "",
    zipcode: "",
    businessDocument: [],
    certificate: null,
  });

  const authToken = useSelector((state) => state.auth.access_token);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:5004/categories/");
        if (!response.ok) throw new Error("Failed to fetch categories");
        
        const data = await response.json();
        
        // Extract categories array from the response
        if (Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          console.error("Expected an array but received:", data);
          setCategories([]); // Fallback to empty array
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]); // Ensure categories is always an array
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: files ? files[0] : value, // ✅ Store a single file instead of an array
    }));
  };
  
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateStep = () => {
    if (step === 1) {
      return (
        validateEmail(formData.businessEmail) &&  
        formData.businessPhone.trim() !== ""
      );
    } else if (step === 2) {
      return (
        formData.storeName.trim() !== "" &&
        formData.category.trim() !== "" &&
        formData.address.trim() !== "" &&
        formData.city.trim() !== "" &&
        formData.country.trim() !== "" &&
        formData.state.trim() !== "" &&
        formData.zipcode.trim() !== ""
      );
    }
    return true;
  };
  
  const handleNext = (e) => {
    e.preventDefault(); // Fix: Add event parameter
  
    if (step === 1) {
      if (!formData.businessEmail.trim()) {
        showToast({ label: "Business Email is Reqiured", type: "warning" });
        return;
      }
      if (!validateEmail(formData.businessEmail)) {
        showToast({ label: "Invalid email format. Please enter a valid email.", type: "warning" });
        return;
      }
      if (!formData.businessPhone.trim()) {
        showToast({ label: "Business phone is required.", type: "warning" });
        return;
      }
    } else if (step === 2) {
      const requiredFields = ["storeName", "category", "address", "city", "country", "state", "zipcode"];
      for (const field of requiredFields) {
        if (!formData[field].trim()) {
          alert(`${field.replace(/([A-Z])/g, " $1")} is required.`);
          return;
        }
      }
    }
  
    setStep((prev) => prev + 1);
  };
  
  const handleBack = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!authToken) {
      showToast({ label: "No authentication token found. Please log in again.", type: "error" });
      return;
    }
  
    let user_id = null;
    try {
      const decodedToken = jwtDecode(authToken);
      user_id = decodedToken.user_id;
    } catch (error) {
      showToast({ label: "Invalid token. Please log in again.", type: "error" });
      return;
    }
  
    // Create FormData to send files properly
    const formDataToSend = new FormData();
    formDataToSend.append("business_email", formData.businessEmail);
    formDataToSend.append("business_phone", formData.businessPhone);
    formDataToSend.append("store_name", formData.storeName);
    formDataToSend.append("category_id", formData.category); // Backend expects category_id
    formDataToSend.append("street_address", formData.address); // Rename `address` to `street_address`
    formDataToSend.append("city", formData.city);
    formDataToSend.append("state", formData.state);
    formDataToSend.append("country", formData.country);
    formDataToSend.append("pincode", formData.zipcode); // Rename `zipcode` to `pincode`
    formDataToSend.append("store_description", formData.store_description);
    formDataToSend.append("user_id", user_id);

    try {
      const response = await fetch("http://localhost:5002/vendors/create_store/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          // ❌ DO NOT set "Content-Type": "multipart/form-data" manually, as FormData handles it
        },
        body: formDataToSend,
      });
  
      if (response.ok) {
        showToast({ label: "Form submitted successfully!", type: "error" });
      } else {
        showToast({ label: "Failed to submit form.", type: "error" });
      }
    } catch (error) {
      showToast({ label: "Network error. Try again later.", type: "error" });
    }
  };
  
  return (
    <div className="mt-10 min-h-screen p-6 bg-gray-100 flex items-center justify-center">
      <div className="container max-w-screen-lg mx-auto">
        <h2 className="font-semibold text-xl text-yellow-500">
          {step === 1 ? "Business Details" : "Store Details"}
        </h2>
        <p className="text-gray-500 mb-6">
          {step === 1
            ? "Provide your business details."
            : "Fill out your store details."}
        </p>
        <div className="flex items-center justify-between mb-6">
          {steps.map((label, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold ${
                  step === index + 1 ? "bg-yellow-500" : step > index + 1 ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                {index + 1}
              </div>
              <p className="text-sm mt-2">{label}</p>
            </div>
          ))}
        </div>

        <form onSubmit={step === 2 ? handleSubmit : (e) => e.preventDefault()} className="bg-white rounded shadow-lg p-6 md:p-8 mb-6">
          {/* Step 1: Business Details */}
          {step === 1 && (
            <>
              <div className="grid gap-4 text-sm grid-cols-1 lg:grid-cols-3">
                <div className="text-gray-600">
                  <p className="font-medium text-lg text-yellow-500">Business Details</p>
                </div>

                <div className="lg:col-span-2 grid gap-4 text-sm grid-cols-1 md:grid-cols-5">
                  <div className="md:col-span-5">
                    <label htmlFor="businessEmail">Business Email</label>
                    <input
                      type="email"
                      id="businessEmail"
                      name="businessEmail"
                      value={formData.businessEmail}
                      onChange={handleChange}
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                    />
                  </div>

                  <div className="md:col-span-5">
                  <label htmlFor="businessPhone">Business Phone</label>
                  <PhoneInput
                    country={"in"} // Default country
                    enableSearch={true} // Allow searching countries
                    value={formData.businessPhone}
                    onChange={(phone) => setFormData({ ...formData, businessPhone: phone })}
                    inputClass="w-full h-10 px-4 border rounded bg-gray-50"
                    containerClass="mt-1"
                    dropdownClass="z-50" // Ensure dropdown is not hidden
                  />
                </div>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Store Details */}
          {step === 2 && (
            <>
              <div className="grid gap-4 text-sm grid-cols-1 lg:grid-cols-3">
                <div className="text-gray-600">
                  <p className="font-medium text-lg text-yellow-500">Store Details</p>
                </div>

                <div className="lg:col-span-2 grid gap-4 text-sm grid-cols-1 md:grid-cols-5">
                  <div className="md:col-span-5">
                    <label htmlFor="storeName">Store Name</label>
                    <input
                      type="text"
                      id="storeName"
                      name="storeName"
                      value={formData.storeName}
                      onChange={handleChange}
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                    />
                  </div>
                  <div className="md:col-span-5">
                      <label htmlFor="store_description">Store Description</label>
                      <textarea id="store_description" name="store_description" value={formData.store_description} onChange={handleChange} className="h-20 border mt-1 rounded px-4 w-full bg-gray-50" />
                  </div>
                  <div className="md:col-span-5">
                    <label htmlFor="category">Select Category:</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map((cat) => (
                        <option key={cat.category_id} value={cat.category_id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label htmlFor="address">Store Address</label>
                    <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="city">City</label>
                    <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="country">Country</label>
                    <input type="text" id="country" name="country" value={formData.country} onChange={handleChange} className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="state">State</label>
                    <input type="text" id="state" name="state" value={formData.state} onChange={handleChange} className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
                  </div>

                  <div className="md:col-span-1">
                    <label htmlFor="zipcode">Zip Code</label>
                    <input type="text" id="zipcode" name="zipcode" value={formData.zipcode} onChange={handleChange} className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
                  </div>
                </div>
              </div>
            </>
          )}

<div className="flex justify-between mt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2 bg-gray-500 text-white rounded-md shadow hover:bg-gray-600 transition"
              >
                Back
              </button>
            )}
            {step < 2 ? (
              <button
                type="button"
                onClick={(e) => handleNext(e)} 
                className="px-6 py-2 bg-yellow-500 text-white rounded-md shadow hover:bg-yellow-600 transition"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600 transition"
              >
                Submit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorStoreForm;