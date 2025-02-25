import React from "react";
import Sidebar from "../components/sidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-5 bg-gray-100 h-full overflow-auto">
        <Outlet /> {/* This will render the selected route's content */}
      </div>
    </div>
  );
};

export default AdminLayout;
