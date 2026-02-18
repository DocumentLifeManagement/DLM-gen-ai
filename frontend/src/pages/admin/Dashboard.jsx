import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import Button from "../../components/landing/Button";
import {
  FileText,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Clock,
  ShieldAlert,
  Users
} from "lucide-react";

export default function AdminDashboard({ navigate }) {
  const userRole = "admin";

  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("desc");
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);

  const limit = 10;

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [documents, search, statusFilter, sortOrder]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        "http://localhost:8000/api/v1/documents",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch documents");

      const data = await res.json();
      // Mock data if empty to show the UI
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

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this document? This action cannot be undone.")) return;

    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `http://localhost:8000/api/v1/documents/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete");

      setDocuments(docs => docs.filter(d => d.id !== id));
      showToast("Document deleted successfully");
    } catch (err) {
      showToast("Failed to delete document");
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
      UPLOADED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      PROCESSING: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      NEEDS_REVIEW: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      REVIEW_PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", // Handle variation
      REVIEWED: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      APPROVAL_PENDING: "bg-orange-500/10 text-orange-400 border-orange-500/20", // Handle variation
      APPROVED: "bg-green-500/10 text-green-400 border-green-500/20",
      REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
      FAILED: "bg-red-500/20 text-red-300 border-red-500/30",
    };
    return styles[status] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
  };

  // Stats
  const total = documents.length;
  const inReview = documents.filter(d => d.status === "NEEDS_REVIEW" || d.status === "REVIEW_PENDING").length;
  const inApproval = documents.filter(d => d.status === "REVIEWED" || d.status === "APPROVAL_PENDING").length;
  const approved = documents.filter(d => d.status === "APPROVED").length;

  return (
    <DashboardLayout role={userRole} navigate={navigate} title="Admin Controller">

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Documents" value={total} icon={FileText} color="text-brand-accent" />
        <StatCard title="In Review" value={inReview} icon={Eye} color="text-yellow-400" />
        <StatCard title="In Approval" value={inApproval} icon={Clock} color="text-orange-400" />
        <StatCard title="Completed" value={approved} icon={CheckCircle} color="text-green-400" />
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search all documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-brand-900/50 border border-brand-800 text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-brand-accent transition-colors"
          />
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-40 bg-brand-900/50 border border-brand-800 text-white rounded-lg pl-10 pr-8 py-2.5 appearance-none focus:outline-none focus:border-brand-accent transition-colors text-sm"
            >
              <option value="ALL">All Status</option>
              <option value="UPLOADED">Uploaded</option>
              <option value="PROCESSING">Processing</option>
              <option value="NEEDS_REVIEW">In Review</option>
              <option value="REVIEWED">In Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="relative flex-1 md:flex-none">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full md:w-40 bg-brand-900/50 border border-brand-800 text-white rounded-lg pl-10 pr-8 py-2.5 appearance-none focus:outline-none focus:border-brand-accent transition-colors text-sm"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-brand-900 border border-brand-800 rounded-xl overflow-hidden shadow-xl">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-brand-800 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-brand-950/50">
          <div className="col-span-12 md:col-span-4">Document / ID</div>
          <div className="hidden md:block md:col-span-3">Date</div>
          <div className="col-span-6 md:col-span-3">Process Stage</div>
          <div className="col-span-6 md:col-span-2 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-brand-800/30 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-brand-800">
            {paginatedDocs.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No documents found in the system.
              </div>
            ) : (
              paginatedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-brand-800/30 transition-colors group"
                >
                  <div className="col-span-12 md:col-span-4 font-medium text-white flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-brand-800 text-slate-400">
                      <FileText size={20} />
                    </div>
                    <div className="truncate">
                      <p className="truncate text-sm md:text-base">{doc.filename}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-mono">ID: {doc.id}</p>
                    </div>
                  </div>
                  <div className="hidden md:block md:col-span-3 text-slate-400 text-sm">
                    {new Date(doc.created_at).toLocaleDateString()}
                    <span className="block text-xs opacity-60 m-1">
                      {new Date(doc.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="col-span-6 md:col-span-3">
                    <span className={`text-[10px] md:text-xs px-2.5 py-1 rounded-full border font-medium ${statusBadge(doc.status)}`}>
                      {doc.status ? doc.status.replace("_", " ") : "INGESTED"}
                    </span>
                  </div>
                  <div className="col-span-6 md:col-span-2 flex justify-end gap-2">
                    <button
                      className="p-2 text-slate-400 hover:text-white hover:bg-brand-800 rounded-lg transition-colors"
                      title="View Details"
                      onClick={() => { /* Navigate to detail view if exists */ }}
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(doc.id, e)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-8 gap-4 items-center">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="p-2 rounded-lg bg-brand-900 border border-brand-800 text-slate-400 hover:text-white hover:border-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        <span className="text-sm text-slate-400">
          Page <span className="text-white font-medium">{page}</span>
        </span>

        <button
          disabled={page * limit >= filteredDocs.length}
          onClick={() => setPage(page + 1)}
          className="p-2 rounded-lg bg-brand-900 border border-brand-800 text-slate-400 hover:text-white hover:border-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-brand-900 border border-brand-700 text-white px-4 py-3 rounded-lg shadow-2xl animate-in slide-in-from-bottom-5 z-50 flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${toast.includes("Failed") ? "bg-red-500" : "bg-green-500"}`} />
          {toast}
        </div>
      )}

    </DashboardLayout>
  );
}
