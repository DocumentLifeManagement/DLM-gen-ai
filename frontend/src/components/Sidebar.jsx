import React from "react";
import { useRouter } from "../routerr/useRouter.jsx";

export default function Sidebar({ role }) {
  const { currentPath, navigate } = useRouter();

  const links = {
    uploader: [
      { path: "/uploader", label: "Uploader Dashboard" },
    ],
    reviewer: [
      { path: "/reviewer", label: "Reviewer Dashboard" },
    ],
    approver: [
      { path: "/approver", label: "Approver Dashboard" },
    ],
    admin: [
      { path: "/admin", label: "Admin Dashboard" },
    ],
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-900 text-white h-full min-h-screen">
      {links[role]?.map((link) => (
        <button
          key={link.path}
          onClick={() => navigate(link.path)}
          className={`text-left p-2 rounded hover:bg-gray-700 transition ${
            currentPath === link.path ? "bg-gray-800 text-blue-400" : ""
          }`}
        >
          {link.label}
        </button>
      ))}
    </div>
  );
}
