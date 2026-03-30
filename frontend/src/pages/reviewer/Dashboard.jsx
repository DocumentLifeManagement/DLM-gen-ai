import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

// Forced IST Formatter
const formatIST = (date, type = "both") => {
  if (!date) return "—";
  try {
    const d = new Date(date);
    const options = {
      timeZone: "Asia/Kolkata",
      hour12: true,
    };

    if (type === "date") {
      return new Intl.DateTimeFormat("en-IN", {
        ...options,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(d);
    } else if (type === "time") {
      return new Intl.DateTimeFormat("en-IN", {
        ...options,
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    }
    return (
      new Intl.DateTimeFormat("en-IN", {
        ...options,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d) + " IST"
    );
  } catch (e) {
    return String(date);
  }
};

import StatCard from "../../components/dashboard/StatCard";
import Button from "../../components/landing/Button";
import {
  FileText,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Check,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  AlertCircle,
} from "lucide-react";

export default function ReviewerDashboard({ navigate }) {
  const userRole = "reviewer";

  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("active");
  const [sortOrder, setSortOrder] = useState("desc");

  const [page, setPage] = useState(1);
  const limit = 8;

  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [documents, search, statusFilter, sortOrder, activeTab]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:8000/api/v1/documents", {
        headers: { Authorization: `Bearer ${token}` },
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

    if (activeTab === "rejected") {
      temp = temp.filter(
        (doc) => doc.status === "REJECTED" || doc.status === "FAILED",
      );
    } else {
      temp = temp.filter(
        (doc) => doc.status !== "REJECTED" && doc.status !== "FAILED",
      );
      if (statusFilter !== "ALL") {
        temp = temp.filter((doc) => doc.status === statusFilter);
      }
    }

    if (search) {
      temp = temp.filter(
        (doc) =>
          doc.filename?.toLowerCase().includes(search.toLowerCase()) ||
          doc.id?.toString().includes(search),
      );
    }

    temp.sort((a, b) =>
      sortOrder === "asc"
        ? new Date(a.created_at) - new Date(b.created_at)
        : new Date(b.created_at) - new Date(a.created_at),
    );

    setFilteredDocs(temp);
  };

  const handleSemanticSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) {
      setSearchResults(null);
      return;
    }
    setLoadingSearch(true);
    try {
      const token = localStorage.getItem("access_token");
      // Use local backend URL for testing, fallback to railway
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(
        `${API_URL}/search?query=${encodeURIComponent(search)}&role=REVIEWER`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("Semantic search failed");
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      showToast(err.message);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleApprove = async (id, e) => {
    e.stopPropagation(); // Prevent row click

    const token = localStorage.getItem("access_token");

    // Optimistic update
    const updated = documents.map((doc) =>
      doc.id === id ? { ...doc, status: "APPROVAL_PENDING" } : doc,
    );
    setDocuments(updated);

    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/documents/${id}/review`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) throw new Error("Verification rejected by system");

      showToast("Verification complete. Document sent to Approval queue.");
      fetchDocuments(); // Final sync
    } catch (err) {
      showToast(err.message || "Verification failed");
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
      UPLOADED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      PROCESSING: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      REVIEW_PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      APPROVAL_PENDING: "bg-green-500/10 text-green-400 border-green-500/20",
      REVIEWED: "bg-green-500/10 text-green-400 border-green-500/20",
      REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
      FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return (
      styles[status] || "bg-slate-500/10 text-slate-400 border-slate-500/20"
    );
  };

  // Stats
  const total = documents.length;
  const pending = documents.filter((d) => d.status === "REVIEW_PENDING").length;
  const reviewed = documents.filter(
    (d) => d.status === "REVIEWED" || d.status === "APPROVAL_PENDING",
  ).length;

  return (
    <DashboardLayout
      role={userRole}
      navigate={navigate}
      title="Review Dashboard"
    >
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
        <StatCard
          title="Total Documents"
          value={total}
          icon={FileText}
          color="text-brand-accent"
        />
        <StatCard
          title="Pending Review"
          value={pending}
          icon={Clock}
          color="text-yellow-400"
        />
        <StatCard
          title="Reviewed Today"
          value={reviewed}
          icon={CheckCircle}
          color="text-green-400"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-brand-800 mb-6 font-mono overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab("active");
            setPage(1);
          }}
          className={clsx(
            "pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative px-2 whitespace-nowrap shrink-0",
            activeTab === "active"
              ? "text-brand-accent"
              : "text-slate-600 hover:text-slate-400",
          )}
        >
          Active Workload
          {activeTab === "active" && (
            <motion.div
              layoutId="reviewerActiveTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent"
            />
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab("rejected");
            setPage(1);
          }}
          className={clsx(
            "pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative px-2 flex items-center gap-2 whitespace-nowrap shrink-0",
            activeTab === "rejected"
              ? "text-rose-500"
              : "text-slate-600 hover:text-slate-400",
          )}
        >
          Rejected / Bin
          {activeTab === "rejected" && (
            <motion.div
              layoutId="reviewerActiveTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500"
            />
          )}
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
        <form
          onSubmit={handleSemanticSearch}
          className="relative flex-1 w-full md:max-w-md"
        >
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Semantic Search (e.g. invoice above 500)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (!e.target.value) setSearchResults(null);
            }}
            className="w-full bg-brand-900/50 border border-brand-800 text-white rounded-lg pl-10 pr-24 py-2.5 focus:outline-none focus:border-brand-accent transition-colors"
          />
          <button
            type="submit"
            disabled={loadingSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-accent/20 hover:bg-brand-accent/40 text-brand-accent px-3 py-1 rounded text-xs font-bold transition-colors disabled:opacity-50"
          >
            {loadingSearch ? "Searching..." : "Search"}
          </button>
        </form>

        <div className="flex gap-4 w-full md:w-auto">
          {activeTab === "active" && (
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
                <option value="REVIEW_PENDING">Review Pending</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="PROCESSING">Processing</option>
              </select>
            </div>
          )}

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
          <div className="col-span-12 md:col-span-3">Document / ID</div>
          <div className="hidden md:block md:col-span-2">Date</div>
          <div className="hidden md:block md:col-span-1 text-center">Time</div>
          <div className="hidden md:block md:col-span-2 text-center">
            Risk Analysis
          </div>
          <div className="col-span-6 md:col-span-2 text-center">Status</div>
          <div className="col-span-6 md:col-span-2 text-right">Actions</div>
        </div>

        {loadingSearch || loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-brand-800/30 animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : searchResults ? (
          <div className="divide-y divide-brand-800">
            {searchResults.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No semantic matches found for your query.
              </div>
            ) : (
              searchResults.map((res) => (
                <div
                  key={res.document_id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-brand-800/30 transition-colors group cursor-pointer"
                  onClick={() =>
                    navigate(`/reviewer/document/${res.document_id}`)
                  }
                >
                  <div className="col-span-12 md:col-span-3 font-medium text-white flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-brand-accent/10 text-brand-accent">
                      <FileText size={20} />
                    </div>
                    <div className="truncate">
                      <p className="truncate text-sm md:text-base text-white">
                        {res.filename || `Document #${res.document_id}`}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] text-slate-500 font-mono">
                          Score: {(res.relevance_score * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-5 text-sm font-mono text-slate-300 truncate">
                    <div
                      className="p-2 bg-brand-950/50 rounded border border-brand-800 truncate"
                      title={res.matched_text}
                    >
                      {res.matched_text}
                    </div>
                  </div>
                  <div className="col-span-6 md:col-span-2 flex justify-center">
                    <span
                      className={`text-[9px] md:text-[10px] px-3 py-1 rounded-full border font-black uppercase tracking-tight whitespace-nowrap ${statusBadge(res.status)}`}
                    >
                      {res.status ? res.status.replace("_", " ") : "INGESTED"}
                    </span>
                  </div>
                  <div
                    className="col-span-6 md:col-span-2 flex justify-end gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() =>
                        navigate(`/reviewer/document/${res.document_id}`)
                      }
                      className="p-2 text-slate-400 hover:text-white hover:bg-brand-800 rounded-lg transition-colors"
                      title="Review"
                    >
                      <Eye size={18} />
                    </button>
                    {res.status === "REVIEW_PENDING" && (
                      <button
                        onClick={(e) => handleApprove(res.document_id, e)}
                        className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-900/30 rounded-lg transition-colors"
                        title="Quick Approve"
                      >
                        <Check size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="divide-y divide-brand-800">
            {paginatedDocs.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No documents found matching your filters.
              </div>
            ) : (
              paginatedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-brand-800/30 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/reviewer/document/${doc.id}`)}
                >
                  <div className="col-span-12 md:col-span-3 font-medium text-white flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${doc.status === "NEEDS_REVIEW" ? "bg-orange-500/10 text-orange-400" : "bg-brand-800 text-slate-400"}`}
                    >
                      <FileText size={20} />
                    </div>
                    <div className="truncate">
                      <p className="truncate text-sm md:text-base text-white">
                        {doc.filename}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] text-slate-500 font-mono">
                          ID: {doc.id}
                        </p>
                        {doc.tag && (
                          <span className="text-[8px] px-1.5 py-0.5 bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 rounded font-mono uppercase tracking-[0.1em]">
                            {doc.tag}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block md:col-span-2 text-slate-400 text-xs">
                    {formatIST(doc.created_at, "date")}
                  </div>
                  <div className="hidden md:block md:col-span-1 text-[10px] font-mono text-slate-500 text-center">
                    {formatIST(doc.created_at, "time")}
                  </div>

                  {/* Risk Analysis Pillar */}
                  <div className="hidden md:block md:col-span-2 text-center">
                    {doc.risk_indicators?.length > 0 ? (
                      <div className="flex items-center justify-center gap-2 text-red-500">
                        <AlertCircle size={14} className="animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-tighter">
                          Pattern Risk
                        </span>
                      </div>
                    ) : (
                      <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20 font-bold uppercase tracking-tighter scale-90">
                        Low Risk
                      </span>
                    )}
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
                    <button
                      onClick={() => navigate(`/reviewer/document/${doc.id}`)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-brand-800 rounded-lg transition-colors"
                      title="Review"
                    >
                      <Eye size={18} />
                    </button>
                    {doc.status === "REVIEW_PENDING" && (
                      <button
                        onClick={(e) => handleApprove(doc.id, e)}
                        className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-900/30 rounded-lg transition-colors"
                        title="Quick Approve"
                      >
                        <Check size={18} />
                      </button>
                    )}
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
          <div className="w-2 h-2 rounded-full bg-green-500" />
          {toast}
        </div>
      )}
    </DashboardLayout>
  );
}
