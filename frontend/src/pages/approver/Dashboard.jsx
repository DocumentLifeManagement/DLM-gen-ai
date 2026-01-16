import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function ApproverDashboard({ navigate }) {
  const userRole = "approver"; // fetch from localStorage if needed
  const [approvals, setApprovals] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApprovals();
  }, []);

  // Fetch documents assigned for approval
  const fetchApprovals = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        "http://localhost:8000/api/v1/documents/approver/",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load documents for approval");
      }

      const data = await response.json();
      setApprovals(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle approve action
  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `http://localhost:8000/api/v1/documents/approver/${id}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to approve document");
      }

      // Update UI locally
      setApprovals(
        approvals.map((doc) =>
          doc.id === id ? { ...doc, status: "Approved" } : doc
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex bg-gray-900 min-h-screen text-white">
      <Sidebar role={userRole} />
      <div className="flex-1">
        <Navbar role={userRole} navigate={navigate} />

        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6 text-blue-400">
            Approver Dashboard
          </h1>

          {error && <p className="text-red-400 mb-4">{error}</p>}

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
                        : doc.status === "Approved"
                        ? "text-green-400"
                        : "text-red-400"
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

            {approvals.length === 0 && !error && (
              <p className="text-gray-400">
                No documents pending approval.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
