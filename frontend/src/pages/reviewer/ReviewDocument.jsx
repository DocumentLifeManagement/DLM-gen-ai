import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function ReviewDocument({ navigate }) {
  const { id } = useParams();

  const [documentData, setDocumentData] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchDocument();
  }, []);

  const fetchDocument = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/documents/${id}`
      );

      if (!res.ok) throw new Error("Failed to fetch document");

      const data = await res.json();

      setDocumentData(data);
      setFields(data.fields || []); // backend should return parsed fields
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (index, value) => {
    const updated = [...fields];
    updated[index].value = value;
    setFields(updated);
  };

  const handleSaveChanges = async () => {
    try {
      await fetch(
        `http://localhost:8000/api/v1/documents/${id}/update-fields`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields }),
        }
      );

      showToast("Changes saved successfully");
    } catch {
      showToast("Failed to save changes");
    }
  };

  const handleApprove = async () => {
    try {
      await fetch(
        `http://localhost:8000/api/v1/documents/${id}/approve`,
        { method: "POST" }
      );

      showToast("Document Approved");
      setTimeout(() => navigate("/reviewer"), 1500);
    } catch {
      showToast("Approval Failed");
    }
  };

  const handleReject = async () => {
    try {
      await fetch(
        `http://localhost:8000/api/v1/documents/${id}/reject`,
        { method: "POST" }
      );

      showToast("Document Rejected");
      setTimeout(() => navigate("/reviewer"), 1500);
    } catch {
      showToast("Rejection Failed");
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading document...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">

      <Navbar navigate={navigate} userRole="reviewer" />

      <div className="px-10 py-10">

        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-8">
          Review Document #{id}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* LEFT - Document Info */}
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border border-white/20 p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">
              {documentData.filename}
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-300">
              Status: {documentData.status}
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Uploaded: {documentData.created_at}
            </p>
          </div>

          {/* RIGHT - Extracted Fields */}
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border border-white/20 p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-6">
              Extracted Fields
            </h2>

            {fields.length === 0 && (
              <p className="text-gray-500">
                No extracted fields available.
              </p>
            )}

            {fields.map((field, index) => {
              const confidenceColor =
                field.confidence < 0.6
                  ? "bg-red-100 border-red-500"
                  : field.confidence < 0.8
                  ? "bg-yellow-100 border-yellow-500"
                  : "bg-green-100 border-green-500";

              return (
                <div key={index} className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    {field.key}
                  </label>

                  <input
                    value={field.value}
                    onChange={(e) =>
                      handleFieldChange(index, e.target.value)
                    }
                    className={`w-full p-2 rounded border ${confidenceColor}`}
                  />

                  <p className="text-xs mt-1 text-gray-600">
                    Confidence: {(field.confidence * 100).toFixed(2)}%
                  </p>
                </div>
              );
            })}

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSaveChanges}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
              >
                Save Changes
              </button>

              <button
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Approve
              </button>

              <button
                onClick={handleReject}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 bg-black text-white px-4 py-2 rounded shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
