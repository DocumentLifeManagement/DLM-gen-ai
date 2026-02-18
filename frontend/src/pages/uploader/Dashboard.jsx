import React, { useEffect, useState, useRef } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
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
  Clock
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
  const [uploadQueue, setUploadQueue] = useState([]); // { file, id, status: 'pending'|'uploading'|'done'|'error', progress, tag }
  const [isDragActive, setIsDragActive] = useState(false);
  const dropRef = useRef(null);

  // Modals
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    fetchDocuments();
    setupWebSocket();
  }, []);

  const setupWebSocket = () => {
    // WebSocket logic temporarily disabled until backend support is added
    return () => { };
  };

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

  /* ----------------------------
     UPLOAD LOGIC
  -----------------------------*/
  const handleFilesSelected = (files) => {
    const newFiles = Array.from(files).map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      progress: 0,
      tag: 'General' // Default tag
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
      // formData.append("tag", item.tag); // If backend supports it later

      try {
        // Mock progress for visual effect since fetch doesn't support built-in progress events easily without XHR/Axios
        const interval = setInterval(() => {
          updateFileStatus(item.id, { progress: Math.min(90, (Math.random() * 20) + 10) }); // increment
        }, 200);

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
        showToast(`${item.file.name} uploaded successfully`);
      } catch (err) {
        updateFileStatus(item.id, { status: 'error', progress: 0 });
        showToast(`Failed to upload ${item.file.name}`);
      }
    }
  };

  /* ----------------------------
     DRAG & DROP
  -----------------------------*/
  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(false); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  /* ----------------------------
     DELETE
  -----------------------------*/
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    const token = localStorage.getItem("access_token");
    await fetch(`http://localhost:8000/api/v1/documents/${id}/delete/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setDocuments(documents.filter((doc) => doc.id !== id));
    showToast("Document deleted");
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const statusBadge = (status) => {
    const styles = {
      UPLOADED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      PROCESSING: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      NEEDS_REVIEW: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      REVIEWED: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      APPROVED: "bg-green-500/10 text-green-400 border-green-500/20",
      FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return styles[status] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
  };

  // Stats
  const total = documents.length;
  const processing = documents.filter(d => d.status === "PROCESSING").length;
  const failed = documents.filter(d => d.status === "FAILED").length;
  const pendingQueue = uploadQueue.filter(f => f.status === 'pending').length;

  return (
    <DashboardLayout role={userRole} navigate={navigate} title="Upload Center">

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="My Uploads" value={total} icon={FileText} color="text-brand-accent" />
        <StatCard title="Processing" value={processing} icon={Clock} color="text-purple-400" />
        <StatCard title="Queue" value={pendingQueue} icon={UploadCloud} color="text-orange-400" />
        <StatCard title="Failed" value={failed} icon={AlertCircle} color="text-red-400" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Upload Zone & Queue */}
        <div className="xl:col-span-2 space-y-8">

          {/* Upload Zone */}
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
            <input
              type="file"
              multiple
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => handleFilesSelected(e.target.files)}
            />

            <div className="w-20 h-20 bg-brand-800 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-accent group-hover:scale-110 transition-transform shadow-lg shadow-brand-950/50">
              <UploadCloud size={40} />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Drag & Drop files here</h3>
            <p className="text-slate-400 mb-6">or click to browse from your computer</p>

            <div className="flex gap-4 justify-center text-xs text-slate-500 font-mono">
              <span className="bg-brand-900/50 px-3 py-1 rounded">PDF</span>
              <span className="bg-brand-900/50 px-3 py-1 rounded">JPG</span>
              <span className="bg-brand-900/50 px-3 py-1 rounded">PNG</span>
              <span className="bg-brand-900/50 px-3 py-1 rounded">Max 10MB</span>
            </div>
          </motion.div>

          {/* Upload Queue */}
          <AnimatePresence>
            {uploadQueue.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-brand-900 border border-brand-800 rounded-xl overflow-hidden shadow-xl"
              >
                <div className="px-6 py-4 border-b border-brand-800 flex justify-between items-center bg-brand-950/30">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <UploadCloud size={18} className="text-brand-accent" />
                    Upload Queue
                  </h3>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setUploadQueue([])}
                      className="!py-1.5 !px-3 !text-xs"
                    >
                      Clear All
                    </Button>
                    <Button
                      variant="primary"
                      onClick={startUpload}
                      disabled={!uploadQueue.some(f => f.status === 'pending')}
                      className="!py-1.5 !px-3 !text-xs"
                    >
                      Start Upload
                    </Button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto p-4 space-y-3">
                  {uploadQueue.map(item => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-brand-950/50 border border-brand-800 p-4 rounded-lg flex items-center gap-4 group"
                    >
                      <div className="w-10 h-10 rounded bg-brand-800 flex items-center justify-center text-slate-400 shrink-0">
                        <File size={20} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-medium text-white truncate text-sm">{item.file.name}</p>
                          <button
                            onClick={() => removeFile(item.id)}
                            className="text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                          <span>{(item.file.size / 1024 / 1024).toFixed(2)} MB</span>
                          <span className={item.status === 'done' ? 'text-green-400' : item.status === 'error' ? 'text-red-400' : ''}>
                            {item.status === 'pending' ? 'Ready' : item.status === 'uploading' ? 'Uploading...' : item.status}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-brand-800/50 rounded-full h-1.5 overflow-hidden">
                          <motion.div
                            className={`h-full ${item.status === 'error' ? 'bg-red-500' : item.status === 'done' ? 'bg-green-500' : 'bg-brand-accent'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Tag Selection (Visual Only for now) */}
                      {item.status === 'pending' && (
                        <div className="hidden sm:block">
                          <select
                            className="bg-brand-900 border border-brand-700 text-xs text-slate-300 rounded px-2 py-1 focus:outline-none focus:border-brand-accent"
                            value={item.tag}
                            onChange={(e) => updateFileStatus(item.id, { tag: e.target.value })}
                          >
                            <option>General</option>
                            <option>Invoice</option>
                            <option>Contract</option>
                            <option>Report</option>
                          </select>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Recent Uploads */}
        <div className="xl:col-span-1">
          <div className="bg-brand-900 border border-brand-800 rounded-xl overflow-hidden shadow-xl h-full flex flex-col">
            <div className="px-6 py-4 border-b border-brand-800 bg-brand-950/30">
              <h3 className="font-semibold text-white">Recent Documents</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {documents.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 p-8">
                  <div className="w-16 h-16 rounded-full bg-brand-800/50 flex items-center justify-center">
                    <FileText size={24} className="opacity-50" />
                  </div>
                  <p>No documents found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.slice(0, 10).map((doc) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 rounded-lg bg-brand-950/50 hover:bg-brand-800/30 border border-transparent hover:border-brand-700/50 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-8 h-8 rounded bg-brand-800 flex items-center justify-center text-slate-400 shrink-0">
                            <FileText size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate" title={doc.filename}>{doc.filename}</p>
                            <p className="text-[10px] text-slate-500">{new Date(doc.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${statusBadge(doc.status)}`}>
                          {doc.status ? doc.status.replace("_", " ") : "INGESTED"}
                        </span>
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="text-brand-accent hover:text-white text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye size={12} /> View
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewDoc(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-brand-900 border border-brand-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-brand-800 flex justify-between items-center bg-brand-950">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText size={20} className="text-brand-accent" />
                  Document Details
                </h3>
                <button onClick={() => setPreviewDoc(null)} className="text-slate-500 hover:text-white">
                  <XCircle size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4 p-4 bg-brand-950 rounded-lg border border-brand-800">
                  <div className="w-12 h-12 bg-brand-900 rounded-lg flex items-center justify-center text-brand-accent">
                    <File size={24} />
                  </div>
                  <div>
                    <p className="text-white font-medium">{previewDoc.filename}</p>
                    <p className="text-xs text-slate-500">ID: {previewDoc.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-brand-950 rounded border border-brand-800">
                    <p className="text-xs text-slate-500 uppercase mb-1">Status</p>
                    <span className={`text-xs px-2 py-1 rounded inline-block ${statusBadge(previewDoc.status)}`}>
                      {previewDoc.status}
                    </span>
                  </div>
                  <div className="p-3 bg-brand-950 rounded border border-brand-800">
                    <p className="text-xs text-slate-500 uppercase mb-1">Uploaded On</p>
                    <p className="text-sm text-slate-300">{new Date(previewDoc.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-brand-950 border-t border-brand-800 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setPreviewDoc(null)}>Close</Button>
                <Button variant="primary">Start Audit</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 right-6 bg-brand-900 border border-brand-700 text-white px-4 py-3 rounded-lg shadow-2xl z-50 flex items-center gap-3"
        >
          <div className="w-2 h-2 rounded-full bg-brand-accent" />
          {toast}
        </motion.div>
      )}
    </DashboardLayout>
  );
}
