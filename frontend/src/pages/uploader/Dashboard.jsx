import React, { useEffect, useState, useRef } from "react";
import Navbar from "../../components/Navbar";

export default function UploaderDashboard({ navigate }) {
  const userRole = "uploader";

  const [documents, setDocuments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [auditDoc, setAuditDoc] = useState(null);
  const [error, setError] = useState("");

  const dropRef = useRef();

  useEffect(() => {
    fetchDocuments();
    setupWebSocket();
  }, []);

  const setupWebSocket = () => {
    const socket = new WebSocket("ws://localhost:8000/ws/uploader");

    socket.onmessage = (event) => {
      const updatedDoc = JSON.parse(event.data);
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === updatedDoc.id ? updatedDoc : doc
        )
      );
    };

    return () => socket.close();
  };

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        "http://localhost:8000/api/v1/documents/uploader/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to load documents");

      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      setError(err.message);
    }
  };

  /* ----------------------------
     FILE VALIDATION
  -----------------------------*/
  const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showToast("File exceeds 5MB limit");
      return false;
    }
    return true;
  };

  /* ----------------------------
     MULTI FILE UPLOAD
  -----------------------------*/
  const uploadFiles = async (files) => {
    const token = localStorage.getItem("access_token");

    for (let file of files) {
      if (!validateFile(file)) continue;

      const formData = new FormData();
      formData.append("file", file);

      try {
        setUploadProgress(10);

        const res = await fetch(
          "http://localhost:8000/api/v1/documents/upload/",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );

        setUploadProgress(70);

        if (!res.ok) throw new Error("Upload failed");

        const newDoc = await res.json();
        setDocuments((prev) => [newDoc, ...prev]);

        setUploadProgress(100);
        showToast(`${file.name} uploaded`);
      } catch {
        showToast("Upload failed");
      } finally {
        setTimeout(() => setUploadProgress(0), 1000);
      }
    }
  };

  /* ----------------------------
     DRAG & DROP
  -----------------------------*/
  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    uploadFiles(files);
  };

  const handleDragOver = (e) => e.preventDefault();

  /* ----------------------------
     DELETE
  -----------------------------*/
  const handleDelete = async (id) => {
    const token = localStorage.getItem("access_token");

    await fetch(
      `http://localhost:8000/api/v1/documents/${id}/delete/`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setDocuments(documents.filter((doc) => doc.id !== id));
    showToast("Document deleted");
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  /* ----------------------------
     STATUS BADGE
  -----------------------------*/
  const statusBadge = (status) => {
    const styles = {
      UPLOADED: "bg-blue-100 text-blue-600",
      PROCESSING: "bg-yellow-100 text-yellow-600",
      NEEDS_REVIEW: "bg-orange-100 text-orange-600",
      REVIEWED: "bg-green-100 text-green-600",
      FAILED: "bg-red-100 text-red-600",
    };
    return styles[status] || "bg-gray-100 text-gray-600";
  };

  /* ----------------------------
     COUNTERS
  -----------------------------*/
  const total = documents.length;
  const processing = documents.filter(d => d.status === "PROCESSING").length;
  const failed = documents.filter(d => d.status === "FAILED").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">

      <Navbar navigate={navigate} userRole={userRole} />

      <div className="px-10 py-10">

        <h1 className="text-3xl font-bold text-blue-600 mb-8">
          Uploader Dashboard
        </h1>

        {/* Animated Counters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <CounterCard title="Total" value={total} />
          <CounterCard title="Processing" value={processing} />
          <CounterCard title="Failed" value={failed} />
        </div>

        {/* Drag & Drop */}
        <div
          ref={dropRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-blue-400 p-10 rounded-xl text-center mb-8 bg-white/60 backdrop-blur-md"
        >
          <p className="text-gray-600">
            Drag & Drop files here or click below
          </p>

          <label className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded mt-4 inline-block">
            Select Files
            <input
              type="file"
              multiple
              onChange={(e) => uploadFiles(e.target.files)}
              className="hidden"
            />
          </label>
        </div>

        {/* Upload Progress */}
        {uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded mb-6">
            <div
              className="bg-blue-600 text-white text-center p-1 rounded"
              style={{ width: `${uploadProgress}%` }}
            >
              {uploadProgress}%
            </div>
          </div>
        )}

        {/* Documents */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white/60 backdrop-blur-md border border-white/20 p-6 rounded-xl shadow-lg relative"
            >
              <h3 className="font-semibold text-lg">
                {doc.filename}
              </h3>

              <span className={`text-xs px-2 py-1 rounded ${statusBadge(doc.status)}`}>
                {doc.status}
              </span>

              <p className="text-sm text-gray-500 mt-2">
                Uploaded: {doc.created_at}
              </p>

              <div className="flex gap-2 mt-4">

                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="bg-gray-600 text-white px-3 py-1 rounded"
                >
                  Preview
                </button>

                <button
                  onClick={() => setAuditDoc(doc)}
                  className="bg-indigo-600 text-white px-3 py-1 rounded"
                >
                  Audit
                </button>

                <button
                  onClick={() => handleDelete(doc.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Preview Modal */}
        {previewDoc && (
          <Modal title="Preview" onClose={() => setPreviewDoc(null)}>
            <p>{previewDoc.filename}</p>
            <p>Status: {previewDoc.status}</p>
          </Modal>
        )}

        {/* Audit Modal */}
        {auditDoc && (
          <Modal title="Audit History" onClose={() => setAuditDoc(null)}>
            <p>Audit trail for {auditDoc.filename}</p>
            <ul className="mt-4 text-sm">
              <li>Uploaded</li>
              <li>Processed</li>
              <li>Reviewed</li>
            </ul>
          </Modal>
        )}

      </div>

      {toast && (
        <div className="fixed bottom-5 right-5 bg-black text-white px-4 py-2 rounded shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

/* ----------------------------
   Reusable Components
-----------------------------*/

function CounterCard({ title, value }) {
  return (
    <div className="bg-white/60 backdrop-blur-md p-6 rounded-xl shadow">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-3xl font-bold text-blue-600 transition-all">
        {value}
      </h2>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96">
        <h2 className="font-bold mb-4">{title}</h2>
        {children}
        <button
          onClick={onClose}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}
