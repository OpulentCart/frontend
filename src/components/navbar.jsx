import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { FiHeart, FiUser, FiMenu, FiX } from "react-icons/fi";
import { Bell } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const authToken = useSelector((state) => state.auth.access_token);
  const user_role = useSelector((state) => state.auth.user_role);
  const notifications = useSelector((state) => state.notifications?.list || []);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    sessionStorage.removeItem("refresh_token");
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0a192f] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Name */}
          <div className="text-white text-2xl font-bold">
            <button onClick={() => navigate("/")} className="focus:outline-none">
              Opulent
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            <button
              onClick={() => navigate("/")}
              className={`nav-link ${location.pathname === "/" ? "text-yellow-500 border-b-2 border-yellow-500" : ""}`}
            >
              Home
            </button>
            <Link
              to="/shop"
              className={`nav-link ${location.pathname === "/shop" ? "text-yellow-500 border-b-2 border-yellow-500" : ""}`}
            >
              Shop
            </Link>

            {authToken && user_role === "vendor" && (
              <>
                <Link
                  to="/store-form"
                  className={`nav-link ${location.pathname === "/store-form" ? "text-yellow-500 border-b-2 border-yellow-500" : ""}`}
                >
                  Add Store
                </Link>
                <Link
                  to="/product-form"
                  className={`nav-link ${location.pathname === "/product-form" ? "text-yellow-500 border-b-2 border-yellow-500" : ""}`}
                >
                  Add Product
                </Link>
              </>
            )}

            <Link
              to="/about"
              className={`nav-link ${location.pathname === "/about" ? "text-yellow-500 border-b-2 border-yellow-500" : ""}`}
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className={`nav-link ${location.pathname === "/contact" ? "text-yellow-500 border-b-2 border-yellow-500" : ""}`}
            >
              Contact
            </Link>

            {authToken && user_role === "admin" && (
              <Link
                to="/admin"
                className={`nav-link ${location.pathname === "/admin" ? "text-yellow-500 border-b-2 border-yellow-500" : ""}`}
              >
                Admin Panel
              </Link>
            )}
          </div>

          {/* Right Side Icons & Auth Controls */}
          <div className="hidden md:flex items-center space-x-5">
            {authToken && user_role !== "admin" && (
              <Link to="/wishlist" className="icon-link">
                <FiHeart size={24} />
              </Link>
            )}

            {/* Notification Dropdown */}
            {authToken && (
              <div className="relative">
                <button className="icon-link relative" onClick={() => setNotifOpen(!notifOpen)}>
                  <Bell size={24} />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {/* Dropdown Content */}
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white text-black shadow-lg rounded-lg overflow-hidden">
                    {notifications.length > 0 ? (
                      <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                        {notifications.map((notif, index) => (
                          <li key={index} className="px-4 py-2 text-sm hover:bg-gray-100">
                            {notif.message}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 text-gray-500 text-center">No Notifications</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {authToken ? (
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
            ) : (
              <>
                <Link to="/login">
                  <button className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition duration-200 shadow-md">
                    Login
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="bg-gray-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-500 transition duration-200 shadow-md">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
