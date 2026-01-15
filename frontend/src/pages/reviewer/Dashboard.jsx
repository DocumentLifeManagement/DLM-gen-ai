import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function ReviewerDashboard({ navigate }) {
  const userRole = "reviewer"; // can also fetch from localStorage
  const [documents, setDocuments] = useState([
    { id: 1, name: "Invoice 001", status: "Needs Review", uploaded: "2026-01-15" },
    { id: 2, name: "Contract A", status: "Low Confidence", uploaded: "2026-01-14" },
    { id: 3, name: "Report B", status: "Needs Review", uploaded: "2026-01-13" },
  ]);

  // Navigate to ReviewDoc page
  const handleReview = (id) => {
    navigate(`/reviewer/document/${id}`);
  };

  return (
    <div className="flex bg-gray-900 min-h-screen text-white">
      <Sidebar role={userRole} />
      <div className="flex-1">
        <Navbar navigate={navigate} userRole={userRole} />
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6 text-blue-400">Reviewer Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition shadow-md relative"
              >
                <h3 className="font-semibold text-lg">{doc.name}</h3>
                <p>
                  Status:{" "}
                  <span
                    className={`${
                      doc.status === "Needs Review" ? "text-yellow-400" : "text-red-400"
                    } font-semibold`}
                  >
                    {doc.status}
                  </span>
                </p>
                <p>Uploaded: {doc.uploaded}</p>

                <button
                  onClick={() => handleReview(doc.id)}
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  Review Document
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
