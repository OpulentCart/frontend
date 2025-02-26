import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Store, Package, Users } from "lucide-react";

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-900 text-white p-5 min-h-screen mt-10">
      <h2 className="text-lg font-bold mb-5">Admin Panel</h2>
      <ul>
        <li className="mb-2">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 block p-2 rounded ${
                isActive ? "bg-yellow-400 text-gray-900 font-bold" : "hover:underline"
              }`
            }
          >
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
        </li>
        <li className="mb-2">
          <NavLink
            to="/admin/stores"
            className={({ isActive }) =>
              `flex items-center gap-2 block p-2 rounded ${
                isActive ? "bg-yellow-400 text-gray-900 font-bold" : "hover:underline"
              }`
            }
          >
            <Store size={20} />
            Manage Stores
          </NavLink>
        </li>
        <li className="mb-2">
          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              `flex items-center gap-2 block p-2 rounded ${
                isActive ? "bg-yellow-400 text-gray-900 font-bold" : "hover:underline"
              }`
            }
          >
            <Package size={20} />
            Manage Products
          </NavLink>
        </li>
        <li className="mb-2">
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `flex items-center gap-2 block p-2 rounded ${
                isActive ? "bg-yellow-400 text-gray-900 font-bold" : "hover:underline"
              }`
            }
          >
            <Users size={20} />
            Total Users
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
