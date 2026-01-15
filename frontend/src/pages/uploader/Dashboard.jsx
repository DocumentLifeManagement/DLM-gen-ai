import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function Dashboard() {
  const [documents, setDocuments] = useState([
    { id: 1, name: "Invoice 001", status: "Pending", uploaded: "2026-01-15" },
    { id: 2, name: "Contract A", status: "Processed", uploaded: "2026-01-14" },
  ]);

  const role = "uploader"; // fetch from localStorage if needed

  // Handle file upload
  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const newDoc = {
        id: Date.now(),
        name: file.name,
        status: "Pending",
        uploaded: new Date().toISOString().split("T")[0],
      };
      setDocuments([newDoc, ...documents]);
    }
  };

  // Handle delete
  const handleDelete = (id) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
  };

  return (
    <div className="flex bg-gray-900 min-h-screen text-white">
      <Sidebar role={role} />
      <div className="flex-1">
        <Navbar role={role} />
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6 text-blue-400">Uploader Dashboard</h1>

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
          </div>
        </div>
      </div>
    </div>
  );
}
