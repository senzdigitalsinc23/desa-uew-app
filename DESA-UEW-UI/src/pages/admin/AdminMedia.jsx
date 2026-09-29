import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Trash2, Image as ImageIcon, FileText, Loader2, Download, Filter } from 'lucide-react';
import { listMediaFiles, deleteMediaFile } from '../../services/api';

const CATEGORY_COLORS = {
  gallery: 'bg-emerald-100 text-emerald-700',
  'course-files': 'bg-blue-100 text-blue-700',
  announcements: 'bg-amber-100 text-amber-700',
  profiles: 'bg-purple-100 text-purple-700',
  documents: 'bg-slate-100 text-slate-700',
  media: 'bg-rose-100 text-rose-700',
  general: 'bg-slate-100 text-slate-700',
};

const FILE_ICONS = {
  image: ImageIcon,
  video: FileText,
  audio: FileText,
  pdf: FileText,
  default: FileText,
};

function formatSize(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0, size = bytes;
  while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
  return `${size.toFixed(1)} ${units[i]}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminMedia() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const isApiMode = import.meta.env.VITE_DATA_SOURCE === 'api_access';

  useEffect(() => { loadFiles(); }, []);

  async function loadFiles() {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const params = filterCategory !== 'all' ? { category: filterCategory } : {};
      const data = await listMediaFiles(params);
      setFiles(data || []);
    } catch (e) {
      setErrorMsg('Failed to load files');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (filterCategory !== 'all') loadFiles();
    else { setIsLoading(true); setFiles([]); setIsLoading(false); }
  }, [filterCategory]);

  const toast = (msg, type = 'success') => {
    if (type === 'success') { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); }
    else { setErrorMsg(msg); setTimeout(() => setErrorMsg(''), 3000); }
  };

  const handleDelete = async (file) => {
    if (!confirm(`Delete "${file.original_name}"?`)) return;
    setDeletingId(file.id);
    try {
      await deleteMediaFile(file.id);
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      toast('File deleted successfully');
    } catch (e) {
      toast(e.message || 'Delete failed', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const categories = ['all', 'gallery', 'course-files', 'announcements', 'profiles', 'documents', 'media', 'general'];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">Manage all uploaded files across categories.</p>
        <button onClick={loadFiles} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold cursor-pointer transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh
        </button>
      </div>

      <AnimatePresence>
        {successMsg && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold"><CheckCircle2 className="w-4 h-4 shrink-0" />{successMsg}</motion.div>}
        {errorMsg && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold"><AlertCircle className="w-4 h-4 shrink-0" />{errorMsg}</motion.div>}
      </AnimatePresence>

      {/* Category filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Filter by Category</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filterCategory === cat
                  ? 'bg-uew-red text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Files' : cat.replace('-', ' ')}
              <span className="ml-1 text-[10px] opacity-70">
                {cat === 'all' ? files.length : files.filter((f) => f.category === cat).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Files list */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-uew-red" />
          </div>
        ) : files.length === 0 ? (
          <div className="py-16 text-center">
            <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No files uploaded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {files.map((file) => {
              const isImage = file.mime_type?.startsWith('image/');
              const IconComp = isImage ? ImageIcon : FileText;
              const catClass = CATEGORY_COLORS[file.category] || 'bg-slate-100 text-slate-700';

              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                    {isImage && file.url ? (
                      <img src={file.url} alt={file.original_name} className="w-full h-full object-top" onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling?.classList.remove('hidden'); }} />
                    ) : null}
                    <IconComp className={`w-5 h-5 text-slate-400 ${isImage ? 'hidden' : ''}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-slate-700 truncate">{file.original_name}</p>
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${catClass}`}>{file.category}</span>
                      {file.subcategory && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500 shrink-0">{file.subcategory}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>{formatSize(file.size)}</span>
                      <span>·</span>
                      <span>{file.extension?.toUpperCase()}</span>
                      <span>·</span>
                      <span>{formatDate(file.created_at)}</span>
                    </div>
                    {file.description && (
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">{file.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-slate-400 hover:text-uew-red hover:bg-red-50 transition-colors cursor-pointer"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleDelete(file)}
                      disabled={deletingId === file.id}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === file.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {!isLoading && files.length > 0 && (
        <p className="text-xs text-slate-400 text-center">
          Showing {files.length} file{files.length !== 1 ? 's' : ''}
          {filterCategory !== 'all' && ` in ${filterCategory}`}
        </p>
      )}
    </div>
  );
}
