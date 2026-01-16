import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function ReviewerDashboard({ navigate }) {
  const userRole = "reviewer";
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        "http://localhost:8000/api/v1/models/document",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load documents");
      }

      setDocuments(await response.json());
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReview = (id) => {
    navigate(`/reviewer/document/${id}`);
  };

  return (
    <div className="flex bg-gray-900 min-h-screen text-white">
      <Sidebar role={userRole} />
      <div className="flex-1">
        <Navbar navigate={navigate} userRole={userRole} />
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6 text-blue-400">
            Reviewer Dashboard
          </h1>

          {error && <p className="text-red-400">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700"
              >
                <h3 className="font-semibold text-lg">{doc.name}</h3>
                <p>Status: {doc.status}</p>
                <p>Uploaded: {doc.uploaded}</p>

                <button
                  onClick={() => handleReview(doc.id)}
                  className="mt-4 bg-blue-500 px-4 py-2 rounded"
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
