import React, { useState } from "react";

const ProductForm = () => {
  const [step, setStep] = useState(1);
  const steps = ["Product Details", "Upload Images"];
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    subCategory: "",
    description: "",
    stockQuantity: "",
    mainImages: [],
    coverImage: null,
  });

  const categories = ["Electronics", "Fashion", "Groceries", "Health", "Home & Living"];
  const subCategories = ["Mobiles", "Laptops", "Shoes", "Clothing", "Furniture"];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: files ? files : value,
    }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    setStep((prev) => prev + 1);
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting Product:", formData);
    alert("Product submitted successfully!");
  };

  return (
    <div className="mt-10 min-h-screen p-6 bg-gray-100 flex items-center justify-center">
      <div className="container max-w-screen-lg mx-auto">
        <h2 className="font-semibold text-xl text-yellow-500">
          {step === 1 ? "Product Details" : "Upload Images"}
        </h2>
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
          {step === 1 && (
            <>
              <div className="grid gap-4 text-sm grid-cols-1 lg:grid-cols-3">
                <div className="text-gray-600">
                  <p className="font-medium text-lg text-yellow-500">Product Details</p>
                </div>
                <div className="lg:col-span-2 grid gap-4 text-sm grid-cols-1 md:grid-cols-5">
                  <div className="md:col-span-5">
                    <label htmlFor="name">Product Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                    />
                  </div>
                  <div className="md:col-span-5">
                    <label htmlFor="price">Price</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                    />
                  </div>
                  <div className="md:col-span-5">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-5">
                    <label htmlFor="subCategory">Sub-Category</label>
                    <select
                      id="subCategory"
                      name="subCategory"
                      value={formData.subCategory}
                      onChange={handleChange}
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                    >
                      <option value="">Select a sub-category</option>
                      {subCategories.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-5">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="h-20 border mt-1 rounded px-4 w-full bg-gray-50"
                    />
                  </div>
                  <div className="md:col-span-5">
                    <label htmlFor="stockQuantity">Stock Quantity</label>
                    <input
                      type="number"
                      id="stockQuantity"
                      name="stockQuantity"
                      value={formData.stockQuantity}
                      onChange={handleChange}
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="md:col-span-5">
                <label htmlFor="mainImages">Upload Main Images</label>
                <input
                  type="file"
                  id="mainImages"
                  name="mainImages"
                  accept="image/*"
                  multiple
                  onChange={handleChange}
                  className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                />
              </div>
              <div className="md:col-span-5">
                <label htmlFor="coverImage">Upload Cover Image</label>
                <input
                  type="file"
                  id="coverImage"
                  name="coverImage"
                  accept="image/*"
                  onChange={handleChange}
                  className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                />
              </div>
            </>
          )}

          <div className="flex justify-between mt-6">
            {step > 1 && (
              <button type="button" onClick={handleBack} className="px-6 py-2 bg-gray-500 text-white rounded-md shadow hover:bg-gray-600 transition">Back</button>
            )}
            {step < 2 ? (
              <button type="button" onClick={handleNext} className="px-6 py-2 bg-yellow-500 text-white rounded-md shadow hover:bg-yellow-600 transition">Next</button>
            ) : (
              <button type="submit" className="px-6 py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600 transition">Submit</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
