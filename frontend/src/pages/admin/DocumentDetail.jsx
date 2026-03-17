import React, { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

// Forced IST Formatter
const formatIST = (dateStr) => {
    if (!dateStr) return "—";
    try {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(date) + " IST";
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
    Database,
    Cpu,
    RotateCcw,
    Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import SLACountdown from "../../components/dashboard/SLACountdown";
import { useRealtimeDocuments } from "../../hooks/useRealtimeDocuments";

export default function AdminDocumentDetail({ navigate, id }) {
    const userRole = "admin";

    const [documentData, setDocumentData] = useState(null);
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [notes, setNotes] = useState("");
    const [digitallySigned, setDigitallySigned] = useState(false);
    const [activeTab, setActiveTab] = useState("metadata"); // metadata | audit
    const [showPurgeModal, setShowPurgeModal] = useState(false);
    const [lifecycle, setLifecycle] = useState([]);

    // Realtime subscription for single document updates
    useRealtimeDocuments({
        enabled: !!id,
        onUpdate: useCallback((payload) => {
            if (payload.new.id.toString() === id.toString()) {
                console.log("[Realtime] 🔄 Updating document state:", payload.new.id);
                setDocumentData(payload.new);
                if (payload.new.fields) setFields(payload.new.fields);
            }
        }, [id]),
        onDelete: useCallback((old) => {
            if (old.id.toString() === id.toString()) {
                showToast("This document was deleted by another session.", "error");
                setTimeout(() => navigate("/admin"), 2000);
            }
        }, [id, navigate])
    });


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
            setNotes(""); // Start with empty note for admin override
            setIsDirty(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }

        // Fetch lifecycle history
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`http://localhost:8000/api/v1/documents/${id}/lifecycle`, {
                headers: { Authorization: `Bearer ${token}` }
            });
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
            const res = await fetch(`http://localhost:8000/api/v1/documents/${id}/update-fields`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ fields }),
            });

            if (!res.ok) throw new Error("Failed to update records");

            setIsDirty(false);
            if (!silent) showToast("System records updated");
            return true;
        } catch (err) {
            showToast(err.message, "error");
            return false;
        } finally {
            setSaving(false);
        }
    };

    const handlePurge = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`http://localhost:8000/api/v1/documents/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Database purge command failed");

            showToast("Document permanently purged");
            setTimeout(() => navigate("/admin"), 1000);
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setSaving(false);
            setShowPurgeModal(false);
        }
    };

    const handleDecision = async (decisionType) => {
        // decisionType: 'COMMIT'
        if (isDirty) {
            const saved = await handleSaveChanges(true);
            if (!saved) return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem("access_token");
            const docId = parseInt(id);

            // Admin bypasses standard review/approve flow but we can still record decision
            const res = await fetch(`http://localhost:8000/api/v1/documents/${docId}/approve`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    notes: notes,
                    digitally_signed: digitallySigned
                })
            });

            if (!res.ok) throw new Error("Override action failed");

            // Automatically archive after authorization
            await fetch(`http://localhost:8000/api/v1/documents/${docId}/archive`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });

            showToast("Administrative override & archiving complete");
            setTimeout(() => navigate("/admin"), 1000);
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <DashboardLayout role={userRole} navigate={navigate} title="Admin Terminal">
            <div className="flex flex-col items-center justify-center p-20">
                <div className="w-12 h-12 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-medium font-mono">Bypassing security layers...</p>
            </div>
        </DashboardLayout>
    );

    const avgConfidence = (fields.reduce((acc, f) => acc + (f.confidence || 0), 0) / (fields.length || 1) * 100).toFixed(1);

    return (
        <DashboardLayout role={userRole} navigate={navigate} title="Master Override Console">

            <div className="max-w-[1600px] mx-auto flex flex-col gap-6">

                {/* Row 1: Top Control Header */}
                <div className="flex flex-col gap-4 bg-brand-900/50 p-4 md:p-6 rounded-2xl border border-brand-800 shadow-xl">
                    <div className="flex items-start gap-3">
                        <button
                            onClick={() => window.history.back()}
                            className="p-2 md:p-3 bg-brand-800 hover:bg-brand-700 rounded-xl text-slate-400 hover:text-white transition-all border border-brand-700 shrink-0"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h2 className="text-base md:text-xl font-black text-white tracking-tight truncate">{documentData.filename}</h2>
                                <span className="text-[9px] px-2 py-0.5 rounded-full border border-brand-cyan/30 text-brand-cyan bg-brand-cyan/5 uppercase font-black tracking-widest whitespace-nowrap">
                                    Admin
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 md:gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-20 bg-brand-800 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-brand-cyan h-full shadow-[0_0_8px_rgba(6,182,212,0.5)]" style={{ width: `${avgConfidence}%` }} />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{avgConfidence}% Integrity</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-brand-950 rounded-lg border border-brand-800">
                                    <Activity size={10} className="text-brand-cyan" />
                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Status: {documentData.status.replace("_", " ")}</span>
                                </div>
                                {!["APPROVED", "REJECTED", "FAILED", "ARCHIVED"].includes(documentData.status) && (
                                    <SLACountdown createdAt={documentData.created_at} status={documentData.status} size="md" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            variant="outline"
                            className="!border-red-500/20 !text-red-400 hover:!bg-red-500/10 !py-2 !px-4 text-xs uppercase font-bold tracking-widest"
                            onClick={() => setShowPurgeModal(true)}
                        >
                            <Trash2 size={14} className="mr-1.5" />
                            Purge Record
                        </Button>
                        <Button
                            variant="primary"
                            className="!py-2 !px-6 shadow-xl !bg-brand-cyan hover:!bg-brand-cyan/80 !text-brand-950 shadow-brand-cyan/20 text-xs uppercase font-black tracking-widest"
                            onClick={() => handleDecision('COMMIT')}
                            disabled={saving || documentData.status === "ARCHIVED"}
                        >
                            <Cpu size={16} className="mr-1.5" />
                            {documentData.status === "ARCHIVED" ? "Finalized" : saving ? "Committing" : "Override & Authorize"}
                        </Button>
                    </div>
                </div>

                {/* Row 2: Analysis Split View - stacks on mobile */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px] lg:min-h-[600px]">

                    {/* Data Visualization Panel */}
                    <div className="bg-brand-900 border border-brand-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden group">
                        <div className="px-5 py-3 border-b border-brand-800 flex justify-between items-center bg-brand-950/40">
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                                <Database size={12} className="text-brand-cyan" /> Secure Object View
                            </span>
                            <button
                                onClick={() => window.open(documentData.s3_url, '_blank')}
                                className="p-1.5 hover:bg-brand-cyan/10 rounded-lg text-slate-400 hover:text-brand-cyan transition-all"
                            >
                                <Maximize2 size={14} />
                            </button>
                        </div>
                        <div className="flex-1 bg-brand-950/80 p-2 relative">
                            <iframe
                                src={`${documentData.s3_url}#toolbar=0`}
                                className="w-full h-full border-none rounded-lg opacity-60 group-hover:opacity-100 transition-opacity"
                                title="Admin Preview"
                            />
                            <div className="absolute bottom-6 right-6 pointer-events-none p-3 bg-brand-950/90 border border-brand-800 rounded shadow-2xl backdrop-blur-md">
                                <p className="text-[8px] font-mono text-brand-cyan uppercase">System UID: {id}</p>
                                <p className="text-[8px] font-mono text-slate-600 mt-1 uppercase">S3 Signature: Verified</p>
                            </div>
                        </div>
                    </div>

                    {/* Master Editor Panel */}
                    <div className="bg-brand-900 border border-brand-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
                        <div className="flex border-b border-brand-800 bg-brand-950/40">
                            <button
                                onClick={() => setActiveTab("metadata")}
                                className={clsx(
                                    "px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
                                    activeTab === "metadata" ? "text-brand-cyan" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                Extracted Blocks
                                {activeTab === "metadata" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-cyan shadow-[0_0_10px_rgba(6,182,212,0.8)]" />}
                            </button>
                            <button
                                onClick={() => setActiveTab("audit")}
                                className={clsx(
                                    "px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
                                    activeTab === "audit" ? "text-brand-cyan" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                Lifecycle Audit
                                {activeTab === "audit" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-cyan shadow-[0_0_10px_rgba(6,182,212,0.8)]" />}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <AnimatePresence mode="wait">
                                {activeTab === "metadata" ? (
                                    <motion.div
                                        key="meta"
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
                                    >
                                        {fields.map((field, idx) => (
                                            <div key={idx} className="bg-brand-950/20 p-4 rounded-2xl border border-brand-800/50 space-y-3 hover:border-brand-cyan/30 transition-all group">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[10px] text-brand-cyan font-black uppercase tracking-widest">{field.key}</label>
                                                    <span className="text-[9px] text-slate-600 font-mono bg-brand-900 px-1.5 py-0.5 rounded">{(field.confidence * 100).toFixed(0)}% Match</span>
                                                </div>
                                                <input
                                                    value={field.value}
                                                    onChange={(e) => handleFieldChange(idx, e.target.value)}
                                                    className="w-full bg-transparent border-b border-brand-800 focus:border-brand-cyan py-1 text-xs text-white outline-none transition-all font-medium"
                                                />
                                            </div>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="audit"
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                        className="space-y-8"
                                    >
                                        {/* Risk Indicators */}
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <Activity size={12} /> System Vulnerability Assessment
                                            </h4>
                                            <div className="grid grid-cols-1 gap-2">
                                                {documentData?.risk_indicators?.length > 0 ? (
                                                    [...new Set(documentData.risk_indicators)].map((risk, i) => (
                                                        <div key={i} className="flex flex-col justify-center p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[10px] font-bold text-red-400">{risk}</span>
                                                                <AlertCircle size={14} className="text-red-500/50" />
                                                            </div>
                                                            {risk === 'HIGH_VALUE_THRESHOLD' && (
                                                                <span className="text-[9px] text-slate-500 mt-1">
                                                                    Disclaimer: This document was flagged because it contains a monetary value exceeding the limit of $5,000.
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-emerald-500/80 text-[10px] font-bold">
                                                        Zero Pattern Vulnerabilities Detected
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Timeline */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <History size={12} /> Administrative Timeline
                                            </h4>
                                            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-brand-800">
                                                {lifecycle.map((entry, idx) => (
                                                    <div key={idx} className="relative">
                                                        <div className={clsx(
                                                            "absolute -left-6 top-1.5 w-4 h-4 rounded-full border-4 border-brand-950",
                                                            entry.to === "REJECTED" ? "bg-red-500" :
                                                                entry.to === "APPROVED" || entry.to === "ARCHIVED" ? "bg-emerald-500" :
                                                                    entry.to === "APPROVAL_PENDING" ? "bg-amber-500" : "bg-brand-800"
                                                        )} />
                                                        <div className="p-4 bg-brand-950/50 border border-brand-800 rounded-xl">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className={clsx(
                                                                    "text-[9px] font-black uppercase tracking-tighter",
                                                                    entry.to === "REJECTED" ? "text-red-400" :
                                                                        entry.to === "APPROVED" || entry.to === "ARCHIVED" ? "text-emerald-400" :
                                                                            "text-slate-400"
                                                                )}>
                                                                    {entry.from === "NONE" ? "Initial Document Inflow" : `${entry.from} → ${entry.to}`}
                                                                </span>
                                                                <span className="text-[8px] text-slate-600 font-mono">
                                                                    {formatIST(entry.timestamp)}
                                                                </span>
                                                            </div>
                                                            <div className="mt-2 flex flex-col gap-0.5">
                                                                <p className="text-[10px] text-slate-400">
                                                                    <span className="text-slate-500 uppercase text-[8px] font-black tracking-widest mr-1">{entry.actor_type}</span>
                                                                    <span className="text-white font-semibold">{entry.actor_name || entry.actor_id}</span>
                                                                </p>
                                                                {entry.actor_email && (
                                                                    <p className="text-[9px] text-slate-600 font-mono">{entry.actor_email}</p>
                                                                )}
                                                            </div>
                                                            {entry.notes && (
                                                                <p className="mt-3 text-[11px] text-slate-300 italic bg-brand-900/40 p-3 rounded-lg border border-brand-800/50">
                                                                    "{entry.notes}"
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}

                                                {!lifecycle.length && (
                                                    <div className="relative">
                                                        <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-brand-800 border-4 border-brand-950" />
                                                        <div className="p-4 bg-brand-950/50 border border-brand-800 rounded-xl">
                                                            <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">System Ingestion</span>
                                                            <p className="text-[10px] text-slate-400">Record successfully vaulted into secure storage.</p>
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

                {/* Row 3: Admin Finalization Block */}
                <div className="bg-brand-950 border border-brand-800 rounded-2xl p-8 shadow-2xl flex flex-col md:flex-row gap-8">

                    <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Zap size={10} className="text-brand-cyan" /> Final Authority Note
                            </label>
                            <span className="text-[9px] text-slate-600 font-mono tracking-tighter uppercase font-black">Admin Override Buffer Enabled</span>
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Provide justification for administrative override..."
                            className="w-full bg-brand-900/50 border border-brand-800 focus:border-brand-cyan rounded-xl p-4 text-xs text-white outline-none min-h-[100px] transition-all resize-none shadow-inner"
                        />
                    </div>

                    <div className="w-full md:w-[400px] flex flex-col gap-6">
                        <div
                            onClick={() => {
                                if (documentData.status !== "ARCHIVED") {
                                    setDigitallySigned(!digitallySigned);
                                }
                            }}
                            className={clsx(
                                "group flex items-center justify-between p-6 rounded-2xl border transition-all duration-300",
                                documentData.status === "ARCHIVED" || digitallySigned
                                    ? "bg-brand-cyan/10 border-brand-cyan/40 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                                    : "bg-brand-900/50 border-brand-800 hover:border-brand-700",
                                documentData.status !== "ARCHIVED" && "cursor-pointer"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={clsx(
                                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                                    digitallySigned ? "bg-brand-cyan text-brand-950" : "bg-brand-800 text-slate-600 group-hover:text-slate-400"
                                )}>
                                    <UserCheck size={24} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-white uppercase tracking-tight">
                                        {documentData.status === "ARCHIVED" ? "Master Seal Applied" : "Root Identity Attestation"}
                                    </h4>
                                    <p className="text-[10px] text-slate-500 font-medium leading-tight italic">
                                        {documentData.status === "ARCHIVED" ? "Contract execution finalized and vaulted." : "Applying master administrative seal."}
                                    </p>
                                </div>
                            </div>
                            <div className={clsx(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                (documentData.status === "ARCHIVED" || digitallySigned) ? "bg-brand-cyan border-brand-cyan text-brand-950" : "border-brand-700 bg-brand-950"
                            )}>
                                {(documentData.status === "ARCHIVED" || digitallySigned) && <Check size={14} strokeWidth={3} />}
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-6">
                            <div className="flex items-center gap-4 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                                <div className={clsx("w-2 h-2 rounded-full", isDirty ? "bg-orange-500 animate-pulse" : "bg-emerald-500")} />
                                {isDirty ? "Configuration Diverged" : "DB State Synchronized"}
                            </div>
                            <div className="flex gap-4">
                                {isDirty && (
                                    <button
                                        onClick={() => fetchDocument()}
                                        className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
                                    >
                                        <RotateCcw size={12} /> Rollback
                                    </button>
                                )}
                                <button
                                    onClick={() => handleSaveChanges()}
                                    className={clsx(
                                        "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                                        isDirty ? "text-brand-cyan hover:opacity-80" : "text-slate-800 cursor-default"
                                    )}
                                    disabled={!isDirty || saving}
                                >
                                    <Save size={14} /> Commit Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Purge Confirmation Modal */}
            <AnimatePresence>
                {showPurgeModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowPurgeModal(false)}
                            className="absolute inset-0 bg-brand-1000/95 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-lg bg-brand-900 border border-brand-800 rounded-[32px] p-12 text-center shadow-2xl"
                        >
                            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-500 border border-red-500/20 shadow-lg">
                                <Trash2 size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">Destructive Purge</h3>
                            <p className="text-sm text-slate-400 mb-10 leading-relaxed max-w-xs mx-auto">
                                Warning: This document and all associated metadata will be permanently erased from S3 and the SQL database. This is <span className="text-red-500 font-bold underline">IRREVERSIBLE</span>.
                            </p>

                            <div className="space-y-4">
                                <button
                                    onClick={handlePurge}
                                    disabled={saving}
                                    className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-red-900/20"
                                >
                                    <Trash2 size={18} />
                                    {saving ? "Purging..." : "Confirm Final Purge"}
                                </button>
                                <button onClick={() => setShowPurgeModal(false)} className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-4 hover:text-white transition-colors">
                                    Abort Command
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {toast && (
                <div className={clsx(
                    "fixed bottom-8 right-8 px-8 py-5 rounded-2xl shadow-2xl z-[300] border-2 flex items-center gap-4 animate-in slide-in-from-right-10",
                    toast.type === 'error' ? 'bg-red-950 border-red-900 text-red-200' : 'bg-brand-900 border-brand-800 text-white'
                )}>
                    <div className={clsx("w-2.5 h-2.5 rounded-full", toast.type === 'error' ? "bg-red-500" : "bg-brand-cyan shadow-[0_0_8px_rgba(6,182,212,1)]")} />
                    <p className="text-sm font-bold tracking-tight">{toast.msg}</p>
                </div>
            )}

        </DashboardLayout>
    );
}
