import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ContactUs() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("access_token"); // Check if user is logged in

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert("You need to login before sending a message.");
      navigate("/login");
      return;
    }

    console.log("Message Sent:", formData);
    setFormData({ name: "", email: "", subject: "", message: "" });
    alert("Your message has been sent successfully!");
  };

  return (
    <div className="min-h-screen bg-[#0a192f] flex flex-col items-center justify-center py-12">
      <h2 className="text-3xl font-bold text-white mb-6">Contact Us</h2>
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg">
        <div className="mb-4">
          <label className="block text-white">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 mt-1 rounded bg-gray-700 text-white focus:ring-yellow-500 focus:border-yellow-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-white">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 mt-1 rounded bg-gray-700 text-white focus:ring-yellow-500 focus:border-yellow-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-white">Subject</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full p-2 mt-1 rounded bg-gray-700 text-white focus:ring-yellow-500 focus:border-yellow-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-white">Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows="4"
            className="w-full p-2 mt-1 rounded bg-gray-700 text-white focus:ring-yellow-500 focus:border-yellow-500"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-yellow-500 text-black py-2 rounded font-bold hover:bg-yellow-600 transition"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}

export default ContactUs;
