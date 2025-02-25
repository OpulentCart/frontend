import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice"; 
import { FiHeart, FiShoppingCart } from "react-icons/fi";

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { access_token, user_role } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0a192f] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Name */}
          <div className="text-white text-2xl font-bold">
            <Link to="/">Opulent</Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="text-white text-lg hover:text-yellow-400">Home</Link>
            <Link to="/shop" className="text-white text-lg hover:text-yellow-400">Shop</Link>
            {access_token && user_role === "vendor" && (
              <>
                <Link to="/store-form" className="text-white text-lg hover:text-yellow-400">Add Store</Link>
                <Link to="/product-form" className="text-white text-lg hover:text-yellow-400">Add Product</Link>
              </>
            )}
            <Link to="/about" className="text-white text-lg hover:text-yellow-400">About Us</Link>
            <Link to="/contact" className="text-white text-lg hover:text-yellow-400">Contact</Link>

            {access_token && user_role === "admin" && (
              <Link to="/admin" className="text-white text-lg hover:text-yellow-400">Admin Panel</Link>
            )}
          </div>

          {/* Right Side Icons & Auth Controls */}
          <div className="hidden md:flex space-x-4 items-center">
            {access_token && user_role !== "admin" && (
              <>
                <Link to="/wishlist" className="text-white hover:text-yellow-400">
                  <FiHeart size={24} />
                </Link>
                <Link to="/cart" className="text-white hover:text-yellow-400">
                  <FiShoppingCart size={24} />
                </Link>
              </>
            )}

            {access_token ? (
              <>
                <div className="border border-yellow-400 text-yellow-400 px-4 py-2 rounded-lg font-semibold">
                  Role: <span className="capitalize">{user_role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <button className="bg-yellow-400 text-[#0a192f] px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition">
                    Login
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="bg-transparent border-2 border-yellow-400 text-yellow-400 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 hover:text-[#0a192f] transition">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
