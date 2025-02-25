import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/sidebar";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5004/admin/users");
      setUsers(res.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  return (
    <div className="flex h-screen mt-5">
      <Sidebar />
      <div className="flex-1 bg-gray-100 p-10 ml-64">
        <h1 className="text-2xl font-bold mb-4">Total Users</h1>

        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="py-2 px-4 border">ID</th>
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">Email</th>
              <th className="py-2 px-4 border">Role</th>
              <th className="py-2 px-4 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="border">
                  <td className="py-2 px-4">{user.id}</td>
                  <td className="py-2 px-4">{user.name}</td>
                  <td className="py-2 px-4">{user.email}</td>
                  <td className="py-2 px-4">{user.role}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 text-white rounded ${user.status === "active" ? "bg-green-500" : "bg-red-500"}`}>
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-600">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
