import React, { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import SLACountdown, { isSLABreached, getSLADeadline, SLA_HOURS } from "../../components/dashboard/SLACountdown";
import { useRealtimeDocuments } from "../../hooks/useRealtimeDocuments";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Clock,
  ShieldAlert,
  Eye,
  RefreshCw,
  Users,
  UserCheck,
  UserCog,
  Activity,
  FileText,
  TrendingUp,
  Zap,
} from "lucide-react";

// Forced IST Formatter
const formatIST = (date) => {
  if (!date) return "—";
  try {
    const d = new Date(date);
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d) + " IST";
  } catch {
    return String(date);
  }
};

// Statuses that indicate a document is in REVIEWER queue
const REVIEWER_STATUSES = ["REVIEW_PENDING", "NEEDS_REVIEW"];
// Statuses that indicate a document is in APPROVER queue
const APPROVER_STATUSES = ["APPROVAL_PENDING", "REVIEWED"];

const statusBadgeClass = (status) => {
  const map = {
    REVIEW_PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    NEEDS_REVIEW: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    APPROVAL_PENDING: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    REVIEWED: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  };
  return map[status] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
};

function BreachRow({ doc, navigate }) {
  const deadline = getSLADeadline(doc.created_at);
  const breached = isSLABreached(doc.created_at);
  const overdueMs = breached ? Date.now() - deadline.getTime() : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`grid grid-cols-12 gap-3 px-5 py-4 items-center border-b border-brand-800/60 hover:bg-brand-800/20 transition-colors cursor-pointer group ${
        breached ? "bg-red-500/[0.03]" : ""
      }`}
      onClick={() => navigate(`/admin/document/${doc.id}`)}
    >
      {/* Doc name + ID */}
      <div className="col-span-12 md:col-span-4 flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            breached
              ? "bg-red-500/20 text-red-400"
              : "bg-orange-500/10 text-orange-400"
          }`}
        >
          {breached ? (
            <AlertTriangle size={16} className="animate-pulse" />
          ) : (
            <Clock size={16} />
          )}
        </div>
        <div className="truncate">
          <p className="text-sm text-white truncate font-medium group-hover:text-brand-accent transition-colors">
            {doc.filename}
          </p>
          <p className="text-[10px] text-slate-500 font-mono">ID: {doc.id}</p>
        </div>
      </div>

      {/* Status */}
      <div className="hidden md:flex md:col-span-2 justify-center">
        <span
          className={`text-[9px] px-2.5 py-1 rounded-full border font-bold uppercase tracking-wide ${statusBadgeClass(
            doc.status
          )}`}
        >
          {doc.status?.replace("_", " ")}
        </span>
      </div>

      {/* SLA Countdown */}
      <div className="col-span-6 md:col-span-3 flex justify-center">
        <SLACountdown createdAt={doc.created_at} status={doc.status} size="md" />
      </div>

      {/* Submitted At */}
      <div className="hidden md:block md:col-span-2 text-[10px] text-slate-500 font-mono text-center">
        {formatIST(doc.created_at)}
      </div>

      {/* Actions */}
      <div
        className="col-span-6 md:col-span-1 flex justify-end"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          title="View Document"
          onClick={() => navigate(`/admin/document/${doc.id}`)}
          className="p-2 text-slate-500 hover:text-brand-accent hover:bg-brand-800 rounded-lg transition-colors"
        >
          <Eye size={16} />
        </button>
      </div>
    </motion.div>
  );
}

function SLAPanel({ title, icon: Icon, iconColor, documents, navigate, emptyMsg }) {
  const breachedDocs = documents.filter((d) => isSLABreached(d.created_at));
  const pendingDocs = documents.filter((d) => !isSLABreached(d.created_at));

  return (
    <div className="bg-brand-900 border border-brand-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Panel Header */}
      <div className="px-6 py-5 border-b border-brand-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}>
            <Icon size={20} />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">{title}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {breachedDocs.length} breach{breachedDocs.length !== 1 ? "es" : ""} ·{" "}
              {pendingDocs.length} pending
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {breachedDocs.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 text-[10px] font-black uppercase tracking-widest">
                {breachedDocs.length} Breached
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-brand-800 text-[10px] font-semibold text-slate-600 uppercase tracking-wider bg-brand-950/40">
        <div className="col-span-12 md:col-span-4">Document / ID</div>
        <div className="hidden md:block md:col-span-2 text-center">Status</div>
        <div className="col-span-6 md:col-span-3 text-center">SLA Timer</div>
        <div className="hidden md:block md:col-span-2 text-center">Submitted At</div>
        <div className="col-span-6 md:col-span-1 text-right">View</div>
      </div>

      {/* Rows */}
      <div className="min-h-[100px]">
        {documents.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <ShieldAlert size={24} />
            </div>
            <p className="text-slate-500 text-sm">{emptyMsg}</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {/* Show breached first */}
            {breachedDocs.map((doc) => (
              <BreachRow key={doc.id} doc={doc} navigate={navigate} />
            ))}
            {/* Then pending */}
            {pendingDocs.map((doc) => (
              <BreachRow key={doc.id} doc={doc} navigate={navigate} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

export default function AdminSLABreaches({ navigate }) {
  const userRole = "admin";
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:8000/api/v1/documents?category=active", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();
      // Only include documents that are awaiting action (not terminal)
      const active = data.filter(
        (d) => !["APPROVED", "REJECTED", "FAILED", "UPLOADED", "PROCESSING"].includes(d.status)
      );
      setDocuments(active);
      setLastSync(new Date());
    } catch (err) {
      showToast("Failed to load documents", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Realtime subscription
  useRealtimeDocuments({
    enabled: true,
    onInsert: (newDoc) => {
      if (!["APPROVED", "REJECTED", "FAILED", "UPLOADED", "PROCESSING"].includes(newDoc.status)) {
        setDocuments((prev) => [newDoc, ...prev]);
        setIsConnected(true);
        setLastSync(new Date());
        showToast(`New document arrived: ${newDoc.filename}`, "info");
      }
    },
    onUpdate: (payload) => {
      setDocuments((prev) =>
        prev
          .map((d) => (d.id === payload.new.id ? payload.new : d))
          .filter((d) => !["APPROVED", "REJECTED", "FAILED", "UPLOADED", "PROCESSING"].includes(d.status))
      );
      setIsConnected(true);
      setLastSync(new Date());
    },
    onDelete: (deleted) => {
      setDocuments((prev) => prev.filter((d) => d.id !== deleted.id));
      setIsConnected(true);
      setLastSync(new Date());
    },
  });

  // Categorize docs by queue
  const reviewerQueue = documents.filter((d) => REVIEWER_STATUSES.includes(d.status));
  const approverQueue = documents.filter((d) => APPROVER_STATUSES.includes(d.status));

  const totalBreaches = [...reviewerQueue, ...approverQueue].filter((d) =>
    isSLABreached(d.created_at)
  ).length;

  const reviewerBreaches = reviewerQueue.filter((d) => isSLABreached(d.created_at)).length;
  const approverBreaches = approverQueue.filter((d) => isSLABreached(d.created_at)).length;

  return (
    <DashboardLayout role={userRole} navigate={navigate} title="SLA Breach Monitor">

      {/* Live indicator bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-4 py-3 bg-brand-900/60 border border-brand-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
              }`}
            />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {isConnected ? "Live · Realtime" : "Polling Mode"}
            </span>
          </div>
          <div className="w-px h-4 bg-brand-700" />
          <span className="text-[10px] text-slate-500 font-mono">
            SLA Window: <span className="text-white font-bold">{SLA_HOURS}h</span>
          </span>
          {lastSync && (
            <>
              <div className="w-px h-4 bg-brand-700" />
              <span className="text-[10px] text-slate-500 font-mono">
                Last sync:{" "}
                <span className="text-slate-300">
                  {lastSync.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour12: true })}
                </span>
              </span>
            </>
          )}
        </div>
        <button
          onClick={fetchDocuments}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-brand-800 border border-brand-700 rounded-lg text-slate-400 hover:text-white text-xs transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-brand-900 border border-brand-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
            <ShieldAlert size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Breaches</p>
            <p className={`text-2xl font-black ${totalBreaches > 0 ? "text-red-400" : "text-emerald-400"}`}>
              {totalBreaches}
            </p>
          </div>
        </div>

        <div className="bg-brand-900 border border-brand-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 shrink-0">
            <UserCog size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Reviewer Breaches</p>
            <p className={`text-2xl font-black ${reviewerBreaches > 0 ? "text-yellow-400" : "text-emerald-400"}`}>
              {reviewerBreaches}
            </p>
          </div>
        </div>

        <div className="bg-brand-900 border border-brand-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0">
            <UserCheck size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Approver Breaches</p>
            <p className={`text-2xl font-black ${approverBreaches > 0 ? "text-orange-400" : "text-emerald-400"}`}>
              {approverBreaches}
            </p>
          </div>
        </div>

        <div className="bg-brand-900 border border-brand-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Active in Queue</p>
            <p className="text-2xl font-black text-brand-accent">
              {reviewerQueue.length + approverQueue.length}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-brand-900/60 border border-brand-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Reviewer SLA Panel */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <UserCog size={15} className="text-yellow-400" />
              <h3 className="text-yellow-400 text-sm font-black uppercase tracking-widest">
                Reviewer Queue SLA
              </h3>
              <div className="flex-1 h-px bg-yellow-500/10" />
              <span className="text-[10px] text-slate-500 font-mono">
                {reviewerQueue.length} doc{reviewerQueue.length !== 1 ? "s" : ""} in review
              </span>
            </div>
            <SLAPanel
              title="Reviewer SLA Status"
              icon={UserCog}
              iconColor="bg-yellow-500/10 text-yellow-400"
              documents={reviewerQueue}
              navigate={navigate}
              emptyMsg="No documents currently in the reviewer queue"
            />
          </div>

          {/* Approver SLA Panel */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <UserCheck size={15} className="text-orange-400" />
              <h3 className="text-orange-400 text-sm font-black uppercase tracking-widest">
                Approver Queue SLA
              </h3>
              <div className="flex-1 h-px bg-orange-500/10" />
              <span className="text-[10px] text-slate-500 font-mono">
                {approverQueue.length} doc{approverQueue.length !== 1 ? "s" : ""} in approval
              </span>
            </div>
            <SLAPanel
              title="Approver SLA Status"
              icon={UserCheck}
              iconColor="bg-orange-500/10 text-orange-400"
              documents={approverQueue}
              navigate={navigate}
              emptyMsg="No documents currently in the approver queue"
            />
          </div>
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-2xl z-[300] border-2 flex items-center gap-4 max-w-sm ${
              toast.type === "error"
                ? "bg-red-950 border-red-900 text-red-200"
                : "bg-brand-900 border-brand-800 text-white"
            }`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                toast.type === "error" ? "bg-red-500 animate-pulse" : "bg-brand-accent"
              }`}
            />
            <p className="text-sm font-bold">{toast.msg}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
