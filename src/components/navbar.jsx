import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { FiHeart, FiUser, FiMenu, FiX } from "react-icons/fi";
import { Bell, ShoppingCart } from "lucide-react";
import axios from "axios";
import io from "socket.io-client";
import { jwtDecode } from "jwt-decode";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const authToken = useSelector((state) => state.auth.access_token);
  const user_role = useSelector((state) => state.auth.user_role);
  const [menuOpen, setMenuOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);

  const getUserIdFromToken = useCallback((token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded?.user_id;
    } catch (error) {
      console.error("Error decoding authToken:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (authToken) {
      const newSocket = io("http://localhost:5007", {
        query: { token: authToken },
      });

      newSocket.on("connect", () => console.log("Connected to Socket.IO server"));
      newSocket.on("new_notification", (data) => {
        setNotifications((prev) => [data, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });
      newSocket.on("disconnect", () => console.log("Disconnected from Socket.IO server"));

      setSocket(newSocket);
      return () => newSocket.disconnect();
    }
  }, [authToken]);

  const markNotificationsAsRead = () => {
    setUnreadCount(0);
    setNotifOpen(!notifOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".profile-dropdown")) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0a192f] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button onClick={() => navigate("/")} className="text-white text-2xl font-bold focus:outline-none">
            Opulent
          </button>

          <div className="hidden md:flex space-x-6 text-white font-medium">
            <Link to="/" className={location.pathname === "/" ? "text-yellow-500" : ""}>Home</Link>
            {!(user_role === "vendor" || user_role === "admin") && (
              <Link to="/shop" className={location.pathname === "/shop" ? "text-yellow-500" : ""}>Shop</Link>
            )}
            <Link to="/contact" className={location.pathname === "/contact" ? "text-yellow-500" : ""}>Contact</Link>

            {authToken && user_role === "vendor" && (
              <>
                <Link to="/vendor/store-form" className={location.pathname === "/vendor/store-form" ? "text-yellow-500" : ""}>
                  Store Form
                </Link>
                <Link to="/vendor/dashboard" className={location.pathname === "/vendor/dashboard" ? "text-yellow-500" : ""}>
                  Dashboard
                </Link>
              </>
            )}

            {authToken && user_role === "admin" && (
              <Link to="/admin" className={location.pathname === "/admin" ? "text-yellow-500" : ""}>Admin</Link>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {authToken ? (
              <>
                 {!(user_role === "vendor" || user_role === "admin") && (
                  <button className="text-white hover:text-yellow-500 flex items-center gap-1" onClick={() => navigate("/orders")}>
                    Orders
                  </button>
                )}
                <button className="text-white hover:text-yellow-500" onClick={() => navigate("/wishlist")}>
                  <FiHeart size={22} />
                </button>
                <button className="relative text-white hover:text-yellow-500" onClick={markNotificationsAsRead}>
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Profile Dropdown */}
                <div className="relative profile-dropdown">
                  <button className="text-white hover:text-yellow-500" onClick={() => setProfileOpen(!profileOpen)}>
                    <FiUser size={22} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white text-black shadow-md rounded-md">
                      <Link to="/profile" className="block px-4 py-2 hover:bg-gray-200">
                        View Profile
                      </Link>
                      <button 
                        className="block w-full text-left px-4 py-2 hover:bg-gray-200" 
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white hover:text-yellow-500">Login</Link>
                <Link to="/signup" className="text-white hover:text-yellow-500">Sign Up</Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-white">
              {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {notifOpen && (
        <div className="absolute top-16 right-4 bg-white shadow-md rounded-md p-4 w-64">
          {notifications.length === 0 ? (
            <p className="text-gray-500">No new notifications</p>
          ) : (
            notifications.map((notif, index) => (
              <p key={index} className="text-black">{notif.message}</p>
            ))
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
