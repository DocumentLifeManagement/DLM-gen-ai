import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

// Forced IST Formatter
const formatIST = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    return (
      new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(date) + " IST"
    );
  } catch (e) {
    return dateStr;
  }
};

import Button from "../../components/landing/Button";
import {
  FileText,
  CheckCircle,
  XCircle,
  Save,
  AlertCircle,
  ChevronLeft,
  ShieldCheck,
  History,
  ExternalLink,
  Info,
  Maximize2,
  Send,
  Trash2,
  Clock,
  Activity,
  UserCheck,
  Check,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export default function ReviewDocument({ navigate, id }) {
  const userRole = localStorage.getItem("role") || "reviewer";

  const [documentData, setDocumentData] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [notes, setNotes] = useState("");
  const [uploaderMessage, setUploaderMessage] = useState("");
  const [digitallySigned, setDigitallySigned] = useState(false);
  const [activeTab, setActiveTab] = useState("metadata"); // metadata | audit
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [lifecycle, setLifecycle] = useState([]);
  const [summaryText, setSummaryText] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://localhost:8000/api/v1/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch document details");

      const data = await res.json();
      setDocumentData(data);
      setFields(data.fields || []);
      setNotes(
        userRole === "approver"
          ? data.approver_notes || ""
          : data.reviewer_notes || "",
      );
      setIsDirty(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }

    // Fetch lifecycle history
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `http://localhost:8000/api/v1/documents/${id}/lifecycle`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const history = await res.json();
        setLifecycle(history);
      }
    } catch (err) {
      console.error("Failed to fetch lifecycle", err);
    }
  };

  const handleFieldChange = (index, value) => {
    const updated = [...fields];
    updated[index].value = value;
    setFields(updated);
    setIsDirty(true);
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveChanges = async (silent = false) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `http://localhost:8000/api/v1/documents/${id}/update-fields`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ fields }),
        },
      );

      if (!res.ok) throw new Error("Failed to update records");

      setIsDirty(false);
      if (!silent) showToast("Changes recorded");
      return true;
    } catch (err) {
      showToast(err.message, "error");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDecision = async (decisionType) => {
    if (
      decisionType === "APPROVE" &&
      userRole === "approver" &&
      !digitallySigned
    ) {
      showToast("Digital signature required for final approval", "error");
      return;
    }

    if (isDirty) {
      const saved = await handleSaveChanges(true);
      if (!saved) return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      const docId = parseInt(id);

      let endpoint = "review";
      let payload = { notes, uploader_message: uploaderMessage };

      if (decisionType === "APPROVE") {
        endpoint = userRole === "approver" ? "approve" : "review";
        payload.digitally_signed = digitallySigned;
      } else if (decisionType === "REJECT") {
        endpoint = "reject";
        payload.to_state = "REJECTED";
      } else if (decisionType === "RETURN") {
        endpoint = "reject";
        payload.to_state = "REVIEW_PENDING";
      }

      const res = await fetch(
        `http://localhost:8000/api/v1/documents/${docId}/${endpoint}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) throw new Error("Action failed");

      showToast("Action processed successfully");
      setTimeout(() => navigate(`/${userRole}`), 1000);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
      setShowRejectModal(false);
    }
  };

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    setSummaryText(null);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `http://localhost:8000/api/v1/generate-summary/${id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to generate summary");
      }
      const data = await res.json();
      setSummaryText(data.summary);
    } catch (err) {
      setSummaryError(err.message);
    } finally {
      setSummaryLoading(false);
    }
  };

  if (loading)
    return (
      <DashboardLayout
        role={userRole}
        navigate={navigate}
        title="Secure Auditor"
      >
        <div className="flex flex-col items-center justify-center p-20">
          <div className="w-12 h-12 border-2 border-brand-accent border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-500 font-medium">
            Synchronizing document environment...
          </p>
        </div>
      </DashboardLayout>
    );

  const avgConfidence = (
    (fields.reduce((acc, f) => acc + (f.confidence || 0), 0) /
      (fields.length || 1)) *
    100
  ).toFixed(1);

  return (
    <DashboardLayout
      role={userRole}
      navigate={navigate}
      title="Audit Control Center"
    >
      <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
        {/* Row 1: Top Navigation & Summary */}
        <div className="flex flex-col gap-4 bg-brand-900/50 p-4 md:p-6 rounded-2xl border border-brand-800 shadow-xl">
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate(`/${userRole}`)}
              className="p-2 md:p-3 bg-brand-800 hover:bg-brand-700 rounded-xl text-slate-400 hover:text-white transition-all border border-brand-700 shrink-0"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-base md:text-xl font-black text-white tracking-tight truncate">
                  {documentData.filename}
                </h2>
                <span
                  className={clsx(
                    "text-[9px] px-2 py-0.5 rounded-full border uppercase font-black tracking-widest whitespace-nowrap",
                    documentData.status === "REVIEW_PENDING"
                      ? "border-orange-500/30 text-orange-400 bg-orange-500/5"
                      : "border-brand-700 text-slate-500",
                  )}
                >
                  {documentData.status.replace("_", " ")}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-20 bg-brand-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-brand-accent h-full"
                      style={{ width: `${avgConfidence}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {avgConfidence}% AI Match
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-brand-950 rounded-lg border border-brand-800">
                  <AlertCircle
                    size={10}
                    className={
                      documentData.risk_score > 3
                        ? "text-red-400"
                        : "text-emerald-400"
                    }
                  />
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">
                    Stability: {10 - documentData.risk_score}/10
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              className="!border-red-500/20 !text-red-400 hover:!bg-red-500/10 !py-2 !px-4 text-xs uppercase font-bold tracking-widest"
              onClick={() => setShowRejectModal(true)}
            >
              <Trash2 size={14} className="mr-1.5" />
              Discard / Transfer
            </Button>
            <Button
              variant="primary"
              className="!py-2 !px-6 shadow-xl shadow-brand-accent/20 text-xs uppercase font-black tracking-widest"
              onClick={() => handleDecision("APPROVE")}
              disabled={saving}
            >
              <ShieldCheck size={16} className="mr-1.5" />
              {saving
                ? "Processing"
                : userRole === "approver"
                  ? "Authorize"
                  : "Verify & Forward"}
            </Button>
          </div>
        </div>

        {/* Row 2: Split View - stacks on mobile, side by side on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px] lg:h-[500px]">
          {/* Evidence Panel */}
          <div className="bg-brand-900 border border-brand-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden group">
            <div className="px-5 py-3 border-b border-brand-800 flex justify-between items-center bg-brand-950/40">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                <Activity size={12} className="text-brand-accent" /> Secure
                Visual Stream
              </span>
              <button
                onClick={() => window.open(documentData.s3_url, "_blank")}
                className="p-1.5 hover:bg-brand-accent/10 rounded-lg text-slate-400 hover:text-brand-accent transition-all"
              >
                <Maximize2 size={14} />
              </button>
            </div>
            <div className="flex-1 bg-brand-950/80 p-2">
              <iframe
                src={`${documentData.s3_url}#toolbar=0`}
                className="w-full h-full border-none rounded-lg opacity-90 group-hover:opacity-100 transition-opacity"
                title="Evidence"
              />
            </div>
          </div>

          {/* Work Panel */}
          <div className="bg-brand-900 border border-brand-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            <div className="flex border-b border-brand-800 bg-brand-950/40">
              <button
                onClick={() => setActiveTab("metadata")}
                className={clsx(
                  "px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
                  activeTab === "metadata"
                    ? "text-brand-accent"
                    : "text-slate-500 hover:text-slate-300",
                )}
              >
                Metadata Extraction
                {activeTab === "metadata" && (
                  <motion.div
                    layoutId="tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent shadow-[0_0_10px_rgba(var(--brand-accent-rgb),0.8)]"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab("audit")}
                className={clsx(
                  "px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
                  activeTab === "audit"
                    ? "text-brand-accent"
                    : "text-slate-500 hover:text-slate-300",
                )}
              >
                Audit Trail
                {activeTab === "audit" && (
                  <motion.div
                    layoutId="tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent shadow-[0_0_10px_rgba(var(--brand-accent-rgb),0.8)]"
                  />
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <AnimatePresence mode="wait">
                {activeTab === "metadata" ? (
                  <motion.div
                    key="meta"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
                  >
                    {fields.map((field, idx) => (
                      <div key={idx} className="space-y-2 group">
                        <div className="flex justify-between items-center opacity-60 group-hover:opacity-100 transition-opacity">
                          <label className="text-[9px] text-brand-accent font-black uppercase tracking-widest">
                            {field.key}
                          </label>
                          <span className="text-[8px] text-slate-600 font-mono">
                            {(field.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <input
                          value={field.value}
                          onChange={(e) =>
                            handleFieldChange(idx, e.target.value)
                          }
                          className="w-full bg-brand-950/30 border border-brand-800 hover:border-brand-700 focus:border-brand-accent py-2.5 px-4 rounded-xl text-xs text-white outline-none transition-all"
                        />
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="audit"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    {/* Risk Indicators */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Activity size={12} /> AI Risk Assessment
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {documentData?.risk_indicators?.length > 0 ? (
                          [...new Set(documentData.risk_indicators)].map(
                            (risk, i) => (
                              <div
                                key={i}
                                className="flex flex-col justify-center p-3 bg-red-500/5 border border-red-500/10 rounded-xl"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-red-400">
                                    {risk}
                                  </span>
                                  <AlertCircle
                                    size={14}
                                    className="text-red-500/50"
                                  />
                                </div>
                                {risk === "HIGH_VALUE_THRESHOLD" && (
                                  <span className="text-[9px] text-slate-500 mt-1">
                                    Disclaimer: This document was flagged
                                    because it contains a monetary value
                                    exceeding the limit of $5,000.
                                  </span>
                                )}
                              </div>
                            ),
                          )
                        ) : (
                          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-emerald-500/80 text-[10px] font-bold">
                            Zero Risks Detected in Current Pattern
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline / History */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <History size={12} /> Decision History
                      </h4>
                      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-brand-800">
                        {lifecycle.length > 0 ? (
                          lifecycle.map((entry, idx) => (
                            <div key={idx} className="relative">
                              <div
                                className={clsx(
                                  "absolute -left-6 top-1.5 w-4 h-4 rounded-full border-4 border-brand-950",
                                  entry.to === "REJECTED"
                                    ? "bg-red-500"
                                    : entry.to === "APPROVED" ||
                                        entry.to === "ARCHIVED"
                                      ? "bg-emerald-500"
                                      : entry.to === "APPROVAL_PENDING"
                                        ? "bg-amber-500"
                                        : "bg-brand-800",
                                )}
                              />
                              <div className="p-4 bg-brand-950/50 border border-brand-800 rounded-xl">
                                <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">
                                  {entry.from === "NONE"
                                    ? "Initial Document Inflow"
                                    : `${entry.from} → ${entry.to}`}
                                </span>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-[10px] text-white font-bold">
                                    {entry.actor_name || entry.actor_id}{" "}
                                    <span className="text-slate-600 font-mono text-[8px] ml-1 uppercase">
                                      {entry.actor_type}
                                    </span>
                                  </span>
                                  <span className="text-[8px] text-slate-500 font-mono">
                                    {formatIST(entry.timestamp)}
                                  </span>
                                </div>
                                {entry.notes && (
                                  <p className="text-[11px] text-slate-300 italic bg-brand-900/40 p-3 rounded-lg border border-brand-800/50 leading-relaxed">
                                    "{entry.notes}"
                                  </p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="relative">
                            <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-brand-800 border-4 border-brand-950" />
                            <div className="p-4 bg-brand-950/50 border border-brand-800 rounded-xl">
                              <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">
                                Initial Ingestion
                              </span>
                              <p className="text-[10px] text-slate-400">
                                System captured and archived record.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Row 2.5: AI Summary Section */}
        <div className="bg-brand-900/50 border border-brand-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={14} className="text-purple-400" /> AI Document
              Intelligence
            </h3>
            <button
              onClick={handleGenerateSummary}
              disabled={summaryLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-brand-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
            >
              {summaryLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={12} />
                  Generate AI Summary
                </>
              )}
            </button>
          </div>

          {summaryLoading && !summaryText && (
            <div className="flex items-center gap-3 p-5 bg-brand-950/60 border border-brand-800 rounded-xl">
              <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
              <span className="text-xs text-slate-400 font-medium">
                Analyzing document with AI...
              </span>
            </div>
          )}

          {summaryError && (
            <div className="flex items-center gap-3 p-5 bg-red-500/5 border border-red-500/15 rounded-xl">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <span className="text-xs text-red-400 font-medium">
                {summaryError}
              </span>
            </div>
          )}

          {summaryText && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-brand-950 to-purple-950/20 border border-purple-500/15 rounded-xl overflow-hidden"
            >
              <div className="px-5 py-3 border-b border-purple-500/10 bg-purple-500/5 flex items-center gap-2">
                <Sparkles size={12} className="text-purple-400" />
                <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">
                  AI Generated Summary
                </span>
              </div>
              <div className="p-5">
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {summaryText}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Row 3: Dedicated Decision Area (Bottom of Page) */}
        <div className="bg-brand-950 border border-brand-800 rounded-2xl p-8 shadow-2xl flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-white uppercase tracking-widest">
                  Auditor Statement
                </label>
                <span className="text-[9px] text-slate-500 font-mono">
                  {notes.length} chars
                </span>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Provide justification for authorization or transfer..."
                className="w-full bg-brand-900/50 border border-brand-800 focus:border-brand-accent rounded-xl p-4 text-xs text-white outline-none min-h-[80px] transition-all resize-none shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-brand-cyan uppercase tracking-widest flex items-center gap-1.5">
                  <Send size={9} /> Message to Uploader
                </label>
                <span className="text-[9px] text-slate-600 font-mono">
                  Optional feedback
                </span>
              </div>
              <textarea
                value={uploaderMessage}
                onChange={(e) => setUploaderMessage(e.target.value)}
                placeholder="Leave feedback for the document uploader (e.g. missing pages, wrong format)..."
                className="w-full bg-brand-950/60 border border-brand-cyan/20 focus:border-brand-cyan rounded-xl p-4 text-xs text-white outline-none min-h-[70px] transition-all resize-none shadow-inner"
              />
            </div>
          </div>

          <div className="w-full md:w-[400px] flex flex-col justify-between py-1">
            {userRole === "approver" ? (
              <div
                onClick={() => setDigitallySigned(!digitallySigned)}
                className={clsx(
                  "group cursor-pointer flex items-center justify-between p-6 rounded-2xl border transition-all duration-300",
                  digitallySigned
                    ? "bg-brand-accent/10 border-brand-accent/40 shadow-[0_0_20px_rgba(var(--brand-accent-rgb),0.1)]"
                    : "bg-brand-900/50 border-brand-800 hover:border-brand-700",
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={clsx(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                      digitallySigned
                        ? "bg-brand-accent text-white"
                        : "bg-brand-800 text-slate-600 group-hover:text-slate-400",
                    )}
                  >
                    <UserCheck size={24} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-tight">
                      Apply Digital Identity
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight">
                      Certifying data integrity & compliance.
                    </p>
                  </div>
                </div>
                <div
                  className={clsx(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    digitallySigned
                      ? "bg-brand-accent border-brand-accent text-white"
                      : "border-brand-700 bg-brand-950",
                  )}
                >
                  {digitallySigned && <Check size={14} strokeWidth={3} />}
                </div>
              </div>
            ) : (
              <div className="p-6 bg-brand-900/30 border border-brand-800 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck size={18} className="text-brand-accent" />
                  <h4 className="text-xs font-black text-white uppercase uppercase">
                    Verification Mode
                  </h4>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  As a reviewer, your notes will be forwarded to the ultimate
                  approver for final authorization.
                </p>
              </div>
            )}

            <div className="flex justify-between items-center mt-6">
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                <div
                  className={clsx(
                    "w-2 h-2 rounded-full",
                    isDirty ? "bg-orange-500 animate-pulse" : "bg-emerald-500",
                  )}
                />
                {isDirty ? "Cache Mismatch" : "Records Synced"}
              </div>
              <button
                onClick={() => handleSaveChanges()}
                className={clsx(
                  "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                  isDirty
                    ? "text-brand-accent hover:opacity-80"
                    : "text-slate-800 cursor-default",
                )}
                disabled={!isDirty || saving}
              >
                <Save size={14} /> Commit Sync
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Intervention Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRejectModal(false)}
              className="absolute inset-0 bg-brand-1000/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-brand-900 border border-brand-800 rounded-[32px] p-10 text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-500 border border-red-500/20 shadow-lg">
                <XCircle size={40} />
              </div>
              <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">
                Audit Intervention
              </h3>
              <p className="text-sm text-slate-400 mb-10 leading-relaxed">
                Choose the destination for this record. Returning to reviewer
                shifts the workflow back, while discarding permanently archives
                it as a failure.
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => handleDecision("RETURN")}
                  className="w-full py-5 bg-brand-800 hover:bg-brand-700 text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all border border-brand-700"
                >
                  <Send size={18} className="text-orange-400" />
                  Reroute to Reviewer
                </button>
                <button
                  onClick={() => handleDecision("REJECT")}
                  className="w-full py-5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all border border-red-500/20"
                >
                  <Trash2 size={18} />
                  Terminate Record
                </button>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-4 hover:text-white transition-colors"
                >
                  Abort & Continue Audit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {toast && (
        <div
          className={clsx(
            "fixed bottom-8 right-8 px-8 py-5 rounded-2xl shadow-2xl z-[300] border-2 flex items-center gap-4 animate-in slide-in-from-right-10",
            toast.type === "error"
              ? "bg-red-950 border-red-900 text-red-200"
              : "bg-brand-900 border-brand-800 text-white",
          )}
        >
          <div
            className={clsx(
              "w-2.5 h-2.5 rounded-full",
              toast.type === "error"
                ? "bg-red-500"
                : "bg-brand-accent shadow-[0_0_8px_rgba(var(--brand-accent-rgb),1)]",
            )}
          />
          <p className="text-sm font-bold tracking-tight">{toast.msg}</p>
        </div>
      )}
    </DashboardLayout>
  );
}
