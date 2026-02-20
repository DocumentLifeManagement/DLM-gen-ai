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
  Users,
  Activity,
  AlertTriangle,
  BarChart3,
  RefreshCw,
  Archive,
  History
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
  const [activeTab, setActiveTab] = useState("active"); // active, bin, archived

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
        }
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

  const isSLABreached = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    return (now - created) > SLA_THRESHOLD_MS;
  };

  const applyFilters = () => {
    let temp = [...documents];

    if (statusFilter !== "ALL") {
      if (statusFilter === "SLA_BREACH") {
        temp = temp.filter((doc) =>
          !["APPROVED", "REJECTED"].includes(doc.status) && isSLABreached(doc.created_at)
        );
      } else {
        temp = temp.filter((doc) => doc.status === statusFilter);
      }
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
    if (!window.confirm("Move this document to the Bin? it will be kept for 30 days.")) return;

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://localhost:8000/api/v1/documents/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete");
      setDocuments(docs => docs.filter(d => d.id !== id));
      showToast("Document moved to Bin");
    } catch (err) {
      showToast("Failed to delete document");
    }
  };

  const handlePurge = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Permanently delete this document? This cannot be undone.")) return;

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://localhost:8000/api/v1/documents/${id}/purge`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to purge");
      setDocuments(docs => docs.filter(d => d.id !== id));
      showToast("Document permanently deleted");
    } catch (err) {
      showToast("Failed to purge document");
    }
  };

  const handleRestore = async (id, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://localhost:8000/api/v1/documents/${id}/restore`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to restore");
      setDocuments(docs => docs.filter(d => d.id !== id));
      showToast("Document restored successfully");
    } catch (err) {
      showToast("Failed to restore document");
    }
  };

  const handleArchive = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Archive this document?")) return;

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://localhost:8000/api/v1/documents/${id}/archive`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to archive");
      setDocuments(docs => docs.filter(d => d.id !== id));
      showToast("Document archived successfully");
    } catch (err) {
      showToast("Failed to archive document");
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
      REVIEW_PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      REVIEWED: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      APPROVAL_PENDING: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      APPROVED: "bg-green-500/10 text-green-400 border-green-500/20",
      REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
      FAILED: "bg-red-500/20 text-red-300 border-red-500/30",
    };
    return styles[status] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
  };

  // KPI Calculations
  const total = documents.length; // Note: this count is specific to the current tab
  const approvedDocs = documents.filter(d => d.status === "APPROVED").length;
  const completionRate = total > 0 ? ((approvedDocs / total) * 100).toFixed(1) : 0;
  const activeDocs = documents.filter(d => !["APPROVED", "REJECTED", "FAILED"].includes(d.status));
  const slaBreaches = documents.filter(d =>
    !["APPROVED", "REJECTED", "FAILED"].includes(d.status) && isSLABreached(d.created_at)
  ).length;

  return (
    <DashboardLayout role={userRole} navigate={navigate} title="Admin Controller">

      {/* System Overview KPI Section */}
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <BarChart3 size={18} className="text-brand-accent" />
        {activeTab === 'active' ? 'System Overview' : activeTab === 'bin' ? 'Bin Overview' : 'Archive Overview'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Documents"
          value={total}
          icon={FileText}
          color="text-brand-accent"
        />
        {activeTab === 'active' && (
          <>
            <StatCard
              title="Completion Rate"
              value={`${completionRate}%`}
              icon={CheckCircle}
              color="text-green-400"
            />
            <StatCard
              title="System Load"
              value={`${activeDocs.length} Active`}
              icon={Activity}
              color="text-brand-cyan"
            />
            <StatCard
              title="SLA Breaches"
              value={slaBreaches}
              icon={AlertTriangle}
              color={slaBreaches > 0 ? "text-red-500" : "text-slate-400"}
            />
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-brand-800">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'active' ? 'text-brand-accent' : 'text-slate-400 hover:text-white'}`}
        >
          <span className="flex items-center gap-2"><FileText size={16} /> Active Files</span>
          {activeTab === 'active' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-accent shadow-[0_0_10px_rgba(56,189,248,0.5)]"></div>}
        </button>
        <button
          onClick={() => setActiveTab("archived")}
          className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'archived' ? 'text-brand-accent' : 'text-slate-400 hover:text-white'}`}
        >
          <span className="flex items-center gap-2"><Archive size={16} /> Archived Files</span>
          {activeTab === 'archived' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-accent shadow-[0_0_10px_rgba(56,189,248,0.5)]"></div>}
        </button>
        <button
          onClick={() => setActiveTab("bin")}
          className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'bin' ? 'text-brand-accent' : 'text-slate-400 hover:text-white'}`}
        >
          <span className="flex items-center gap-2"><Trash2 size={16} /> Bin</span>
          {activeTab === 'bin' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-accent shadow-[0_0_10px_rgba(56,189,248,0.5)]"></div>}
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
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
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-44 bg-brand-900/50 border border-brand-800 text-white rounded-lg pl-10 pr-8 py-2.5 appearance-none focus:outline-none focus:border-brand-accent transition-colors text-sm"
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
                No documents found in {activeTab === 'bin' ? 'the bin' : activeTab === 'archived' ? 'the archive' : 'active files'}.
              </div>
            ) : (
              paginatedDocs.map((doc) => {
                const breached = !["APPROVED", "REJECTED", "FAILED"].includes(doc.status) && isSLABreached(doc.created_at);

                return (
                  <div
                    key={doc.id}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-brand-800/30 transition-colors group cursor-pointer ${breached && activeTab === 'active' ? 'bg-red-500/5' : ''}`}
                    onClick={() => navigate(`/admin/document/${doc.id}`)}
                  >
                    <div className="col-span-12 md:col-span-4 font-medium text-white flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${breached && activeTab === 'active' ? 'bg-red-500/20 text-red-500' : 'bg-brand-800 text-slate-400'}`}>
                        {breached && activeTab === 'active' ? <AlertTriangle size={20} /> : <FileText size={20} />}
                      </div>
                      <div className="truncate">
                        <p className="truncate text-sm md:text-base flex items-center gap-2">
                          {doc.filename}
                          {breached && activeTab === 'active' && (
                            <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">
                              SLA Breach
                            </span>
                          )}
                        </p>
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
                    <div className="col-span-6 md:col-span-2 flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {/* Active Actions */}
                      {activeTab === 'active' && (
                        <>
                          <button
                            className="p-2 text-slate-400 hover:text-white hover:bg-brand-800 rounded-lg transition-colors"
                            title="View Details"
                            onClick={() => navigate(`/admin/document/${doc.id}`)}
                          >
                            <Eye size={18} />
                          </button>
                          {/* Only allow archive if approved/rejected */}
                          {(doc.status === 'APPROVED' || doc.status === 'REJECTED') && (
                            <button
                              onClick={(e) => handleArchive(doc.id, e)}
                              className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Archive Document"
                            >
                              <Archive size={18} />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDelete(doc.id, e)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Move to Bin"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}

                      {/* Bin Actions */}
                      {activeTab === 'bin' && (
                        <>
                          <button
                            onClick={(e) => handleRestore(doc.id, e)}
                            className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-900/30 rounded-lg transition-colors"
                            title="Restore Document"
                          >
                            <RefreshCw size={18} />
                          </button>
                          <button
                            onClick={(e) => handlePurge(doc.id, e)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Permanently Delete"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}

                      {/* Archived Actions */}
                      {activeTab === 'archived' && (
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
                            onClick={() => navigate(`/admin/document/${doc.id}`)}
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
