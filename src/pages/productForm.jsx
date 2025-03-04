import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const MultiStepProductForm = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        sub_category_id: "",
        name: "",
        brand: "",
        description: "",
        stock: "",
        price: "",
        main_image: null,
        cover_images: [],
    });

    const [vendorId, setVendorId] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [subCategories, setSubCategories] = useState([]);
    const authToken = useSelector((state) => state.auth.access_token);

    useEffect(() => {
        if (!authToken) return;
    
        const fetchVendorData = async () => {
            try {
                const response = await axios.get("http://localhost:5002/vendors/stores", {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Content-Type": "application/json",
                    },
                });
    
                if (response.data?.vendor?.length > 0) {
                    const firstVendor = response.data.vendor[0];
                    setVendorId(firstVendor.vendor_id);
                    setCategoryId(firstVendor.category_id);
                    console.log("Vendor ID:", firstVendor.vendor_id);
                    console.log("Category ID:", firstVendor.category_id);
                }
            } catch (error) {
                console.error("Error fetching vendor data:", error.response?.data || error.message);
            }
        };
    
        fetchVendorData();
    }, [authToken]);
    
    useEffect(() => {
        if (!categoryId || !authToken) return;
    
        const fetchSubcategories = async () => {
            try {
                console.log("Fetching subcategories for category ID:", categoryId);
                const response = await axios.get("http://localhost:5004/subcategories", {
                    headers: { Authorization: `Bearer ${authToken}` },
                });
    
                console.log("Subcategories Response:", response.data);
    
                if (response.data.success) {
                    const filteredSubcategories = response.data.subCategories.filter(sub => sub.category_id === categoryId);
                    console.log("Filtered Subcategories:", filteredSubcategories);
                    setSubCategories(filteredSubcategories);
                }
            } catch (error) {
                console.error("Error fetching subcategories:", error.response?.data || error.message);
            }
        };
    
        fetchSubcategories();
    }, [categoryId, authToken]);
    

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "main_image" ? files[0] : Array.from(files),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.sub_category_id || isNaN(formData.sub_category_id)) {
            alert("Please select a valid sub-category.");
            return;
        }

        const productData = new FormData();
        productData.append("vendor_id", vendorId);
        productData.append("sub_category_id", formData.sub_category_id);

        Object.entries(formData).forEach(([key, value]) => {
            if (key !== "sub_category_id") {
                if (key === "cover_images") {
                    value.forEach((image) => productData.append("cover_images", image));
                } else {
                    productData.append(key, value);
                }
            }
        });

        try {
            const response = await axios.post("http://localhost:5004/products/create", productData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.data.success) {
                alert("Product added successfully!");
                setFormData({
                    sub_category_id: "",
                    name: "",
                    brand: "",
                    description: "",
                    stock: "",
                    price: "",
                    main_image: null,
                    cover_images: [],
                });
                setStep(1);
            }
        } catch (error) {
            alert("Failed to add product.");
        }
    };

    return (
        <div className="h-screen flex justify-center items-center bg-gray-50 p-4">
            <div className="max-w-3xl w-full bg-white shadow-2xl rounded-lg p-8">
                <div className="grid grid-cols-3 gap-2 mb-6">
                    {["Product Details", "Stock & Pricing", "Upload Images"].map((label, index) => (
                        <div
                            key={index}
                            className={`text-center text-sm font-bold py-2 rounded-lg transition-all ${
                                step === index + 1 ? "bg-yellow-500 text-white" : "bg-gray-300 text-gray-700"
                            }`}
                        >
                            {label}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    {step === 1 && (
                        <div className="grid grid-cols-2 gap-4">
                            <select
                                name="sub_category_id"
                                value={formData.sub_category_id}
                                onChange={(e) => setFormData({ ...formData, sub_category_id: parseInt(e.target.value, 10) })}
                                required
                                className="border rounded-lg p-2 w-full"
                            >
                                <option value="">Select Sub-Category</option>
                                {subCategories.map((sub) => (
                                    <option key={sub.sub_category_id} value={sub.sub_category_id}>
                                        {sub.name}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Product Name"
                                required
                                className="border rounded-lg p-2 w-full"
                            />

                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                placeholder="Brand Name"
                                required
                                className="border rounded-lg p-2 w-full"
                            />

                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Product Description"
                                required
                                className="border rounded-lg p-2 w-full h-24"
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                placeholder="Stock Quantity"
                                required
                                className="border rounded-lg p-2 w-full"
                            />
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="Price"
                                required
                                className="border rounded-lg p-2 w-full"
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <input type="file" name="main_image" onChange={handleFileChange} accept="image/*" required className="border rounded-lg p-2 w-full" />
                            <input type="file" name="cover_images" multiple onChange={handleFileChange} accept="image/*" required className="border rounded-lg p-2 w-full" />
                        </div>
                    )}

                    <div className="flex justify-between mt-6">
                        {step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="bg-gray-400 text-white px-4 py-2 rounded-lg">Back</button>}
                        {step < 3 ? (
                            <button type="button" onClick={() => setStep(step + 1)} className="bg-yellow-500 text-white px-4 py-2 rounded-lg">Next</button>
                        ) : (
                            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg">Submit</button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MultiStepProductForm;
