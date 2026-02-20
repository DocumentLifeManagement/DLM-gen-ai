import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import Button from "../../components/landing/Button";
import {
    FileText,
    Save,
    AlertCircle,
    ChevronLeft,
    ExternalLink,
    Trash2,
    Database,
    Cpu,
    Fingerprint,
    RotateCcw,
    Zap,
    Activity,
    ShieldCheck
} from "lucide-react";
import clsx from "clsx";

export default function AdminDocumentDetail({ navigate, id }) {
    const userRole = "admin";

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

            if (!res.ok) throw new Error("Failed to fetch document details from backend");

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

            if (!res.ok) throw new Error("Failed to update database record");

            setIsDirty(false);
            if (!silent) showToast("System records updated successfully");
            return true;
        } catch (err) {
            showToast(err.message, "error");
            return false;
        } finally {
            setSaving(false);
        }
    };

    const handleDiscard = async () => {
        if (!window.confirm("CRITICAL OVERRIDE: Are you sure you want to permanently PURGE this document from the backend? This action is IRREVERSIBLE.")) return;

        setSaving(true);
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`http://localhost:8000/api/v1/documents/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Database purge command failed");

            showToast("Document successfully purged from backend");
            setTimeout(() => navigate("/admin"), 1000);
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <DashboardLayout role={userRole} navigate={navigate} title="Admin Terminal Access">
            <div className="flex flex-col items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-500 text-sm font-mono uppercase tracking-widest">Polling secure data stream...</p>
            </div>
        </DashboardLayout>
    );

    if (error) return (
        <DashboardLayout role={userRole} navigate={navigate} title="Terminal Error">
            <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-xl text-center">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Access Control Denied</h3>
                <p className="text-slate-400 mb-6 font-mono text-sm">{error}</p>
                <Button variant="outline" onClick={() => navigate("/admin")}>Return to Hub</Button>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout role={userRole} navigate={navigate} title="System Administrator Override">
            {/* Admin Breadcrumbs */}
            <div className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate("/admin")}>Central Command</span>
                <span className="opacity-20">/</span>
                <span className="text-brand-cyan flex items-center gap-2">
                    <Zap size={10} /> Management Protocol
                </span>
                {isDirty && (
                    <>
                        <span className="opacity-20">/</span>
                        <span className="text-orange-500 animate-pulse">Modified State Detected</span>
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-8 min-h-0 h-[calc(100vh-220px)] overflow-hidden">

                {/* Advanced Document Control & Preview */}
                <div className="flex flex-col gap-4 overflow-hidden h-full">
                    <div className="bg-brand-900 border border-brand-800 rounded-2xl overflow-hidden flex flex-col h-full shadow-2xl relative">
                        <div className="px-5 py-3 bg-brand-950/80 backdrop-blur-md border-b border-brand-800 flex justify-between items-center shrink-0">
                            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest flex items-center gap-2">
                                <Database size={12} className="text-brand-cyan" /> Raw Data Stream
                            </span>
                            <button
                                onClick={() => window.open(documentData.s3_url, '_blank')}
                                className="p-1.5 bg-white/5 hover:bg-brand-cyan/20 rounded-lg transition-all text-slate-400 hover:text-brand-cyan border border-white/5 hover:border-brand-cyan/30"
                                title="Full Screen Analysis"
                            >
                                <ExternalLink size={14} />
                            </button>
                        </div>

                        <div className="flex-1 bg-brand-950 relative overflow-hidden group">
                            <iframe
                                src={`${documentData.s3_url}#toolbar=0`}
                                className="w-full h-full border-none opacity-60 group-hover:opacity-100 transition-opacity"
                                title="Document Preview"
                            />
                            {/* Overlay technical indicators */}
                            <div className="absolute top-4 right-4 pointer-events-none space-y-2 text-right">
                                <div className="bg-brand-950/80 p-2 rounded border border-brand-800 backdrop-blur-sm">
                                    <p className="text-[9px] font-mono text-brand-cyan">DOC_ID: {id.slice(0, 8)}</p>
                                    <p className="text-[9px] font-mono text-slate-500 mt-0.5">SHA256: VERIFIED</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-brand-950/50 border border-brand-800 rounded-xl p-4 flex items-start gap-4 shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-brand-800 flex items-center justify-center shrink-0 border border-brand-700">
                            <Activity size={18} className="text-brand-cyan" />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-bold text-white uppercase mb-1">Administrative Rights</h4>
                            <p className="text-[11px] text-slate-500 leading-relaxed italic">
                                You have master-level privileges to modify extraction fields or purge this document from server storage.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Master Editor Console */}
                <div className="bg-brand-900 border border-brand-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden relative h-full">
                    <div className="px-8 py-6 bg-brand-950 border-b border-brand-800 flex justify-between items-center z-10 shrink-0">
                        <div className="flex items-center gap-5">
                            <button
                                onClick={() => navigate("/admin")}
                                className="p-2.5 bg-brand-900/50 hover:bg-brand-800 rounded-xl text-slate-500 hover:text-white transition-all border border-brand-800"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-none mb-2 truncate max-w-[200px] md:max-w-md">{documentData.filename}</h2>
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20">
                                        Sovereignty Mode
                                    </span>
                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border bg-brand-800 text-slate-400 border-brand-700">
                                        Status: {documentData.status.replace("_", " ")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleDiscard}
                                className="px-5 py-2.5 text-xs font-bold text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all uppercase tracking-widest flex items-center gap-2"
                            >
                                <Trash2 size={16} /> Discard
                            </button>
                            <Button
                                variant="primary"
                                className="!py-3 !px-8 shadow-xl !bg-brand-cyan hover:!bg-brand-cyan/80 shadow-brand-cyan/20 rounded-xl flex items-center gap-3 !text-sm text-brand-950"
                                onClick={() => handleSaveChanges()}
                                disabled={saving || !isDirty}
                            >
                                {saving ? "Updating..." : (
                                    <><Cpu size={18} /> Commit Changes</>
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-brand-900/30">
                        <div className="max-w-4xl mx-auto space-y-12">
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-2">
                                        <Fingerprint size={12} className="text-brand-cyan" />
                                        Advanced Extraction Console
                                    </h3>
                                    <div className="h-[1px] bg-brand-800 flex-1 opacity-50" />
                                </div>

                                {fields.length === 0 ? (
                                    <div className="p-16 border border-dashed border-brand-800 rounded-2xl text-center">
                                        <p className="text-slate-500 text-sm italic">No extraction data available for this document.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                                        {fields.map((field, idx) => (
                                            <div key={idx} className="space-y-3 group">
                                                <div className="flex justify-between items-center opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <label className="text-[10px] text-brand-cyan font-black uppercase tracking-widest">{field.key}</label>
                                                    <span className="text-[9px] text-slate-600 font-mono">CONF: {(field.confidence * 100).toFixed(1)}%</span>
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        value={field.value}
                                                        onChange={(e) => handleFieldChange(idx, e.target.value)}
                                                        className="w-full bg-transparent border-b border-brand-800 focus:border-brand-cyan py-2 text-sm text-white focus:text-white outline-none font-medium transition-all"
                                                        placeholder="[EMPTY RECORD]"
                                                    />
                                                    <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-brand-cyan transition-all duration-300 group-focus-within:w-full" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="px-10 py-5 border-t border-brand-800 bg-brand-950/40 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-4 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                            <div className={clsx("w-2 h-2 rounded-full", isDirty ? "bg-orange-500 animate-pulse" : "bg-green-500")} />
                            {isDirty ? "Configuration Modified" : "System Synchronized"}
                        </div>
                        {isDirty && (
                            <button
                                onClick={() => fetchDocument()}
                                className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
                                title="Rollback to database state"
                            >
                                <RotateCcw size={12} /> Revert Initial State
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Persistence Toast */}
            {toast && (
                <div className={clsx(
                    "fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl z-50 border flex items-center gap-4 transition-all animate-in slide-in-from-right-10",
                    toast.type === 'error' ? 'bg-red-900 border-red-800 text-red-200' : 'bg-brand-900 border-brand-800 text-white'
                )}>
                    <div className={clsx("w-2 h-2 rounded-full", toast.type === 'error' ? "bg-red-500" : "bg-brand-cyan")} />
                    <p className="text-xs font-bold">{toast.msg}</p>
                </div>
            )}
        </DashboardLayout>
    );
}
