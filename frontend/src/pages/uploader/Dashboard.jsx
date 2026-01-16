import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function UploaderDashboard({ navigate }) {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");
  const role = "uploader"; // fetch from localStorage if needed

  // Fetch documents from backend on load
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8000/api/v1/documents/uploader/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to load documents");

      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle file upload
  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const token = localStorage.getItem("access_token");
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/api/v1/documents/upload/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const newDoc = await response.json();
      // Prepend to documents list
      setDocuments([newDoc, ...documents]);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://localhost:8000/api/v1/documents/${id}/delete/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Delete failed");

      setDocuments(documents.filter((doc) => doc.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex bg-gray-900 min-h-screen text-white">
      <Sidebar role={role} />
      <div className="flex-1">
        <Navbar role={role} />
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6 text-blue-400">Uploader Dashboard</h1>

          {error && <p className="text-red-400 mb-4">{error}</p>}

          {/* Upload Area */}
          <div className="mb-6">
            <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
              Upload File
              <input type="file" onChange={handleUpload} className="hidden" />
            </label>
          </div>

          {/* Document Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition shadow-md relative"
              >
                <h3 className="font-semibold text-lg">{doc.name}</h3>
                <p>
                  Status: <span className="text-blue-400">{doc.status}</span>
                </p>
                <p>Uploaded: {doc.uploaded}</p>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-400"
                >
                  Delete
                </button>
              </div>
            ))}

            {documents.length === 0 && !error && (
              <p className="text-gray-400">No uploaded documents yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
