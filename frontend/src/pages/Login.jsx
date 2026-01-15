import React, { useState } from "react";

const fakeUsers = [
  { email: "uploader@example.com", password: "1234", role: "uploader" },
  { email: "reviewer@example.com", password: "1234", role: "reviewer" },
  { email: "approver@example.com", password: "1234", role: "approver" },
  { email: "admin@example.com", password: "1234", role: "admin" },
];

export default function Login({ navigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("uploader");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const user = fakeUsers.find(
      (u) => u.email === email && u.password === password && u.role === role
    );
    if (user) {
      localStorage.setItem("role", role);
      localStorage.setItem("email", email);
      switch (role) {
        case "uploader":
          navigate("/uploader");
          break;
        case "reviewer":
          navigate("/reviewer");
          break;
        case "approver":
          navigate("/approver");
          break;
        case "admin":
          navigate("/admin");
          break;
        default:
          navigate("/");
      }
    } else {
      setError("Invalid credentials or role");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-black via-gray-900 to-gray-800 flex items-center justify-center text-white">
      <div className="bg-gray-900/60 backdrop-blur-lg p-10 rounded-2xl shadow-lg w-96 border border-blue-600">
        <h1 className="text-3xl font-bold mb-6 text-blue-400 text-center">DLM Agent</h1>
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
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="p-3 rounded bg-gray-800 border border-blue-500 text-white outline-none"
          >
            <option value="uploader">Uploader</option>
            <option value="reviewer">Reviewer</option>
            <option value="approver">Approver</option>
            <option value="admin">Admin</option>
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
