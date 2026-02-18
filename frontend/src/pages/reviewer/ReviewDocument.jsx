import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
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
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export default function ReviewDocument({ navigate, id }) {
  const userRole = "reviewer";

  const [documentData, setDocumentData] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://localhost:8000/api/v1/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Failed to fetch document details");

      const data = await res.json();
      setDocumentData(data);
      setFields(data.fields || []);
      setIsDirty(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
      const res = await fetch(`http://localhost:8000/api/v1/documents/${id}/update-fields`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          fields
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to update records");
      }

      setIsDirty(false);
      if (!silent) showToast("All changes saved successfully");
      return true;
    } catch (err) {
      showToast(err.message, "error");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (isDirty) {
      const saved = await handleSaveChanges(true);
      if (!saved) return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      const docId = parseInt(id);
      const res = await fetch(`http://localhost:8000/api/v1/documents/${docId}/review`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        const detail = await res.json();
        throw new Error(detail.detail || "Approval process failed at server");
      }

      showToast("Document verified and pushed to final approval stage");
      setTimeout(() => navigate("/reviewer"), 1000);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://localhost:8000/api/v1/documents/${id}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Rejection process failed");
      showToast("Document marked as Rejected");
      setTimeout(() => navigate("/reviewer"), 1000);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  if (loading) return (
    <DashboardLayout role={userRole} navigate={navigate} title="Auditor Workspace">
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 text-sm">Synchronizing secure data stream...</p>
      </div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout role={userRole} navigate={navigate} title="System Error">
      <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-xl text-center">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Record Access Denied</h3>
        <p className="text-slate-400 mb-6">{error}</p>
        <Button variant="outline" onClick={() => navigate("/reviewer")}>Return to Fleet Portal</Button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout role={userRole} navigate={navigate} title="In-Depth Document Audit">

      <div className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
        <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate("/reviewer")}>Fleet Controls</span>
        <span className="opacity-20">/</span>
        <span className="text-brand-accent">Verification Protocol</span>
        {isDirty && (
          <>
            <span className="opacity-20">/</span>
            <span className="text-orange-500 animate-pulse">Unsaved Record Detected</span>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr] xl:grid-cols-[minmax(350px,450px)_1fr] gap-8 min-h-0 h-[calc(100vh-220px)] overflow-hidden">

        {/* Left: Restricted Preview View */}
        <div className="flex flex-col gap-4 overflow-hidden h-full">
          <div className="bg-brand-900 border border-brand-800 rounded-2xl overflow-hidden flex flex-col h-full shadow-2xl relative group">
            <div className="px-5 py-4 bg-brand-950/80 backdrop-blur-md border-b border-brand-800 flex justify-between items-center shrink-0">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" /> Source Evidence
              </span>
              <button
                onClick={() => window.open(documentData.s3_url, '_blank')}
                className="p-1.5 bg-white/5 hover:bg-brand-accent/20 rounded-lg transition-all text-slate-400 hover:text-brand-accent border border-white/5 hover:border-brand-accent/30"
                title="View Full Resolution"
              >
                <ExternalLink size={14} />
              </button>
            </div>
            <div className="flex-1 bg-brand-950 relative min-h-[300px]">
              <iframe
                src={`${documentData.s3_url}#toolbar=0`}
                className="w-full h-full border-none opacity-80 group-hover:opacity-100 transition-opacity"
                title="Evidence"
              />
            </div>
          </div>

          <div className="bg-brand-950/50 border border-brand-800 rounded-xl p-4 flex items-start gap-4 shrink-0 hidden xl:flex">
            <div className="w-10 h-10 rounded-lg bg-brand-800 flex items-center justify-center shrink-0 border border-brand-700">
              <Info size={18} className="text-brand-accent" />
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-white uppercase mb-1">Audit Protocol</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed italic">
                Cross-reference high-confidence extraction points with source.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Interactive Smart Editor */}
        <div className="bg-brand-900 border border-brand-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden relative h-full">
          {/* Contextual Action Header */}
          <div className="px-8 py-6 bg-brand-950 border-b border-brand-800 flex justify-between items-center z-10 shrink-0">
            <div className="flex items-center gap-5">
              <button
                onClick={() => navigate("/reviewer")}
                className="p-2.5 bg-brand-900/50 hover:bg-brand-800 rounded-xl text-slate-500 hover:text-white transition-all border border-brand-800"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="overflow-hidden">
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-none mb-2 truncate max-w-[200px] md:max-w-md">{documentData.filename}</h2>
                <div className="flex items-center gap-3">
                  <span className={clsx(
                    "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border",
                    documentData.status === 'REVIEW_PENDING' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-brand-800 text-slate-400 border-brand-700"
                  )}>
                    Stage: {documentData.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleReject}
                className="hidden md:block px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-red-400 transition-all uppercase tracking-widest"
              >
                Reject
              </button>
              <Button
                variant="primary"
                className="!py-3 !px-6 md:!px-10 shadow-xl shadow-brand-accent/30 rounded-xl flex items-center gap-3 !text-sm"
                onClick={handleApprove}
                disabled={saving}
              >
                {saving ? "Processing..." : (
                  <><ShieldCheck size={18} /> Verify Record</>
                )}
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-brand-900/30">
            <div className="max-w-4xl mx-auto space-y-12">

              {/* Detailed Attributes Section */}
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-10">
                <div className="flex items-center gap-4">
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Granular Data Points</h3>
                  <div className="h-[1px] bg-brand-800 flex-1 opacity-50" />
                </div>

                {fields.length === 0 ? (
                  <div className="p-16 border border-dashed border-brand-800 rounded-2xl text-center">
                    <p className="text-slate-500 text-sm italic">No granular metadata blocks found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                    {fields.map((field, idx) => (
                      <div key={idx} className="space-y-3 group">
                        <div className="flex justify-between items-center transition-opacity opacity-60 group-hover:opacity-100">
                          <label className="text-[10px] text-brand-accent font-black uppercase tracking-widest">{field.key}</label>
                          <span className="text-[9px] text-slate-600 font-mono">CONFID: {(field.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <div className="relative">
                          <input
                            value={field.value}
                            onChange={(e) => handleFieldChange(idx, e.target.value)}
                            className="w-full bg-transparent border-b border-brand-800 focus:border-brand-accent py-2 px-0 text-sm text-white focus:text-white outline-none font-medium transition-all"
                            placeholder="[NULL RECORD]"
                          />
                          <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-brand-accent transition-all duration-300 group-focus-within:w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Persistence Bar */}
          <div className="px-10 py-5 border-t border-brand-800 bg-brand-950/40 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
              <div className={clsx("w-2 h-2 rounded-full", isDirty ? "bg-orange-500 animate-pulse" : "bg-green-500")} />
              {isDirty ? "Unsaved Changes" : "System Synced"}
            </div>
            <button
              onClick={() => handleSaveChanges()}
              disabled={saving || !isDirty}
              className={clsx(
                "flex items-center gap-3 text-[10px] font-black uppercase transition-all tracking-widest py-2 px-6 rounded-lg",
                isDirty
                  ? "bg-brand-accent/10 text-brand-accent hover:bg-white/5 border border-brand-accent/20"
                  : "text-slate-700 cursor-not-allowed"
              )}
            >
              <Save size={14} className={saving ? "animate-spin" : ""} />
              {saving ? "Commiting..." : "Manual Sync"}
            </button>
          </div>
        </div>

      </div>

      {/* Persistence Toast */}
      {toast && (
        <div className={clsx(
          "fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl z-50 border flex items-center gap-4 transition-all animate-in slide-in-from-right-10",
          toast.type === 'error' ? 'bg-red-900 border-red-800 text-red-200' : 'bg-brand-900 border-brand-800 text-white'
        )}>
          <div className={clsx("w-2 h-2 rounded-full", toast.type === 'error' ? "bg-red-500" : "bg-brand-accent")} />
          <p className="text-xs font-bold">{toast.msg}</p>
        </div>
      )}
    </DashboardLayout>
  );
}
