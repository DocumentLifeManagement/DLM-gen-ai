import React, { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import SLACountdown from "../../components/dashboard/SLACountdown";
import { useRealtimeDocuments } from "../../hooks/useRealtimeDocuments";

// Forced IST Formatter
const formatIST = (date, type = "both") => {
  if (!date) return "—";
  try {
    const d = new Date(date);
    const options = {
      timeZone: 'Asia/Kolkata',
      hour12: true
    };

    if (type === "date") {
      return new Intl.DateTimeFormat('en-IN', { ...options, day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
    } else if (type === "time") {
      return new Intl.DateTimeFormat('en-IN', { ...options, hour: '2-digit', minute: '2-digit' }).format(d);
    }
    return new Intl.DateTimeFormat('en-IN', { ...options, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d) + " IST";
  } catch (e) {
    return String(date);
  }
};

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
  AlertCircle
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
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [page, setPage] = useState(1);

  const limit = 8;

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Realtime WebSocket subscription — stable
  useRealtimeDocuments({
    enabled: true,
    onInsert: useCallback((newDoc) => {
      console.log("[ApproverDashboard] Realtime Insert:", newDoc.id);
      setDocuments(prev => {
        if (prev.find(d => d.id.toString() === newDoc.id.toString())) return prev;
        return [newDoc, ...prev];
      });
      setIsRealtimeConnected(true);
    }, []),
    onUpdate: useCallback((payload) => {
      console.log("[ApproverDashboard] Realtime Update:", payload.new.id, payload.new.status);
      setDocuments(prev => {
        const docExists = prev.find(d => d.id.toString() === payload.new.id.toString());
        if (docExists) {
          return prev.map(d => d.id.toString() === payload.new.id.toString() ? payload.new : d);
        } else {
          return [payload.new, ...prev];
        }
      });
      setIsRealtimeConnected(true);
    }, []),
    onDelete: useCallback((deleted) => {
      console.log("[ApproverDashboard] Realtime Delete:", deleted.id);
      setDocuments(prev => prev.filter(d => d.id.toString() !== deleted.id.toString()));
      setIsRealtimeConnected(true);
    }, []),
  });

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
        doc.filename?.toLowerCase().includes(search.toLowerCase()) ||
        doc.id?.toString().includes(search)
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
      setDocuments(docs => docs.map(d => d.id === id ? { ...d, status: "APPROVED" } : d));

      const res = await fetch(
        `http://localhost:8000/api/v1/documents/${id}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Approval failed");
      }

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
      setDocuments(docs => docs.map(d => d.id === id ? { ...d, status: "REJECTED" } : d));

      const res = await fetch(
        `http://localhost:8000/api/v1/documents/${id}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Rejection failed");
      }

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
      REVIEW_PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      REVIEWED: "bg-orange-500/10 text-orange-400 border-orange-500/20",
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
  const pending = documents.filter(d => d.status === "APPROVAL_PENDING" || d.status === "REVIEWED").length;
  const approved = documents.filter(d => d.status === "APPROVED").length;
  const slaBreaches = documents.filter(d =>
    ["APPROVAL_PENDING", "REVIEWED"].includes(d.status) &&
    ((Date.now() - new Date(d.created_at).getTime()) > 48 * 60 * 60 * 1000)
  ).length;

  return (
    <DashboardLayout
      role={userRole}
      navigate={navigate}
      title="Approver Dashboard"
    >
      {/* Realtime indicator */}
      {isRealtimeConnected && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg w-fit">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Live · Realtime Active</span>
        </div>
      )}
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard title="Total Documents" value={total} icon={FileText} color="text-brand-accent" />
        <StatCard title="Pending Approval" value={pending} icon={Clock} color="text-orange-400" />
        <StatCard title="Approved" value={approved} icon={CheckCircle} color="text-green-400" />
        <StatCard title="SLA Breaches" value={slaBreaches} icon={AlertCircle} color={slaBreaches > 0 ? "text-red-400" : "text-slate-400"} />
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
            placeholder="Search documents by name or ID..."
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

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm font-bold">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Documents List */}
      <div className="bg-brand-900 border border-brand-800 rounded-xl overflow-hidden shadow-xl">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-brand-800 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-brand-950/50">
          <div className="col-span-12 md:col-span-3">Document / ID</div>
          <div className="hidden md:block md:col-span-2">Date</div>
          <div className="hidden md:block md:col-span-1 text-center">Time</div>
          <div className="hidden md:block md:col-span-2 text-center">SLA Timer</div>
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
                  onClick={() => navigate(`/approver/document/${doc.id}`)}
                >
                  <div className="col-span-12 md:col-span-3 font-medium text-white flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-800 flex items-center justify-center text-slate-400 shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="truncate">
                      <p className="truncate text-sm md:text-base text-white">{doc.filename}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] text-slate-500 font-mono">ID: {doc.id}</p>
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

                  {/* SLA Countdown */}
                  <div className="hidden md:flex md:col-span-2 justify-center">
                    <SLACountdown createdAt={doc.created_at} status={doc.status} size="sm" />
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
                          title="Quick Approve"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={(e) => handleReject(doc.id, e)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <X size={18} strokeWidth={3} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => navigate(`/approver/document/${doc.id}`)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-brand-800 rounded-lg transition-colors"
                      title="Open Audit Workspace"
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
