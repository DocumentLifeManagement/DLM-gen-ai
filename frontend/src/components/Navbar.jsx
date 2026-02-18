import React from "react";
import DocumentIcon from "../components/icons/DocumentIcon";

export default function Navbar({ navigate, userRole }) {
  const links = {
    uploader: [{ name: "Dashboard", path: "/uploader" }],
    reviewer: [{ name: "Dashboard", path: "/reviewer" }],
    approver: [{ name: "Dashboard", path: "/approver" }],
    admin: [{ name: "Dashboard", path: "/admin" }],
  };

  return (
    <nav className="flex justify-between items-center px-10 py-5 bg-white/70 dark:bg-gray-900/70 backdrop-blur shadow-md">

      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <DocumentIcon />
        <h1 className="text-xl font-bold text-blue-700 dark:text-blue-400">
          Document Lifecycle Management
        </h1>
      </div>

      <div className="flex items-center gap-6">
        {links[userRole]?.map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition"
          >
            {link.name}
          </button>
        ))}

        <button
          onClick={() => {
            localStorage.removeItem("role");
            navigate("/");
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
