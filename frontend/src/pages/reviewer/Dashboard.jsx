import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";

export default function ReviewerDashboard({ navigate }) {
  const userRole = "reviewer";

  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("desc");

  const [page, setPage] = useState(1);
  const limit = 6;

  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [documents, search, statusFilter, sortOrder]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(
        "http://localhost:8000/api/v1/documents"
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

  const applyFilters = () => {
    let temp = [...documents];

    if (statusFilter !== "ALL") {
      temp = temp.filter((doc) => doc.status === statusFilter);
    }

    if (search) {
      temp = temp.filter((doc) =>
        doc.filename.toLowerCase().includes(search.toLowerCase())
      );
    }

    temp.sort((a, b) =>
      sortOrder === "asc"
        ? new Date(a.created_at) - new Date(b.created_at)
        : new Date(b.created_at) - new Date(a.created_at)
    );

    setFilteredDocs(temp);
  };

  const handleApprove = async (id) => {
    // Optimistic update
    const updated = documents.map((doc) =>
      doc.id === id ? { ...doc, status: "REVIEWED" } : doc
    );
    setDocuments(updated);

    try {
      await fetch(
        `http://localhost:8000/api/v1/documents/${id}/approve`,
        { method: "POST" }
      );

      showToast("Document approved successfully");
    } catch {
      showToast("Approval failed");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">

      <Navbar navigate={navigate} userRole={userRole} />

      <div className="px-10 py-10">

        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-8">
          Reviewer Dashboard
        </h1>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6">

          <input
            type="text"
            placeholder="Search document..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 rounded border"
          />

          <select
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded border"
          >
            <option value="ALL">All</option>
            <option value="REVIEW_PENDING">Review Pending</option>
            <option value="NEEDS_REVIEW">Needs Review</option>
            <option value="REVIEWED">Reviewed</option>
          </select>

          <select
            onChange={(e) => setSortOrder(e.target.value)}
            className="p-2 rounded border"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
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

        {error && <p className="text-red-500">{error}</p>}

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border border-white/20 p-6 rounded-xl shadow-lg hover:scale-105 transition"
            >
              <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                {doc.filename}
              </h3>

              <p className="text-sm mt-2 text-white ">
                Status:{" "}
                <span
                  className={
                    doc.status === "NEEDS_REVIEW"
                      ? "text-yellow-500"
                      : "text-green-500"
                  }
                >
                  {doc.status}
                </span>
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Uploaded: {doc.created_at}
              </p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() =>
                    navigate(`/reviewer/document/${doc.id}`)
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                >
                  Review
                </button>

                {doc.status === "NEEDS_REVIEW" && (
                  <button
                    onClick={() => handleApprove(doc.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                  >
                    Approve
                  </button>
                )}
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

          <span className="text-white" > Page {page}</span>

          <button
            disabled={page * limit >= filteredDocs.length}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Next
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 bg-black text-white px-4 py-2 rounded shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
