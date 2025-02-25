import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-[#0a192f] text-white py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Us */}
          <div>
            <h3 className="text-xl font-bold mb-4">About Us</h3>
            <p className="text-gray-400">
              E-Shop is a multi-vendor marketplace providing a seamless shopping
              experience with AI-powered recommendations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-yellow-400 transition">Home</Link></li>
              <li><Link to="/shop" className="hover:text-yellow-400 transition">Shop</Link></li>
              <li><Link to="/vendors" className="hover:text-yellow-400 transition">Vendors</Link></li>
              <li><Link to="/contact" className="hover:text-yellow-400 transition">Contact</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-xl font-bold mb-4">Customer Support</h3>
            <p className="text-gray-400">Email: support@eshop.com</p>
            <p className="text-gray-400">Phone: +1 234 567 890</p>
            <p className="text-gray-400">Mon - Fri: 9:00 AM - 6:00 PM</p>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-xl font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition">
                <FaFacebook size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition">
                <FaTwitter size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition">
                <FaInstagram size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition">
                <FaLinkedin size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="text-center text-gray-500 text-sm mt-10 border-t border-gray-700 pt-4">
          &copy; {new Date().getFullYear()} E-Shop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
