import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { FiHeart, FiUser, FiMenu, FiX, FiSearch, FiHome, FiShoppingBag, FiMail, FiPackage } from "react-icons/fi";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const getUserIdFromToken = useCallback((token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded?.user_id;
    } catch (error) {
      console.error("Error decoding authToken:", error);
      return null;
    }
  }, []);

  // Debounce function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Search API call
  const searchProducts = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await axios.get(`http://localhost:5004/products/search/${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setSearchResults(response.data.results || []);
    } catch (error) {
      console.error("Error searching products:", error);
      setSearchResults([]);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => searchProducts(query), 300),
    [authToken]
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults([]);
      setSearchQuery("");
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get("http://localhost:5008/notifications", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const fetchedNotifications = response.data.notifications || [];
      setNotifications(fetchedNotifications);
      setUnreadCount(fetchedNotifications.filter((notif) => !notif.is_read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    if (authToken) {
      const newSocket = io("http://localhost:5008");
      setSocket(newSocket);

      newSocket.on("newNotification", (newNotif) => {
        fetchNotifications();
      });

      fetchNotifications();
      
      return () => newSocket.disconnect();
    }
  }, [authToken]);

  const markAllAsRead = async (notifId) => {
    try {
      const response = await axios.put(
        "http://localhost:5008/notifications",
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data.success) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notif) =>
            notif.id === notifId ? { ...notif, read: true } : notif
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const toggleNotificationDropdown = async () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen && unreadCount > 0) {
      fetchNotifications();
      await markAllAsRead();
      setUnreadCount(0);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

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
          <button onClick={() => navigate("/")} className="text-white text-2xl font-bold focus:outline-none ml-7 cursor-pointer hover:text-yellow-600">
            Opulent Cart
          </button>

          {/* Search Bar */}
          <div className="relative hidden md:block w-1/3 mx-4">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-yellow-500 transition-colors"
                />
              </div>
              {searchResults.length > 0 && searchQuery && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <Link
                      key={index}
                      to={`/product/${result.id}`}
                      className="block px-4 py-2 text-black hover:bg-gray-100"
                      onClick={() => {
                        setSearchResults([]);
                        setSearchQuery("");
                      }}
                    >
                      {result.name}
                    </Link>
                  ))}
                </div>
              )}
            </form>
          </div>

          <div className="hidden md:flex space-x-6 text-white font-medium items-center">
            <Link to="/" className={`flex items-center gap-1 hover:text-yellow-600 ${location.pathname === "/" ? "text-yellow-500" : ""}`}>
              <FiHome size={18} /> Home
            </Link>
            {!(user_role === "vendor" || user_role === "admin") && (
              <Link to="/shop" className={`flex items-center gap-1 hover:text-yellow-600 ${location.pathname === "/shop" ? "text-yellow-500" : ""}`}>
                <FiShoppingBag size={18} /> Shop
              </Link>
            )}
            <Link to="/contact" className={`flex items-center gap-1 hover:text-yellow-600 ${location.pathname === "/contact" ? "text-yellow-500" : ""}`}>
              <FiMail size={18} /> Contact
            </Link>

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
                    <FiPackage size={18} /> Orders
                  </button>
                )}
                <button className="text-white hover:text-yellow-500" onClick={() => navigate("/wishlist")}>
                  <FiHeart size={22} />
                </button>
                
                <div className="relative">
                  <button className="relative text-white hover:text-yellow-500" onClick={toggleNotificationDropdown}>
                    <Bell size={22} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white text-black shadow-lg rounded-lg overflow-hidden">
                      {notifications.length > 0 ? (
                        <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                          {notifications.map((notif, index) => (
                            <li key={index} className={`px-4 py-2 text-sm hover:bg-gray-100 ${notif.read ? "text-gray-500" : "font-bold"}`}>
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
    </nav>
  );
}

export default Navbar;