import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { FiHeart, FiUser, FiMenu, FiX } from "react-icons/fi";
import { Bell } from "lucide-react";
import axios from "axios";
import io from "socket.io-client";

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

  // Fetch notifications when component mounts
  useEffect(() => {
    if (authToken) {
      const newSocket = io("http://localhost:5008");
      setSocket(newSocket);
      // Handle new notifications
      newSocket.on("newNotification", (newNotif) => {
        setNotifications((prevNotifications) => [...prevNotifications, newNotif]);
        setUnreadCount((prevCount) => prevCount + 1);
      });
      
      axios
        .get("http://localhost:5008/notifications", {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        .then((response) => {
          const fetchedNotifications = response.data.notifications || [];
          setNotifications(fetchedNotifications);
          setUnreadCount(fetchedNotifications.filter((notif) => !notif.is_read).length);
        })
        .catch((error) => {
          console.error("Error fetching notifications:", error);
        });

      return () => newSocket.disconnect();
    }
  }, [authToken]);

  // Mark notification as read/unread
  const markAllAsRead = async (notifId) => {
    try {
      const response = await axios.put(
        "http://localhost:5008/notifications",{},
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

  // Handle dropdown open and mark all as read
  const toggleNotificationDropdown = async () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen && unreadCount > 0) {
      await markAllAsRead();
    }
  };

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

          {/* NavLinks */}
          <div className="hidden md:flex space-x-6 text-white font-medium">
            <Link to="/" className={location.pathname === "/" ? "text-yellow-500" : ""}>Home</Link>
            <Link to="/shop" className={location.pathname === "/shop" ? "text-yellow-500" : ""}>Shop</Link>
            <Link to="/about" className={location.pathname === "/about" ? "text-yellow-500" : ""}>About</Link>
            <Link to="/contact" className={location.pathname === "/contact" ? "text-yellow-500" : ""}>Contact</Link>
            
            {authToken && user_role === "admin" && (
              <Link to="/admin" className={location.pathname === "/admin" ? "text-yellow-500" : ""}>Admin</Link>
            )}

            {/* Vendor Links */}
            {authToken && user_role === "vendor" && (
              <>
                <Link to="/vendor/product-form" className={location.pathname === "/product-form" ? "text-yellow-500" : ""}>
                  Product Form
                </Link>
                <Link to="/vendor/store-form" className={location.pathname === "/vendor-form" ? "text-yellow-500" : ""}>
                  Vendor Form
                </Link>
              </>
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
            {/* Notification Dropdown */}
            {authToken && (
              <div className="relative">
                <button className="icon-link relative" onClick={toggleNotificationDropdown}>
                  <Bell size={24} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
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
            )}

            {authToken ? (
              <div className="relative group">
                <button className="icon-link flex items-center space-x-2">
                  <FiUser size={26} />
                </button>
                <div className="absolute right-0 mt-2 w-40 bg-white text-black shadow-lg rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">
                    Profile
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

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#0a192f] text-white text-center p-4">
            <Link to="/" className="block py-2" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/shop" className="block py-2" onClick={() => setMenuOpen(false)}>Shop</Link>
            <Link to="/about" className="block py-2" onClick={() => setMenuOpen(false)}>About</Link>
            <Link to="/contact" className="block py-2" onClick={() => setMenuOpen(false)}>Contact</Link>

            {authToken && user_role === "admin" && (
              <Link to="/admin" className="block py-2" onClick={() => setMenuOpen(false)}>Admin</Link>
            )}

            {authToken && user_role === "vendor" && (
              <>
                <Link to="/vendor/product-form" className="block py-2" onClick={() => setMenuOpen(false)}>Product Form</Link>
                <Link to="/vendor/store-form" className="block py-2" onClick={() => setMenuOpen(false)}>Vendor Form</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
