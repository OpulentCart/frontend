import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { FiHeart, FiShoppingCart, FiUser, FiMenu, FiX } from "react-icons/fi";
import { Bell } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authToken = useSelector((state) => state.auth.access_token);
  const notifications = useSelector((state) => state.notifications?.count || 0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Extract user_role from authToken
  let user_role = null;
  if (authToken) {
    try {
      const decodedToken = JSON.parse(atob(authToken.split(".")[1])); // Decoding JWT
      user_role = decodedToken.user_role; // Assuming user_role is stored in JWT payload
    } catch (error) {
      console.error("Error decoding auth token:", error);
    }
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0a192f] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Brand Name */}
          <div className="text-white text-2xl font-bold">
            <Link to="/">Opulent</Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/shop" className="nav-link">Shop</Link>
            {authToken && user_role === "vendor" && (
              <>
                <Link to="/store-form" className="nav-link">Add Store</Link>
                <Link to="/product-form" className="nav-link">Add Product</Link>
              </>
            )}
            <Link to="/about" className="nav-link">About Us</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
            {authToken && user_role === "admin" && (
              <Link to="/admin" className="nav-link">Admin Panel</Link>
            )}
          </div>

          {/* Right Side Icons & Auth Controls */}
          <div className="hidden md:flex items-center space-x-5">
            {authToken && user_role !== "admin" && (
              <>
                <Link to="/wishlist" className="icon-link">
                  <FiHeart size={24} />
                </Link>
                <Link to="/cart" className="icon-link relative">
                  <FiShoppingCart size={24} />
                </Link>
              </>
            )}

            {/* Notification Icon */}
            {authToken && (
              <Link to="/notifications" className="icon-link relative">
                <Bell size={24} />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {notifications}
                  </span>
                )}
              </Link>
            )}

            {/* Profile Icon & Dropdown */}
            {authToken && (
              <div className="relative group">
                <button className="icon-link flex items-center space-x-2">
                  <FiUser size={26} />
                </button>
                <div className="absolute right-0 mt-2 w-40 bg-white text-black shadow-lg rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">
                    See Details
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-red-500 hover:text-white transition"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[#0a192f] shadow-lg py-4">
          <div className="flex flex-col items-center space-y-4">
            <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/shop" className="nav-link" onClick={() => setMenuOpen(false)}>Shop</Link>
            {authToken && user_role === "vendor" && (
              <>
                <Link to="/store-form" className="nav-link" onClick={() => setMenuOpen(false)}>Add Store</Link>
                <Link to="/product-form" className="nav-link" onClick={() => setMenuOpen(false)}>Add Product</Link>
              </>
            )}
            <Link to="/about" className="nav-link" onClick={() => setMenuOpen(false)}>About Us</Link>
            <Link to="/contact" className="nav-link" onClick={() => setMenuOpen(false)}>Contact</Link>
            {authToken && user_role === "admin" && (
              <Link to="/admin" className="nav-link" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
            )}

            {authToken ? (
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition duration-200 shadow-md hover:shadow-lg"
              >
                Logout
              </button>
            ) : (
              <>
              <div className="flex flex-col space-y-2">
                <Link to="/login">
                  <button className="btn-primary w-32">Login</button>
                </Link>
                <Link to="/signup">
                  <button className="btn-secondary w-32">Sign Up</button>
                </Link>
              </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
