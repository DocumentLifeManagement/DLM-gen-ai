import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function AdminDashboard({ navigate }) {
  const userRole = "admin"; // or fetch from localStorage
  const [users, setUsers] = useState([
    { id: 1, name: "Alice", role: "Uploader" },
    { id: 2, name: "Bob", role: "Reviewer" },
    { id: 3, name: "Charlie", role: "Approver" },
  ]);

  // Optional: Remove a user
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to remove this user?")) {
      setUsers(users.filter((user) => user.id !== id));
    }
  };

  return (
    <div className="flex bg-gray-900 min-h-screen text-white">
      <Sidebar role={userRole} />
      <div className="flex-1">
        <Navbar navigate={navigate} userRole={userRole} />
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6 text-blue-400">Admin Dashboard</h1>

          <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-md">
            <table className="min-w-full text-left text-white">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b border-gray-700">ID</th>
                  <th className="px-6 py-3 border-b border-gray-700">Name</th>
                  <th className="px-6 py-3 border-b border-gray-700">Role</th>
                  <th className="px-6 py-3 border-b border-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700 transition">
                    <td className="px-6 py-4 border-b border-gray-700">{user.id}</td>
                    <td className="px-6 py-4 border-b border-gray-700">{user.name}</td>
                    <td className="px-6 py-4 border-b border-gray-700">{user.role}</td>
                    <td className="px-6 py-4 border-b border-gray-700">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md transition"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
