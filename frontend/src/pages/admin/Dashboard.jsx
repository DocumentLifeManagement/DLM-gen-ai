import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function AdminDashboard({ navigate }) {
  const userRole = "admin";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
    setupWebSocket();
  }, []);

  /* -----------------------------
     INITIAL FETCH FROM BACKEND
  ------------------------------*/
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        "http://localhost:8000/api/v1/admin/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
     REAL-TIME WEBSOCKET
  ------------------------------*/
  const setupWebSocket = () => {
    const socket = new WebSocket("ws://localhost:8000/ws/admin");

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "USER_UPDATE":
          setUsers((prev) => {
            const exists = prev.find(
              (u) => u.id === message.payload.id
            );
            if (exists) {
              return prev.map((u) =>
                u.id === message.payload.id
                  ? message.payload
                  : u
              );
            } else {
              return [...prev, message.payload];
            }
          });
          break;

        case "USER_DELETE":
          setUsers((prev) =>
            prev.filter((u) => u.id !== message.payload.id)
          );
          break;

        case "ROLE_CHANGE":
          setUsers((prev) =>
            prev.map((u) =>
              u.id === message.payload.id
                ? { ...u, role: message.payload.role }
                : u
            )
          );
          break;

        default:
          break;
      }
    };

    socket.onerror = () => {
      console.error("WebSocket error");
    };

    return () => socket.close();
  };

  /* -----------------------------
     DELETE USER
  ------------------------------*/
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this user?"))
      return;

    try {
      const token = localStorage.getItem("access_token");

      // Optimistic UI
      setUsers(users.filter((u) => u.id !== id));

      await fetch(
        `http://localhost:8000/api/v1/admin/users/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      fetchUsers(); // rollback if error
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-10">
        Loading Admin Panel...
      </div>
    );
  }

  return (
    <div className="flex bg-gray-900 min-h-screen text-white">
      <Sidebar role={userRole} />

      <div className="flex-1">
        <Navbar navigate={navigate} userRole={userRole} />

        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6 text-blue-400">
            Admin Dashboard
          </h1>

          {error && (
            <p className="text-red-400 mb-4">{error}</p>
          )}

          <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-md">
            <table className="min-w-full text-left text-white">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b border-gray-700">
                    ID
                  </th>
                  <th className="px-6 py-3 border-b border-gray-700">
                    Name
                  </th>
                  <th className="px-6 py-3 border-b border-gray-700">
                    Role
                  </th>
                  <th className="px-6 py-3 border-b border-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 border-b border-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-700 transition"
                  >
                    <td className="px-6 py-4 border-b border-gray-700">
                      {user.id}
                    </td>

                    <td className="px-6 py-4 border-b border-gray-700">
                      {user.name}
                    </td>

                    <td className="px-6 py-4 border-b border-gray-700">
                      {user.role}
                    </td>

                    <td className="px-6 py-4 border-b border-gray-700">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          user.status === "ACTIVE"
                            ? "bg-green-600"
                            : "bg-red-600"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

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

            {users.length === 0 && (
              <p className="text-gray-400 p-4">
                No users found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
