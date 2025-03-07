import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { FaSortUp, FaSortDown } from "react-icons/fa";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [roleFilter, setRoleFilter] = useState("customer");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const usersPerPage = 5;

  const authToken = useSelector((state) => state.auth.access_token);

  useEffect(() => {
    if (authToken) fetchUsers();
  }, [authToken]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://98.81.204.61:8000/api/auth/all-users/", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUsers(res.data.users);
      filterUsers(res.data.users, roleFilter);
    } catch (error) {
      console.error("Error fetching users:", error.response?.data || error);
    }
    setLoading(false);
  };

  const filterUsers = (allUsers, role) => {
    const filtered = allUsers.filter((user) => user.role === role);
    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    filterUsers(users, roleFilter);
  }, [roleFilter, users]);

  const sortUsersById = () => {
    const sortedUsers = [...filteredUsers].sort((a, b) =>
      sortOrder === "asc" ? a.id - b.id : b.id - a.id
    );
    setFilteredUsers(sortedUsers);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="flex flex-col h-screen p-6 bg-gray-50 mt-15">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Users List</h1>

      {/* Tabs for Role Selection */}
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-6 py-2 rounded-lg text-white font-semibold ${
            roleFilter === "customer" ? "bg-blue-600" : "bg-gray-400"
          }`}
          onClick={() => setRoleFilter("customer")}
        >
          Customers
        </button>
        <button
          className={`px-6 py-2 rounded-lg text-white font-semibold ${
            roleFilter === "vendor" ? "bg-blue-600" : "bg-gray-400"
          }`}
          onClick={() => setRoleFilter("vendor")}
        >
          Vendors
        </button>
      </div>

      {/* Table with Loader */}
      <div className="overflow-x-auto shadow-lg rounded-lg">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <table className="min-w-full bg-white border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-gray-800 text-white text-left">
                <th className="py-3 px-6 border cursor-pointer flex items-center gap-2" onClick={sortUsersById}>
                  ID {sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />}
                </th>
                <th className="py-3 px-6 border">Email</th>
                <th className="py-3 px-6 border">Role</th>
                <th className="py-3 px-6 border">Address</th>
                <th className="py-3 px-6 border">Phone Number</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user, index) => (
                  <tr key={user.id} className={`border ${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition`}>
                    <td className="py-3 px-6">{user.id}</td>
                    <td className="py-3 px-6">{user.email}</td>
                    <td className="py-3 px-6">{user.role}</td>
                    <td className="py-3 px-6">{user.address ? user.address : "Address is not added"}</td>
                    <td className="py-3 px-6">{user.phone ? user.phone : "Phone number is not added"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-600">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 space-x-2">
        <button
          className={`px-4 py-2 rounded-lg ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 text-white"}`}
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        {currentPage > 2 && <span className="px-2 py-1">...</span>}

        {[...Array(totalPages)].map((_, i) => {
          if (i + 1 === 1 || i + 1 === totalPages || (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)) {
            return (
              <button
                key={i}
                className={`px-4 py-2 rounded-lg ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-300"}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            );
          }
          return null;
        })}

        {currentPage < totalPages - 1 && <span className="px-2 py-1">...</span>}

        <button
          className={`px-4 py-2 rounded-lg ${
            currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 text-white"
          }`}
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminUsers;
