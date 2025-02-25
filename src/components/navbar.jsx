import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice"; // Import Redux logout action
import { FiHeart, FiShoppingCart } from "react-icons/fi"; // Import icons

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get authentication state from Redux
  const { isAuthenticated, userRole } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        console.error("No refresh token found");
        return;
      }

      // Refresh access token before logging out
      const refreshResponse = await fetch("http://127.0.0.1:8000/api/auth/refresh/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        localStorage.setItem("access_token", refreshData.access);
      } else {
        console.error("Failed to refresh access token");
        dispatch(logout()); // Logout via Redux
        navigate("/");
        return;
      }

      // Proceed with logout
      const response = await fetch("http://127.0.0.1:8000/api/auth/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        console.log("Logout successful");
        dispatch(logout()); // Update Redux state
        navigate("/");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
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
            <Link to="/" className="text-white text-lg hover:text-yellow-400">
              Home
            </Link>
            <Link to="/shop" className="text-white text-lg hover:text-yellow-400">
              Shop
            </Link>
            {isAuthenticated && userRole === "vendor" && (
              <>
                <Link to="/store-form" className="text-white text-lg hover:text-yellow-400">
                  Add Store
                </Link>
                <Link to="/product-form" className="text-white text-lg hover:text-yellow-400">
                  Add Product
                </Link>
              </>
            )}
            <Link to="/about" className="text-white text-lg hover:text-yellow-400">
              About Us
            </Link>
            <Link to="/contact" className="text-white text-lg hover:text-yellow-400">
              Contact
            </Link>

            {/* Conditionally Show Admin Panel Link */}
            {isAuthenticated && userRole === "admin" && (
              <Link to="/admin" className="text-white text-lg hover:text-yellow-400">
                Admin Panel
              </Link>
            )}
          </div>

          {/* Right Side Icons & Auth Controls */}
          <div className="hidden md:flex space-x-4 items-center">
            {/* Show Cart & Wishlist Icons Only If Not Admin */}
            {isAuthenticated && userRole !== "admin" && (
              <>
                <Link to="/wishlist" className="text-white hover:text-yellow-400">
                  <FiHeart size={24} />
                </Link>
                <Link to="/cart" className="text-white hover:text-yellow-400">
                  <FiShoppingCart size={24} />
                </Link>
              </>
            )}

            {/* Show Role & Logout Button */}
            {isAuthenticated ? (
              <>
                <div className="border border-yellow-400 text-yellow-400 px-4 py-2 rounded-lg font-semibold">
                  Role: <span className="capitalize">{userRole}</span>
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

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button className="text-white focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
