import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function ApproverDashboard({ navigate }) {
  const userRole = "approver"; // can also fetch from localStorage

  const [approvals, setApprovals] = useState([
    { id: 201, name: "Invoice 003", status: "Pending Approval" },
    { id: 202, name: "Contract B", status: "Pending Approval" },
  ]);

  // Handle approve action
  const handleApprove = (id) => {
    setApprovals(
      approvals.map((doc) =>
        doc.id === id ? { ...doc, status: "Approved" } : doc
      )
    );
  };

  return (
    <div className="flex bg-gray-900 min-h-screen text-white">
      <Sidebar role={userRole} />
      <div className="flex-1">
        <Navbar navigate={navigate} userRole={userRole} />
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6 text-blue-400">Approver Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {approvals.map((doc) => (
              <div
                key={doc.id}
                className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition shadow-md relative"
              >
                <h3 className="font-semibold text-lg">{doc.name}</h3>
                <p>
                  Status:{" "}
                  <span
                    className={`${
                      doc.status === "Pending Approval"
                        ? "text-yellow-400"
                        : "text-green-400"
                    } font-semibold`}
                  >
                    {doc.status}
                  </span>
                </p>

                <button
                  onClick={() => handleApprove(doc.id)}
                  className={`mt-4 px-4 py-2 rounded-md transition ${
                    doc.status === "Pending Approval"
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-gray-600 cursor-not-allowed text-gray-300"
                  }`}
                  disabled={doc.status !== "Pending Approval"}
                >
                  Approve
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
