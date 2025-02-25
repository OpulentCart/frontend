import React from "react";
import Sidebar from "../components/sidebar"; // Updated import path
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-5 bg-gray-100 overflow-auto">
        <Outlet /> {/* This renders the selected admin route */}
      </div>
    </div>
  );
};

export default AdminLayout;
