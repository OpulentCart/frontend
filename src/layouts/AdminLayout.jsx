import React from "react";
import Sidebar from "../pages/admin/sidebar"; // Ensure correct import
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar - No fixed positioning */}
      <div className="w-64 h-screen bg-gray-800 mt-15">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-5 bg-gray-100">
        <Outlet /> {/* Admin pages will be rendered here */}
      </div>
    </div>
  );
};

export default AdminLayout;
