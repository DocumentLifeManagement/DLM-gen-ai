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
  Users,
  Activity,
  AlertTriangle,
  BarChart3,
  RefreshCw,
  Archive,
  History,
  ShieldCheck,
} from "lucide-react";

export default function AdminDashboard({ navigate, query }) {
  const userRole = "admin";

  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("desc");
  const [toast, setToast] = useState(null); // { msg, type }
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState(query?.tab || "active"); // Initialize from query params
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const limit = 10;
  const SLA_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

  useEffect(() => {
    fetchDocuments();
  }, [activeTab]); // Refetch when tab changes

  useEffect(() => {
    applyFilters();
  }, [documents, search, statusFilter, sortOrder]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");

      // Pass category based on activeTab
      const res = await fetch(
        `http://localhost:8000/api/v1/documents?category=${activeTab}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) throw new Error("Failed to fetch documents");

      const data = await res.json();
      setDocuments(data);
      setPage(1); // Reset page on new fetch
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Update URL without full refresh to preserve navigation state
    navigate(`/admin?tab=${tab}`);
  };

  const isSLABreached = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    return now - created > SLA_THRESHOLD_MS;
  };

  const applyFilters = () => {
    let temp = [...documents];

    if (statusFilter !== "ALL") {
      if (statusFilter === "SLA_BREACH") {
        temp = temp.filter(
          (doc) =>
            !["APPROVED", "REJECTED"].includes(doc.status) &&
            isSLABreached(doc.created_at),
        );
      } else {
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

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Move this document to the Bin? it will be kept for 30 days.",
      )
    )
      return;

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://localhost:8000/api/v1/documents/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete");
      setDocuments((docs) => docs.filter((d) => d.id !== id));
      showToast("Document moved to Bin");
    } catch (err) {
      showToast("Failed to delete document");
    }
  };

  const handlePurge = async (id, e) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Permanently delete this document? This cannot be undone.",
      )
    )
      return;

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `http://localhost:8000/api/v1/documents/${id}/purge`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) throw new Error("Failed to purge");
      setDocuments((docs) => docs.filter((d) => d.id !== id));
      showToast("Document permanently deleted");
    } catch (err) {
      showToast("Failed to purge document");
    }
  };

  const handleRestore = async (id, e) => {
    e.stopPropagation();
    // Find doc before removing it to check if it was archived
    const docToRestore = documents.find((d) => d.id === id);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `http://localhost:8000/api/v1/documents/${id}/restore`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) throw new Error("Failed to restore");
      setDocuments((docs) => docs.filter((d) => d.id !== id));

      if (docToRestore?.archived_at) {
        showToast("Document restored to Archive");
        handleTabChange("archived");
      } else {
        showToast("Document restored to Active Files");
        handleTabChange("active");
      }
    } catch (err) {
      showToast("Failed to restore document", "error");
    }
  };

  const handleArchive = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Archive this document?")) return;

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `http://localhost:8000/api/v1/documents/${id}/archive`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) throw new Error("Failed to archive");
      setDocuments((docs) => docs.filter((d) => d.id !== id));
      showToast("Document archived successfully");
    } catch (err) {
      showToast("Failed to archive document");
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleBulkAction = async () => {
    const isPurge = activeTab === "bin";
    const endpoint = isPurge ? "bulk-purge" : "bulk-delete";
    const confirmMsg = isPurge
      ? `Permanently purge ${selectedIds.length} documents? This action is IRREVERSIBLE.`
      : `Move ${selectedIds.length} documents to bin?`;

    setConfirmModal({
      show: true,
      title: isPurge ? "Permanent Purge" : "Move to Bin",
      message: confirmMsg,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, show: false }));
        await executeBulkAction(endpoint);
      },
    });
  };

  const executeBulkAction = async (endpoint) => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/documents/${endpoint}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids: selectedIds }),
        },
      );
      if (!res.ok) throw new Error("Bulk action failed");
      setDocuments(documents.filter((doc) => !selectedIds.includes(doc.id)));
      setSelectedIds([]);
      setIsSelectionMode(false); // Reset selection mode
      showToast(`Action successful for ${selectedIds.length} documents`);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const paginatedDocs = filteredDocs.slice((page - 1) * limit, page * limit);

  const statusBadge = (status) => {
    const styles = {
      UPLOADED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      PROCESSING: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      NEEDS_REVIEW: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      REVIEW_PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      REVIEWED: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      APPROVAL_PENDING: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      APPROVED: "bg-green-500/10 text-green-400 border-green-500/20",
      REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
      FAILED: "bg-red-500/20 text-red-300 border-red-500/30",
    };
    return (
      styles[status] || "bg-slate-500/10 text-slate-400 border-slate-500/20"
    );
  };

  // KPI Calculations
  const total = documents.length; // Note: this count is specific to the current tab
  const approvedDocs = documents.filter((d) => d.status === "APPROVED").length;
  const completionRate =
    total > 0 ? ((approvedDocs / total) * 100).toFixed(1) : 0;
  const activeDocsArr = documents.filter(
    (d) => !["APPROVED", "REJECTED", "FAILED"].includes(d.status),
  );
  const slaBreaches = documents.filter(
    (d) =>
      !["APPROVED", "REJECTED", "FAILED"].includes(d.status) &&
      isSLABreached(d.created_at),
  ).length;

  return (
    <DashboardLayout
      role={userRole}
      navigate={navigate}
      title="Admin Controller"
    >
      {/* System Overview KPI Section */}
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <BarChart3 size={18} className="text-brand-accent" />
        {activeTab === "active"
          ? "System Overview"
          : activeTab === "bin"
            ? "Bin Overview"
            : "Archive Overview"}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Documents"
          value={total}
          icon={FileText}
          color="text-brand-accent"
          compact={true}
        />
        {activeTab === "active" && (
          <>
            <StatCard
              title="Completion Rate"
              value={`${completionRate}%`}
              icon={CheckCircle}
              color="text-green-400"
              compact={true}
            />
            <StatCard
              title="System Load"
              value={`${activeDocsArr.length} Active`}
              icon={Activity}
              color="text-brand-cyan"
              compact={true}
            />
            <StatCard
              title="SLA Breaches"
              value={slaBreaches}
              icon={AlertTriangle}
              color={slaBreaches > 0 ? "text-red-500" : "text-slate-400"}
              compact={true}
            />
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-brand-800 overflow-x-auto">
        <button
          onClick={() => handleTabChange("active")}
          className={`pb-3 px-3 md:px-4 text-xs md:text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === "active" ? "text-brand-accent" : "text-slate-400 hover:text-white"}`}
        >
          <span className="flex items-center gap-1.5">
            <FileText size={14} /> Active Files
          </span>
          {activeTab === "active" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-accent shadow-[0_0_10px_rgba(56,189,248,0.5)]"></div>
          )}
        </button>
        <button
          onClick={() => handleTabChange("archived")}
          className={`pb-3 px-3 md:px-4 text-xs md:text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === "archived" ? "text-brand-accent" : "text-slate-400 hover:text-white"}`}
        >
          <span className="flex items-center gap-1.5">
            <Archive size={14} /> Archived
          </span>
          {activeTab === "archived" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-accent shadow-[0_0_10px_rgba(56,189,248,0.5)]"></div>
          )}
        </button>
        <button
          onClick={() => handleTabChange("bin")}
          className={`pb-3 px-3 md:px-4 text-xs md:text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === "bin" ? "text-brand-accent" : "text-slate-400 hover:text-white"}`}
        >
          <span className="flex items-center gap-1.5">
            <Trash2 size={14} /> Bin
          </span>
          {activeTab === "bin" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-accent shadow-[0_0_10px_rgba(56,189,248,0.5)]"></div>
          )}
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="relative w-full">
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

        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              if (isSelectionMode) setSelectedIds([]);
            }}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg",
              isSelectionMode
                ? "bg-brand-accent text-white border-brand-accent"
                : "bg-brand-900 border-brand-800 text-slate-400 hover:text-white",
            )}
          >
            {isSelectionMode ? "Cancel" : "Delete Files"}
          </button>

          {isSelectionMode && selectedIds.length > 0 && (
            <button
              onClick={handleBulkAction}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
            >
              <Trash2 size={14} /> {activeTab === "bin" ? "Purge" : "Trash"} (
              {selectedIds.length})
            </button>
          )}

          <div className="relative flex-1 min-w-[140px]">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-brand-900/50 border border-brand-800 text-white rounded-lg pl-10 pr-8 py-2.5 appearance-none focus:outline-none focus:border-brand-accent transition-colors text-sm"
            >
              <option value="ALL">All Status</option>
              <option value="SLA_BREACH">SLA Breaches</option>
              <option value="UPLOADED">Uploaded</option>
              <option value="PROCESSING">Processing</option>
              <option value="NEEDS_REVIEW">In Review</option>
              <option value="REVIEWED">In Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="relative flex-1 min-w-[130px]">
            <SlidersHorizontal
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full bg-brand-900/50 border border-brand-800 text-white rounded-lg pl-10 pr-8 py-2.5 appearance-none focus:outline-none focus:border-brand-accent transition-colors text-sm"
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
          <div className="hidden md:block md:col-span-1">Date</div>
          <div className="hidden md:block md:col-span-1 text-center">Time</div>
          <div className="hidden md:block md:col-span-2 text-center">
            Risk Index
          </div>
          <div className="col-span-6 md:col-span-2 text-center">Stage</div>
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
                No documents found in{" "}
                {activeTab === "bin"
                  ? "the bin"
                  : activeTab === "archived"
                    ? "the archive"
                    : "active files"}
                .
              </div>
            ) : (
              paginatedDocs.map((doc) => {
                const breached =
                  !["APPROVED", "REJECTED", "FAILED"].includes(doc.status) &&
                  isSLABreached(doc.created_at);

                return (
                  <div
                    key={doc.id}
                    className={clsx(
                      "grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-brand-800/30 transition-colors group cursor-pointer relative",
                      breached && activeTab === "active" ? "bg-red-500/5" : "",
                      isSelectionMode && selectedIds.includes(doc.id)
                        ? "border-l-4 border-l-brand-accent bg-brand-accent/5"
                        : "",
                    )}
                    onClick={() =>
                      isSelectionMode
                        ? toggleSelect(doc.id)
                        : navigate(`/admin/document/${doc.id}`)
                    }
                  >
                    <div className="col-span-12 md:col-span-4 font-medium text-white flex items-center gap-4">
                      {isSelectionMode && (
                        <div
                          className="p-1 animate-in zoom-in-50 duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelect(doc.id);
                          }}
                        >
                          <div
                            className={clsx(
                              "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                              selectedIds.includes(doc.id)
                                ? "bg-brand-accent border-brand-accent"
                                : "border-brand-800 bg-brand-950 group-hover:border-brand-700",
                            )}
                          >
                            {selectedIds.includes(doc.id) && (
                              <CheckCircle size={12} className="text-white" />
                            )}
                          </div>
                        </div>
                      )}
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${breached && activeTab === "active" ? "bg-red-500/20 text-red-500" : "bg-brand-800 text-slate-400"}`}
                      >
                        {breached && activeTab === "active" ? (
                          <AlertTriangle size={20} />
                        ) : (
                          <FileText size={20} />
                        )}
                      </div>
                      <div className="truncate">
                        <p className="truncate text-sm md:text-base flex items-center gap-2 text-white">
                          {doc.filename}
                          {breached && activeTab === "active" && (
                            <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">
                              SLA Breach
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                          ID: {doc.id}
                        </p>
                      </div>
                    </div>
                    <div className="hidden md:block md:col-span-1 text-slate-400 text-xs">
                      {formatIST(doc.created_at, "date")}
                    </div>
                    <div className="hidden md:block md:col-span-1 text-slate-500 text-[10px] font-mono text-center">
                      {formatIST(doc.created_at, "time")}
                    </div>

                    {/* New Risk Analysis Pillar */}
                    <div className="hidden md:block md:col-span-2 text-center">
                      {doc.risk_indicators?.length > 0 ? (
                        <div className="flex flex-col gap-1 items-center">
                          <span className="text-[9px] px-2 py-0.5 bg-red-500/10 text-red-500 rounded border border-red-500/20 font-bold w-fit">
                            {doc.risk_indicators[0]}
                          </span>
                          {doc.risk_indicators.length > 1 && (
                            <span className="text-[8px] text-slate-600 font-mono tracking-tighter">
                              +{doc.risk_indicators.length - 1} MORE FLAGS
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20 font-bold uppercase tracking-tighter scale-90">
                          Low Risk
                        </span>
                      )}
                    </div>

                    <div className="col-span-6 md:col-span-2 flex justify-center">
                      <span
                        className={`text-[10px] md:text-xs px-2.5 py-1 rounded-full border font-medium ${statusBadge(doc.status)}`}
                      >
                        {doc.status ? doc.status.replace("_", " ") : "INGESTED"}
                      </span>
                    </div>
                    <div
                      className="col-span-6 md:col-span-2 flex justify-end gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Active Actions */}
                      {activeTab === "active" && (
                        <>
                          <button
                            className="p-2 text-slate-400 hover:text-white hover:bg-brand-800 rounded-lg transition-colors"
                            title="View Details"
                            onClick={() =>
                              navigate(`/admin/document/${doc.id}`)
                            }
                          >
                            <Eye size={18} />
                          </button>
                          {/* Only allow archive if approved/rejected */}
                          {(doc.status === "APPROVED" ||
                            doc.status === "REJECTED") && (
                            <button
                              onClick={(e) => handleArchive(doc.id, e)}
                              className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Archive Document"
                            >
                              <Archive size={18} />
                            </button>
                          )}
                        </>
                      )}

                      {/* Bin Actions */}
                      {activeTab === "bin" && (
                        <>
                          <button
                            onClick={(e) => handleRestore(doc.id, e)}
                            className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-900/30 rounded-lg transition-colors"
                            title="Restore Document"
                          >
                            <RefreshCw size={18} />
                          </button>
                          <button
                            className="p-2 text-slate-400 hover:text-white hover:bg-brand-800 rounded-lg transition-colors"
                            title="View Details"
                            onClick={() =>
                              navigate(`/admin/document/${doc.id}`)
                            }
                          >
                            <Eye size={18} />
                          </button>
                        </>
                      )}

                      {/* Archived Actions */}
                      {activeTab === "archived" && (
                        <>
                          <button
                            onClick={(e) => handleRestore(doc.id, e)}
                            className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-900/30 rounded-lg transition-colors"
                            title="Restore to Active"
                          >
                            <RefreshCw size={18} />
                          </button>
                          <button
                            className="p-2 text-slate-400 hover:text-white hover:bg-brand-800 rounded-lg transition-colors"
                            title="View Details"
                            onClick={() =>
                              navigate(`/admin/document/${doc.id}`)
                            }
                          >
                            <Eye size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
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

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-6"
            onClick={() => setConfirmModal({ ...confirmModal, show: false })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-brand-900 border border-brand-800 rounded-3xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden text-center"
            >
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 shadow-inner">
                <ShieldAlert size={32} />
              </div>
              <h3 className="text-xl font-black text-white mb-2">
                {confirmModal.title}
              </h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                {confirmModal.message}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() =>
                    setConfirmModal({ ...confirmModal, show: false })
                  }
                  className="flex-1 py-3.5 px-6 rounded-xl bg-brand-800 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all border border-brand-700 hover:border-brand-600"
                >
                  Abort Operation
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-rose-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-rose-950/40 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Yes, Execute
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className={clsx(
              "fixed bottom-4 right-4 md:bottom-8 md:right-8 px-5 md:px-8 py-4 md:py-5 rounded-2xl shadow-2xl z-[300] border-2 flex items-center gap-4 max-w-[calc(100vw-2rem)]",
              toast.type === "error"
                ? "bg-red-950 border-red-900 text-red-200"
                : "bg-brand-900 border-brand-800 text-white",
            )}
          >
            <div
              className={clsx(
                "w-2.5 h-2.5 rounded-full",
                toast.type === "error"
                  ? "bg-red-500 animate-pulse"
                  : "bg-brand-accent shadow-[0_0_10px_rgba(var(--brand-accent-rgb),1)]",
              )}
            />
            <div className="flex flex-col">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-0.5">
                {toast.type === "error"
                  ? "System Warning"
                  : "Operation Success"}
              </p>
              <p className="text-sm font-bold tracking-tight">{toast.msg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
