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
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Clock,
} from "lucide-react";

export default function ApproverDashboard({ navigate }) {
  const userRole = "approver";

  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("desc");
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);

  const limit = 8;

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [documents, search, statusFilter, sortOrder]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("access_token");

      // In a real app, we might fetch all status and filter client side, or have a specific endpoint
      // For now fetching APPROVAL_PENDING as per original code, but to show more stats we might want all.
      // Let's assume for now we want to see everything relevant to approver.
      // If the API only returns pending, stats might be skewed.
      // I'll stick to the original endpoint but maybe we need a different one for history?
      // For this redesign, I will assume the endpoint returns what we need or I'll just use what's there.
      // The original code used `?status=APPROVAL_PENDING`. I will remove that filter to potentially get more history if allowed,
      // or keep it if that's the only data available. To show "Approved Today", we need history.
      // I'll try fetching all documents to populate the dashboard properly.
      const res = await fetch("http://localhost:8000/api/v1/documents", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

    // Default to showing only pending if no filter selected?
    // Or just show all. Let's show all but maybe default filtering logic is fine.

    if (statusFilter !== "ALL") {
      temp = temp.filter((doc) => doc.status === statusFilter);
    } else {
      // Optional: Maybe default to showing pending approvals at top or filtering irrelevant ones?
      // For now, show all.
    }

    if (search) {
      temp = temp.filter((doc) =>
        doc.filename.toLowerCase().includes(search.toLowerCase()),
      );
    }

    temp.sort((a, b) =>
      sortOrder === "asc"
        ? new Date(a.created_at) - new Date(b.created_at)
        : new Date(b.created_at) - new Date(a.created_at),
    );

    setFilteredDocs(temp);
  };

  const handleApprove = async (id, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("access_token");

      // Optimistic update
      // setDocuments(documents.filter((doc) => doc.id !== id)); // Don't remove, just update status
      setDocuments((docs) =>
        docs.map((d) => (d.id === id ? { ...d, status: "APPROVED" } : d)),
      );

      await fetch(`http://localhost:8000/api/v1/documents/${id}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      showToast("Document Approved Successfully");
    } catch {
      showToast("Approval Failed");
      fetchDocuments();
    }
  };

  const handleReject = async (id, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("access_token");

      setDocuments((docs) =>
        docs.map((d) => (d.id === id ? { ...d, status: "REJECTED" } : d)),
      );

      await fetch(`http://localhost:8000/api/v1/documents/${id}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

  const paginatedDocs = filteredDocs.slice((page - 1) * limit, page * limit);

  const statusBadge = (status) => {
    const styles = {
      REVIEWED: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", // Pending Approval typically comes after Review
      APPROVAL_PENDING: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      APPROVED: "bg-green-500/10 text-green-400 border-green-500/20",
      REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return (
      styles[status] || "bg-slate-500/10 text-slate-400 border-slate-500/20"
    );
  };

  // Stats
  const total = documents.length;
  const pending = documents.filter(
    (d) => d.status === "APPROVAL_PENDING" || d.status === "REVIEWED",
  ).length; // Assuming REVIEWED means ready for approval
  const approved = documents.filter((d) => d.status === "APPROVED").length;

  return (
    <DashboardLayout
      role={userRole}
      navigate={navigate}
      title="Approver Dashboard"
    >
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Documents"
          value={total}
          icon={FileText}
          color="text-brand-accent"
        />
        <StatCard
          title="Pending Approval"
          value={pending}
          icon={Clock}
          color="text-orange-400"
        />
        <StatCard
          title="Approved"
          value={approved}
          icon={CheckCircle}
          color="text-green-400"
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-brand-900/50 border border-brand-800 text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-brand-accent transition-colors"
          />
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-40 bg-brand-900/50 border border-brand-800 text-white rounded-lg pl-10 pr-8 py-2.5 appearance-none focus:outline-none focus:border-brand-accent transition-colors text-sm"
            >
              <option value="ALL">All Status</option>
              <option value="APPROVAL_PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="REVIEWED">Reviewed</option>
            </select>
          </div>

          <div className="relative flex-1 md:flex-none">
            <SlidersHorizontal
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />
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
          <div className="col-span-12 md:col-span-4">Document</div>
          <div className="hidden md:block md:col-span-2">Date</div>
          <div className="hidden md:block md:col-span-2">Time</div>
          <div className="col-span-6 md:col-span-2 text-center">Status</div>
          <div className="col-span-6 md:col-span-2 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-brand-800/30 animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-brand-800">
            {paginatedDocs.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No documents found.
              </div>
            ) : (
              paginatedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-brand-800/30 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/approver/document/${doc.id}`)} // Assuming detail view exists or we can add it
                >
                  <div className="col-span-12 md:col-span-4 font-medium text-white flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-800 flex items-center justify-center text-slate-400 shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="truncate">
                      <p className="truncate text-sm md:text-base">
                        {doc.filename}
                      </p>
                      <p className="md:hidden text-xs text-slate-500 mt-1">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:block md:col-span-2 text-slate-400 text-sm">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </div>
                  <div className="hidden md:block md:col-span-2 text-slate-500 text-xs font-mono">
                    {new Date(doc.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="col-span-6 md:col-span-2 flex justify-center">
                    <span
                      className={`text-[9px] md:text-[10px] px-3 py-1 rounded-full border font-black uppercase tracking-tight whitespace-nowrap ${statusBadge(doc.status)}`}
                    >
                      {doc.status ? doc.status.replace("_", " ") : "INGESTED"}
                    </span>
                  </div>
                  <div
                    className="col-span-6 md:col-span-2 flex justify-end gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(doc.status === "APPROVAL_PENDING" ||
                      doc.status === "REVIEWED") && (
                      <>
                        <button
                          onClick={(e) => handleApprove(doc.id, e)}
                          className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-900/30 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={(e) => handleReject(doc.id, e)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <X size={18} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => navigate(`/approver/document/${doc.id}`)} // Reuse review view or create approver specific?
                      className="p-2 text-slate-400 hover:text-white hover:bg-brand-800 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={18} />
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
          <div
            className={`w-2 h-2 rounded-full ${toast.includes("Rejected") || toast.includes("Failed") ? "bg-red-500" : "bg-green-500"}`}
          />
          {toast}
        </div>
      )}
    </DashboardLayout>
  );
}
