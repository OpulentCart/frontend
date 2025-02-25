import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-5 absolute">
      <h2 className="text-lg font-bold mb-5">Admin Panel</h2>
      <ul>
        <li className="mb-2">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `block p-2 rounded ${isActive ? "bg-yellow-400 text-gray-900 font-bold" : "hover:underline"}`
            }
          >
            Dashboard
          </NavLink>
        </li>
        <li className="mb-2">
          <NavLink
            to="/admin/stores"
            className={({ isActive }) =>
              `block p-2 rounded ${isActive ? "bg-yellow-400 text-gray-900 font-bold" : "hover:underline"}`
            }
          >
            Manage Stores
          </NavLink>
        </li>
        <li className="mb-2">
          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              `block p-2 rounded ${isActive ? "bg-yellow-400 text-gray-900 font-bold" : "hover:underline"}`
            }
          >
            Manage Products
          </NavLink>
        </li>
        <li className="mb-2">
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `block p-2 rounded ${isActive ? "bg-yellow-400 text-gray-900 font-bold" : "hover:underline"}`
            }
          >
            Total Users
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
