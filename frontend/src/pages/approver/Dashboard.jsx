import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";

export default function ApproverDashboard({ navigate }) {
  const userRole = "approver";

  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);

  const limit = 6;

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    applySearch();
  }, [documents, search]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        "http://localhost:8000/api/v1/documents?status=APPROVAL_PENDING",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch documents");

      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applySearch = () => {
    const temp = documents.filter((doc) =>
      doc.filename.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredDocs(temp);
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("access_token");

      // Optimistic update
      setDocuments(documents.filter((doc) => doc.id !== id));

      await fetch(
        `http://localhost:8000/api/v1/documents/${id}/final-approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showToast("Document Approved Successfully");
    } catch {
      showToast("Approval Failed");
      fetchDocuments();
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("access_token");

      setDocuments(documents.filter((doc) => doc.id !== id));

      await fetch(
        `http://localhost:8000/api/v1/documents/${id}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showToast("Document Rejected");
    } catch {
      showToast("Rejection Failed");
      fetchDocuments();
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const paginatedDocs = filteredDocs.slice(
    (page - 1) * limit,
    page * limit
  );

  const statusBadge = (status) => {
    const styles = {
      REVIEWED: "bg-yellow-100 text-yellow-600",
      APPROVED: "bg-green-100 text-green-600",
      REJECTED: "bg-red-100 text-red-600",
    };
    return styles[status] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">

      <Navbar navigate={navigate} userRole={userRole} />

      <div className="px-10 py-10">

        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-8">
          Approver Dashboard
        </h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search document..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border rounded w-64"
          />
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-40 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-xl"
              ></div>
            ))}
          </div>
        )}

        {/* Document Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border border-white/20 p-6 rounded-xl shadow-lg hover:scale-105 transition"
            >
              <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                {doc.filename}
              </h3>

              <span
                className={`text-xs text-white px-2 py-1 rounded ${statusBadge(doc.status)}`}
              >
                {doc.status}
              </span>

              <p className="text-sm text-gray-500 mt-2">
                Uploaded: {doc.created_at}
              </p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleApprove(doc.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                >
                  Approve
                </button>

                <button
                  onClick={() => handleReject(doc.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-8 gap-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Previous
          </button>

          <span className="text-white" >Page {page}</span>

          <button
            disabled={page * limit >= filteredDocs.length}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Next
          </button>
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
