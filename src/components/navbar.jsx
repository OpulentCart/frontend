import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { FiHeart, FiUser, FiMenu, FiX, FiShoppingCart } from "react-icons/fi";
import { Bell } from "lucide-react";
import axios from "axios";
import io from "socket.io-client";
import {jwtDecode} from "jwt-decode";

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
  const [cartId, setCartId] = useState(null);

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

      newSocket.on("connect", () => {
        console.log("Connected to Socket.IO server");
      });

      newSocket.on("new_notification", (data) => {
        setNotifications((prev) => [data, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from Socket.IO server");
      });

      setSocket(newSocket);
      return () => newSocket.disconnect();
    }
  }, [authToken]);

  const markNotificationsAsRead = () => {
    setUnreadCount(0);
    setNotifOpen(!notifOpen);
  };

  const fetchOrCreateCart = useCallback(async () => {
    if (!authToken) return;

    const userId = getUserIdFromToken(authToken);
    if (!userId) return;

    const storedCartId = sessionStorage.getItem("cartId");
    if (storedCartId) {
      setCartId(storedCartId);
      return;
    }

    try {
      const response = await axios.get("http://localhost:5007/carts", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.data.cartId) {
        setCartId(response.data.cartId);
        sessionStorage.setItem("cartId", response.data.cartId);
      } else {
        const createCartResponse = await axios.post(
          "http://localhost:5007/carts",
          { user_id: userId },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        setCartId(createCartResponse.data.cartId);
        sessionStorage.setItem("cartId", createCartResponse.data.cartId);
      }
    } catch (error) {
      console.error("Error fetching/creating cart:", error.response?.data || error.message);
    }
  }, [authToken, getUserIdFromToken]);

  useEffect(() => {
    fetchOrCreateCart();
  }, [fetchOrCreateCart]);

  const handleShopClick = async () => {
    await fetchOrCreateCart();
    navigate("/shop");
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0a192f] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="text-white text-2xl font-bold">
            <button onClick={() => navigate("/")} className="focus:outline-none">
              Opulent
            </button>
          </div>

          <div className="hidden md:flex space-x-6 text-white font-medium">
            <Link to="/" className={location.pathname === "/" ? "text-yellow-500" : ""}>
              Home
            </Link>
            <button onClick={handleShopClick} className={location.pathname === "/shop" ? "text-yellow-500" : ""}>
              Shop
            </button>
            <Link to="/about" className={location.pathname === "/about" ? "text-yellow-500" : ""}>
              About
            </Link>
            <Link to="/contact" className={location.pathname === "/contact" ? "text-yellow-500" : ""}>
              Contact
            </Link>
            {authToken && (
              <Link to="/dashboard" className={location.pathname === "/dashboard" ? "text-yellow-500" : ""}>
                Dashboard
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {authToken ? (
              <>
                <button className="text-white hover:text-yellow-500" onClick={() => navigate("/wishlist")}>
                  <FiHeart size={22} />
                </button>
                <button className="text-white hover:text-yellow-500" onClick={() => navigate("/cart")}>
                  <FiShoppingCart size={22} />
                </button>
                <button className="relative text-white hover:text-yellow-500" onClick={markNotificationsAsRead}>
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button className="text-white hover:text-yellow-500" onClick={() => navigate("/profile")}>
                  <FiUser size={22} />
                </button>
                <button className="text-white hover:text-yellow-500" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white hover:text-yellow-500">
                  Login
                </Link>
                <Link to="/register" className="text-white hover:text-yellow-500">
                  Sign Up
                </Link>
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
              <p key={index} className="text-black">
                {notif.message}
              </p>
            ))
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
