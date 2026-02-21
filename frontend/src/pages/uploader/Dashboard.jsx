import React, { useEffect, useState, useRef } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import clsx from "clsx";

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
  UploadCloud,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Trash2,
  Eye,
  ShieldCheck,
  File,
  XCircle,
  Clock,
  Edit3,
  Archive,
  Zap,
  Tag,
  MessageSquare,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UploaderDashboard({ navigate }) {
  const userRole = "uploader";

  // Existing Data State
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  // New Upload State
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);

  // Modals
  const [previewDoc, setPreviewDoc] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const limit = 20;
  const docsSectionRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    // Scroll to documents if they exist after loading or tab change
    if (!loading && filteredDocs.length > 0) {
      setTimeout(() => {
        docsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [loading, activeTab]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:8000/api/v1/documents", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load documents");
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilesSelected = (files) => {
    const newFiles = Array.from(files).map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      customName: file.name,
      status: 'pending',
      progress: 0,
      tag: 'General',
      notes: ''
    }));
    setUploadQueue(prev => [...prev, ...newFiles]);
  };

  const updateFileStatus = (id, updates) => {
    setUploadQueue(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeFile = (id) => {
    setUploadQueue(prev => prev.filter(f => f.id !== id));
  };

  const startUpload = async () => {
    const token = localStorage.getItem("access_token");
    const pendingFiles = uploadQueue.filter(f => f.status === 'pending');

    for (let item of pendingFiles) {
      updateFileStatus(item.id, { status: 'uploading', progress: 0 });

      const formData = new FormData();
      formData.append("file", item.file);
      formData.append("custom_filename", item.customName);
      formData.append("tag", item.tag);
      if (item.notes) {
        formData.append("notes", item.notes);
      }

      try {
        // Smooth linear-ish progress increment
        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += Math.random() * 2 + 1; // slow steady increase
          if (currentProgress > 95) {
            currentProgress = 95;
            clearInterval(interval);
          }
          updateFileStatus(item.id, { progress: currentProgress });
        }, 400);

        const res = await fetch("http://localhost:8000/api/v1/upload-and-analyze", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        clearInterval(interval);

        if (!res.ok) throw new Error("Upload failed");

        const newDoc = await res.json();
        setDocuments(prev => [newDoc, ...prev]);
        updateFileStatus(item.id, { status: 'done', progress: 100 });
        showToast(`${item.customName} uploaded successfully`);
      } catch (err) {
        updateFileStatus(item.id, { status: 'error', progress: 0 });
        showToast(`Failed to upload ${item.customName}`);
      }
    }
  };

  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(false); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    const token = localStorage.getItem("access_token");
    await fetch(`http://localhost:8000/api/v1/documents/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setDocuments(documents.filter((doc) => doc.id !== id));
    setSelectedIds(selectedIds.filter(sid => sid !== id));
    showToast("Document deleted");
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Move ${selectedIds.length} documents to bin?`)) return;
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch("http://localhost:8000/api/v1/documents/bulk-delete", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (!res.ok) throw new Error("Bulk delete failed");
      setDocuments(documents.filter(doc => !selectedIds.includes(doc.id)));
      setSelectedIds([]);
      setIsSelectionMode(false); // Reset selection mode
      showToast(`${selectedIds.length} documents moved to bin`);
    } catch (err) {
      showToast(err.message);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenPreview = async (doc) => {
    setPreviewDoc({ ...doc, loading: true });
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://localhost:8000/api/v1/documents/${doc.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Could not load details");
      const details = await res.json();
      setPreviewDoc(details);
    } catch (err) {
      showToast("Error loading document details");
      setPreviewDoc(null);
    }
  };

  const statusBadge = (status) => {
    const styles = {
      UPLOADED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      PROCESSING: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      REVIEW_PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      REVIEWED: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      APPROVED: "bg-green-500/10 text-green-400 border-green-500/20",
      FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
      REJECTED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    };
    return styles[status] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
  };

  const filteredDocs = documents.filter(d => {
    const matchesSearch = (d.filename?.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toString().includes(search) ||
      (d.tag && d.tag.toLowerCase().includes(search.toLowerCase())));

    if (activeTab === "rejected") {
      return matchesSearch && (d.status === "REJECTED" || d.status === "FAILED");
    }
    return matchesSearch && d.status !== "REJECTED" && d.status !== "FAILED";
  });

  const paginatedDocs = filteredDocs.slice(
    (page - 1) * limit,
    page * limit
  );

  const totalPages = Math.ceil(filteredDocs.length / limit);

  const total = documents.length;
  const processing = documents.filter(d => d.status === "PROCESSING").length;
  const failed = documents.filter(d => d.status === "FAILED" || d.status === "REJECTED").length;
  const pendingQueue = uploadQueue.filter(f => f.status === 'pending').length;

  return (
    <DashboardLayout role={userRole} navigate={navigate} title="Upload Center">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="My Uploads" value={total} icon={FileText} color="text-brand-accent" />
        <StatCard title="Processing" value={processing} icon={Clock} color="text-purple-400" />
        <StatCard title="Queue" value={pendingQueue} icon={UploadCloud} color="text-orange-400" />
        <StatCard title="Rejected / Failed" value={failed} icon={AlertCircle} color="text-red-400" />
      </div>

      <div className="flex flex-col gap-10">
        <div className="space-y-6">
          <motion.div
            layout
            className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 group
                    ${isDragActive ? 'border-brand-accent bg-brand-accent/5 scale-[1.01]' : 'border-brand-800 bg-brand-900/20 hover:border-brand-600'}
                `}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => handleFilesSelected(e.target.files)} />
            <div className="w-20 h-20 bg-brand-800 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-accent group-hover:scale-110 transition-transform shadow-lg shadow-brand-950/50">
              <UploadCloud size={40} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Drag & Drop Documents</h3>
            <p className="text-slate-400 mb-6">Support for PDF, ZIP, and Images up to 500MB</p>
            <div className="flex gap-4 justify-center text-xs text-slate-500 font-mono">
              <span className="bg-brand-900/50 px-3 py-1 rounded border border-brand-800">PDF</span>
              <span className="bg-brand-900/50 px-3 py-1 rounded border border-brand-800">ZIP</span>
              <span className="bg-brand-900/50 px-3 py-1 rounded border border-brand-800">MAX 500MB</span>
            </div>
          </motion.div>

          <AnimatePresence>
            {uploadQueue.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-brand-900 border border-brand-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-brand-800 flex justify-between items-center bg-brand-950/30">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Zap size={14} className="text-brand-accent" /> Active Queue
                  </h3>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setUploadQueue([])} className="!py-1.5 !px-4 !text-[10px] font-black uppercase tracking-widest">Clear</Button>
                    <Button variant="primary" onClick={startUpload} disabled={!uploadQueue.some(f => f.status === 'pending')} className="!py-1.5 !px-4 !text-[10px] font-black uppercase tracking-widest">Start Upload</Button>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {uploadQueue.map(item => (
                    <motion.div key={item.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-brand-950/50 border border-brand-800 rounded-xl p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-brand-900 border border-brand-800 flex items-center justify-center text-slate-500">
                          {item.file.name.endsWith('.zip') ? <Archive size={20} /> : <File size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2 gap-4">
                            {item.status === 'pending' ? (
                              <div className="flex items-center gap-2 flex-1">
                                <Edit3 size={14} className="text-brand-accent" />
                                <input
                                  type="text"
                                  placeholder="Display Name"
                                  value={item.customName}
                                  onChange={(e) => updateFileStatus(item.id, { customName: e.target.value })}
                                  className="bg-transparent border-b border-brand-800 text-white text-sm focus:border-brand-accent outline-none w-full font-bold"
                                />
                              </div>
                            ) : <p className="text-sm font-bold text-white truncate">{item.customName}</p>}
                            <div className="flex items-center gap-2">
                              <button onClick={() => removeFile(item.id)} className="text-slate-600 hover:text-rose-500 transition-colors"><X size={16} /></button>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-[10px] font-mono mb-2">
                            <span className="text-slate-500 uppercase">{(item.file.size / 1024 / 1024).toFixed(2)} MB</span>
                            <div className="flex gap-4 items-center">
                              {item.status === 'uploading' && <span className="text-brand-accent animate-pulse font-black italic">Est. {Math.max(2, Math.ceil(item.file.size / 800000))}s remaining</span>}
                              <span className={`font-black uppercase tracking-widest ${item.status === 'done' ? 'text-emerald-500' : item.status === 'error' ? 'text-rose-500' : 'text-brand-accent'}`}>
                                {item.status === 'pending' ? 'Standby' : item.status === 'uploading' ? 'Ingesting...' : item.status}
                              </span>
                            </div>
                          </div>

                          <div className="w-full bg-brand-800/30 rounded-full h-1 overflow-hidden relative mb-3">
                            <motion.div
                              className={`h-full relative ${item.status === 'error' ? 'bg-rose-500' : item.status === 'done' ? 'bg-emerald-500' : 'bg-gradient-to-r from-brand-accent to-brand-cyan'}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${item.progress}%` }}
                              transition={{ ease: "linear", duration: 0.4 }}
                            >
                              {item.status === 'uploading' && <motion.div className="absolute inset-0 bg-white/20" animate={{ x: ['-100%', '100%'] }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} />}
                            </motion.div>
                          </div>

                          {/* Classification Tag & Notes Input */}
                          {item.status === 'pending' && (
                            <div className="space-y-2 mt-3">
                              <div className="flex items-center gap-2">
                                <Tag size={12} className="text-slate-500" />
                                <input
                                  type="text"
                                  placeholder="Classification Tag (Legal, Invoice...)"
                                  value={item.tag}
                                  onChange={(e) => updateFileStatus(item.id, { tag: e.target.value })}
                                  className="bg-brand-900 border border-brand-800 px-3 py-1.5 rounded text-[10px] text-white focus:border-brand-accent outline-none flex-1 font-mono uppercase tracking-widest"
                                />
                              </div>
                              <div className="flex items-start gap-2">
                                <MessageSquare size={12} className="text-slate-500 mt-1" />
                                <textarea
                                  placeholder="Add an internal note or message (optional)..."
                                  value={item.notes}
                                  onChange={(e) => updateFileStatus(item.id, { notes: e.target.value })}
                                  className="bg-brand-900 border border-brand-800 px-3 py-2 rounded text-[10px] text-white focus:border-brand-accent outline-none flex-1 font-sans resize-none h-12"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div ref={docsSectionRef} className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
            <div className="flex items-center gap-6 border-b border-brand-800 w-full md:w-auto">
              <button
                onClick={() => {
                  setActiveTab("active");
                  setPage(1);
                  setIsSelectionMode(false);
                  setSelectedIds([]);
                }}
                className={clsx(
                  "pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative px-2",
                  activeTab === "active" ? "text-brand-accent" : "text-slate-600 hover:text-slate-400"
                )}
              >
                Historical Archives
                {activeTab === "active" && <motion.div layoutId="uploaderTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent shadow-[0_0_10px_rgba(var(--brand-accent-rgb),0.5)]" />}
              </button>
              <button
                onClick={() => {
                  setActiveTab("rejected");
                  setPage(1);
                  setIsSelectionMode(false);
                  setSelectedIds([]);
                }}
                className={clsx(
                  "pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative px-2 flex items-center gap-2",
                  activeTab === "rejected" ? "text-rose-500" : "text-slate-600 hover:text-slate-400"
                )}
              >
                Rejected Records
                {failed > 0 && <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center text-[10px]">{failed}</span>}
                {activeTab === "rejected" && <motion.div layoutId="uploaderTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />}
              </button>
            </div>

            <div className="flex gap-4 items-center w-full md:w-auto">
              <button
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  if (isSelectionMode) setSelectedIds([]);
                }}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 border rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-lg",
                  isSelectionMode
                    ? "bg-brand-accent text-white border-brand-accent"
                    : "bg-brand-800/40 text-slate-400 border-brand-800 hover:text-white"
                )}
              >
                {isSelectionMode ? "Cancel Selection" : "Select Files"}
              </button>

              {isSelectionMode && selectedIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-lg animate-in fade-in slide-in-from-left-4"
                >
                  <Trash2 size={14} /> Delete Selected ({selectedIds.length})
                </button>
              )}
              <div className="relative w-full md:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search archives..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full bg-brand-900/50 border border-brand-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white outline-none focus:border-brand-accent transition-all"
                />
              </div>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {paginatedDocs.map(doc => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => isSelectionMode && toggleSelect(doc.id)}
                  className={clsx(
                    "bg-brand-900 border rounded-xl p-5 hover:border-brand-accent/40 transition-all group relative overflow-hidden cursor-pointer",
                    isSelectionMode && selectedIds.includes(doc.id) ? "border-brand-accent ring-1 ring-brand-accent bg-brand-accent/5" : "border-brand-800"
                  )}
                >
                  {isSelectionMode && (
                    <div className="absolute top-4 left-4 z-20 animate-in zoom-in-50 duration-200">
                      <div className={clsx(
                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                        selectedIds.includes(doc.id) ? "bg-brand-accent border-brand-accent" : "border-brand-800 bg-brand-950 group-hover:border-brand-600"
                      )}>
                        {selectedIds.includes(doc.id) && <CheckCircle size={12} className="text-white" />}
                      </div>
                    </div>
                  )}

                  <div className={clsx("flex justify-between items-start mb-4", isSelectionMode ? "pl-8" : "")}>
                    <div className="w-10 h-10 rounded-lg bg-brand-950 flex items-center justify-center text-brand-accent border border-brand-800">
                      {doc.status === "REJECTED" ? <AlertCircle size={20} className="text-rose-500" /> : (doc.filename.endsWith('.zip') ? <Archive size={20} /> : <FileText size={20} />)}
                    </div>
                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleOpenPreview(doc)} className="p-2 bg-brand-800 rounded-lg hover:text-brand-accent transition-colors"><Eye size={14} /></button>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-white mb-1 truncate pr-16" title={doc.filename}>{doc.filename}</p>

                  {/* Display Tag in Listing */}
                  {doc.tag && (
                    <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-brand-cyan/5 border border-brand-cyan/10 rounded text-[9px] text-brand-cyan font-mono uppercase tracking-widest">
                      <Tag size={8} /> {doc.tag}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded border tracking-widest uppercase ${statusBadge(doc.status)}`}>
                      {doc.status.replace("_", " ")}
                    </span>
                    <span className="text-[9px] text-slate-600 font-mono italic">
                      {formatIST(doc.created_at)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 bg-brand-900 border border-brand-800 rounded-lg text-xs font-bold text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center px-4 text-xs font-mono text-slate-500">
                Page {page} of {totalPages}
              </div>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 bg-brand-900 border border-brand-800 rounded-lg text-xs font-bold text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {previewDoc && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-6" onClick={() => setPreviewDoc(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-brand-900 border border-brand-800 rounded-3xl w-full max-w-6xl h-[85vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="px-8 py-6 border-b border-brand-800 flex justify-between items-center bg-brand-950">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-800 flex items-center justify-center text-brand-accent shadow-inner"><FileText size={24} /></div>
                  <div>
                    <h3 className="text-xl font-black text-white">{previewDoc.filename}</h3>
                    <div className="flex items-center gap-3">
                      <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Node ID: {previewDoc.id}</p>
                      {previewDoc.tag && (
                        <span className="text-[10px] text-brand-cyan font-mono tracking-[0.2em] uppercase bg-brand-cyan/10 px-2 py-0.5 rounded border border-brand-cyan/20 flex items-center gap-1">
                          <Tag size={10} /> {previewDoc.tag}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => setPreviewDoc(null)} className="p-2 hover:bg-brand-800 rounded-full transition-colors text-slate-500 hover:text-white"><XCircle size={28} /></button>
              </div>

              <div className="flex-1 flex flex-col lg:flex-row p-8 gap-8 overflow-hidden">
                <div className="flex-[3] bg-black rounded-2xl border border-brand-800 overflow-hidden relative shadow-2xl">
                  {previewDoc.loading ? <div className="absolute inset-0 flex items-center justify-center"><div className="w-10 h-10 border-4 border-brand-accent border-t-transparent rounded-full animate-spin" /></div> : <iframe src={`${previewDoc.s3_url}#toolbar=0`} className="w-full h-full" />}
                </div>
                <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar">
                  {previewDoc.uploader_message && (
                    <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                      <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <MessageSquare size={14} /> Reviewer Feedback
                      </h4>
                      <div className="p-4 bg-brand-950/60 rounded-xl border border-rose-500/10 italic text-[11px] text-slate-300 leading-relaxed shadow-inner">
                        "{previewDoc.uploader_message}"
                      </div>
                    </div>
                  )}

                  <div className="p-6 bg-brand-accent/5 border border-brand-accent/10 rounded-2xl">
                    <h4 className="text-[10px] font-black text-brand-accent uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><ShieldCheck size={14} /> System Metadata</h4>
                    <div className="space-y-4">
                      {previewDoc.fields?.slice(0, 10).map((f, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{f.key}</span>
                          <span className="text-xs text-white font-medium break-all">{f.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-brand-950 border-t border-brand-800 flex justify-end">
                <Button variant="primary" onClick={() => setPreviewDoc(null)} className="!px-12 !py-4 font-black uppercase text-xs tracking-[0.2em]">Close Preview</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {toast && (
        <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="fixed bottom-10 right-10 bg-brand-accent text-white px-8 py-5 rounded-2xl shadow-2xl z-50 font-black uppercase tracking-widest text-xs flex items-center gap-4">
          <CheckCircle size={20} /> {toast}
        </motion.div>
      )}
    </DashboardLayout>
  );
}
