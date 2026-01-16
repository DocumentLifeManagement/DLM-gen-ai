import React from "react";

export default function Navbar({ navigate, userRole }) {
  const links = {
    uploader: [{ name: "Dashboard", path: "/uploader" }],
    reviewer: [
      { name: "Dashboard", path: "/reviewer" },
      { name: "Docs", path: "/reviewer/document/1" },
    ],
    approver: [{ name: "Dashboard", path: "/approver" }],
    admin: [{ name: "Dashboard", path: "/admin" }],
  };

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 flex justify-between items-center shadow-lg">
      <div className="text-xl font-bold cursor-pointer" onClick={() => navigate("/")}>
        DLM Agent
      </div>
      <div className="flex space-x-4">
        {links[userRole]?.map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className="hover:bg-white/20 px-3 py-2 rounded transition"
          >
            {link.name}
          </button>
        ))}
        <button
          onClick={() => {
            localStorage.removeItem("role");
            navigate("/");
          }}
          className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
