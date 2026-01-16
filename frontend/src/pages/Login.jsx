import React, { useState } from "react";

export default function Login({ navigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      // Store token in localStorage
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("token_type", data.token_type);
      console.log(data);

      // Redirect to role-specific dashboard
      const roleRoutes = {
        ADMIN: "/admin/dashboard",
        UPLOADER: "/uploader/dashboard",
        REVIEWER: "/reviewer/dashboard",
        APPROVER: "/approver/dashboard",
      };

      const dashboardRoute = roleRoutes[role] || "/dashboard";
      navigate(dashboardRoute);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-black via-gray-900 to-gray-800 flex items-center justify-center text-white">
      <div className="bg-gray-900/60 backdrop-blur-lg p-10 rounded-2xl shadow-lg w-96 border border-blue-600">
        <h1 className="text-3xl font-bold mb-6 text-blue-400 text-center">
          DLM Agent
        </h1>
        {error && <div className="mb-4 text-red-500 font-bold">{error}</div>}
        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded bg-gray-800 border border-blue-500 placeholder-blue-400 text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded bg-gray-800 border border-blue-500 placeholder-blue-400 text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            placeholder="Select Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="p-3 rounded bg-gray-800 border border-blue-500 text-white outline-none"
          >
            <option value="ADMIN">Admin</option>
            <option value="UPLOADER">Uploader</option>
            <option value="REVIEWER">Reviewer</option>
            <option value="APPROVER">Approver</option>
          </select>
          <button
            onClick={handleLogin}
            className="bg-blue-600 hover:bg-blue-500 py-3 rounded font-bold text-white transition-all transform hover:scale-105"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
