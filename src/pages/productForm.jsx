import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const ProductForm = () => {
  const [step, setStep] = useState(1);
  const steps = ["Product Details", "Upload Images"];

  const authToken = useSelector((state) => state.auth.access_token);

  const [formData, setFormData] = useState({
    vendor_id: "",
    category_id: "",
    sub_category_id: "",
    name: "",
    brand: "",
    description: "",
    cover_image: null,  
    sub_image: [],      
    likes: 0,          
    stock: "",        
    price: "",  
    ratings: "",  // Added this field
  });
  

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:5004/categories");
        if (response.data.success) {
          setCategories(response.data.categories); // Store categories from API
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch sub-categories from API
  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const response = await axios.get("http://localhost:5004/subcategories",{
          headers:{
            Authorization: `Bearer ${authToken}`
          }
        });
        if (response.data.success) {
          setSubCategories(response.data.subCategories); // Store all sub-categories
        }
      } catch (error) {
        console.error("Error fetching sub-categories:", error);
      }
    };

    fetchSubCategories();
  }, []);

  // Update filtered sub-categories when category changes
  useEffect(() => {
    if (formData.category_id) {
      const filtered = subCategories.filter(
        (sub) => sub.category_id === parseInt(formData.category_id) // Ensure proper comparison
      );
      setFilteredSubCategories(filtered);
      setFormData((prev) => ({ ...prev, sub_category_id: "" })); // Reset sub-category selection
    } else {
      setFilteredSubCategories([]);
    }
  }, [formData.category_id, subCategories]);
  

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
  
    if (type === "file") {
      if (name === "cover_image") {
        setFormData((prev) => ({
          ...prev,
          cover_image: files[0], // Store single file
        }));
      } else if (name === "sub_image") {
        setFormData((prev) => ({
          ...prev,
          sub_image: Array.from(files), // Store multiple files as an array
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value, // Update text, number, and select inputs
      }));
    }
  };
  
  
  
  

  const handleNext = (e) => {
    e.preventDefault();
  
    if (step === 1) {
      if (
        !formData.name ||
        !formData.price ||
        !formData.category_id ||  // Correct field name
        !formData.sub_category_id || // Correct field name
        !formData.description ||
        !formData.stock
      ) {
        alert("Please fill in all required fields before proceeding.");
        return;
      }
    }
  
    if (step === 2) {
      if (!formData.cover_image || formData.sub_image.length === 0) {
        alert("Please upload at least one main image and a cover image.");
        return;
      }
    }
  
    setStep((prev) => prev + 1);
  };
  

  const handleBack = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formDataToSend = new FormData();
  
    for (const key in formData) {
      let value = formData[key];
  
      // Convert empty strings to null or skip appending them
      if (["vendor_id", "category_id", "sub_category_id", "likes", "stock", "price", "ratings"].includes(key) && !value) {
        continue; // Skip empty fields instead of appending null
      }
  
      // Append only if value exists
      if (value !== null && value !== undefined) {
        formDataToSend.append(key, value);
      }
    }
  
    // Ensure a cover image is provided
    if (formData.cover_image) {
      formDataToSend.append("cover_image", formData.cover_image);
    } else {
      alert("Please upload a main image.");
      return;
    }
  
    // Ensure sub images are provided
    if (formData.sub_image.length > 0) {
      formData.sub_image.forEach((image, index) => {
        formDataToSend.append(`sub_image`, image); // Fix: Remove array syntax in key
      });
    } else {
      alert("Please upload at least one cover image.");
      return;
    }
  
    try {
      const response = await axios.post(
        "http://localhost:5004/products/create",
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${authToken}` },
        }
      );
  
      if (response.data.success) {
        alert("Product added successfully!");
        setFormData({
          vendor_id: "",
          category_id: "",
          sub_category_id: "",
          name: "",
          brand: "",
          description: "",
          cover_image: null,
          sub_image: [],
          likes: 0,
          stock: "",
          price: "",
          ratings: "",
        });
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      alert("Failed to add product. Please try again.");
    }
  };
  


  return (
    <div className="mt-10 min-h-screen p-6 bg-gray-100 flex items-center justify-center">
      <div className="container max-w-screen-lg mx-auto mt-5">
      <h2 className="text-2xl font-bold text-center text-gray-800 border-b-2 border-yellow-500 pb-2 mb-6">
        {step === 1 ? "🛒 Add Product Details" : "📸 Upload Product Images"}
      </h2>
        <form onSubmit={step === 2 ? handleSubmit : (e) => e.preventDefault()} className="bg-white rounded shadow-lg p-6 md:p-8">
          {step === 1 && (
            <div className="grid gap-4 text-sm grid-cols-1 md:grid-cols-3">
              <div className="md:col-span-3 text-gray-600">
                <p className="font-medium text-lg text-yellow-500">Product Details</p>
              </div>
              
              <div>
                <label htmlFor="name">Product Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
              </div>

              <div>
                <label htmlFor="brand">Brand</label>
                <input type="text" id="brand" name="brand" value={formData.brand} onChange={handleChange} className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
              </div>

              <div>
                <label htmlFor="price">Price</label>
                <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
              </div>

              <div>
                <label htmlFor="category_id">Category</label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="sub_category_id">Sub-Category</label>
                <select
                  id="sub_category_id"
                  name="sub_category_id"
                  value={formData.sub_category_id}
                  onChange={handleChange}
                  className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                  disabled={!formData.category_id}
                >
                  <option value="">Select a sub-category</option>
                  {filteredSubCategories.map((sub) => (
                    <option key={sub.sub_category_id} value={sub.sub_category_id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="stock">Stock Quantity</label>
                <input type="number" id="stock" name="stock" value={formData.stock} onChange={handleChange} className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
              </div>

              <div className="md:col-span-3">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} className="h-20 border mt-1 rounded px-4 w-full bg-gray-50" />
              </div>

              <div>
              <label htmlFor="ratings">Ratings</label>
              <input 
                type="number" 
                id="ratings" 
                name="ratings" 
                value={formData.ratings} 
                onChange={handleChange} 
                className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" 
                min="0" 
                max="5" 
                step="0.1"
              />
            </div>

            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 text-sm grid-cols-1 md:grid-cols-2">
            {/* Cover Image Input */}
            <div>
              <label htmlFor="cover_image">Upload Cover Image</label>
              <input
                type="file"
                id="cover_image"
                name="cover_image"
                accept="image/*"
                onChange={handleChange}
                className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
              />
            </div>
          
            {/* Sub Images Input */}
            <div>
              <label htmlFor="sub_image">Upload Sub Images</label>
              <input
                type="file"
                id="sub_image"
                name="sub_image"
                accept="image/*"
                multiple
                onChange={handleChange}
                className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
              />
            </div>
          </div>
          
          )}

          <div className="flex justify-between mt-6">
            {step > 1 && <button type="button" onClick={handleBack} className="px-6 py-2 bg-gray-500 text-white rounded-md shadow">Back</button>}
            {step < 2 ? <button type="button" onClick={handleNext} className="px-6 py-2 bg-yellow-500 text-white rounded-md shadow">Next</button> : 
              <button type="submit" className="px-6 py-2 bg-green-500 text-white rounded-md shadow">Submit</button>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
