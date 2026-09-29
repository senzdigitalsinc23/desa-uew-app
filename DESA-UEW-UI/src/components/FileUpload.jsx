import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, FileText, CheckCircle2, AlertCircle, Loader2, FolderTree } from 'lucide-react';

const MAX_PREVIEW_SIZE = 5 * 1024 * 1024; // 5 MB — compress larger images

async function compressImage(file) {
  if (file.size <= MAX_PREVIEW_SIZE || !file.type.startsWith('image/')) return file;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1920;
        let w = img.naturalWidth, h = img.naturalHeight;
        if (w > MAX_DIM || h > MAX_DIM) {
          if (w > h) { h = (h / w) * MAX_DIM; w = MAX_DIM; }
          else       { w = (w / h) * MAX_DIM; h = MAX_DIM; }
        }
        canvas.width  = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => resolve(blob || file),
          'image/jpeg',
          0.85
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

const API_BASE = import.meta.env.VITE_API_BASE_URI || 'http://localhost:8000/api/v1';

export default function FileUpload({ onUploaded, defaultCategory = 'gallery', maxSizeMB = 50 }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const inputRef = useRef(null);

  // Bucket data: { category: [{ subcategory, label }, ...] }
  const [buckets, setBuckets] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [selectedSub, setSelectedSub] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    setSelectedCategory(defaultCategory);
    setSelectedSub('');
    setDescription('');
  }, [defaultCategory]);

  // Load available buckets from API
  useEffect(() => {
    fetch(`${API_BASE}/buckets`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setBuckets(json.data || {}); })
      .catch(() => {});
  }, []);

  const subOptions = (buckets[selectedCategory] || []).map((b) => b.subcategory);

  const handleFiles = useCallback(async (files) => {
    const file = files[0];
    if (!file) return;
    setError('');
    setResult(null);

    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowedExts = ['jpg','jpeg','png','gif','webp','svg','pdf','doc','docx','xls','xlsx','ppt','pptx','txt','zip','mp4','mp3'];
    if (!allowedExts.includes(ext)) {
      setError(`Unsupported format: .${ext}`);
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Maximum ${maxSizeMB} MB.`);
      return;
    }

    if (file.type.startsWith('image/')) {
      const compressed = await compressImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(compressed);
    }

    setUploading(true);
    setProgress(10);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', selectedCategory);
    formData.append('subcategory', selectedSub);
    formData.append('description', description);

    try {
      setProgress(40);
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      setProgress(80);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.message || 'Upload failed');
      setProgress(100);
      setResult(json.data);
      onUploaded?.(json.data);
    } catch (e) {
      setError(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [selectedCategory, selectedSub, description, maxSizeMB, onUploaded]);

  const clear = () => {
    setResult(null);
    setError('');
    setPreviewUrl(null);
    setDescription('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      {/* Category + Subcategory selectors */}
      <div className="flex flex-wrap gap-3 mb-3">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSub(''); }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-uew-red/20 focus:border-uew-red cursor-pointer"
          >
            {Object.keys(buckets).map((cat) => (
              <option key={cat} value={cat}>{cat.replace('-', ' ')}</option>
            ))}
            {Object.keys(buckets).length === 0 && (
              <option value={defaultCategory}>{defaultCategory.replace('-', ' ')}</option>
            )}
          </select>
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Subfolder</label>
          <select
            value={selectedSub}
            onChange={(e) => setSelectedSub(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-uew-red/20 focus:border-uew-red cursor-pointer"
          >
            {subOptions.map((sub) => {
              const opt = (buckets[selectedCategory] || []).find((b) => b.subcategory === sub);
              return <option key={sub} value={sub}>{opt?.label?.split('—')[0]?.trim() ?? (sub === '' ? 'Root' : sub)}</option>;
            })}
          </select>
        </div>
      </div>

      {/* Description field */}
      <div className="mb-3">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description for this file…"
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-uew-red/20 focus:border-uew-red"
        />
      </div>

      {/* Drop zone / preview area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200
          ${dragging ? 'border-uew-red bg-red-50' : 'border-slate-200 hover:border-uew-red/50 hover:bg-slate-50'}
          ${uploading ? 'pointer-events-none opacity-70' : ''}
          ${previewUrl ? 'pb-0' : ''}
        `}
      >
        <input ref={inputRef} type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.mp4,.mp3"
          className="hidden" onChange={(e) => handleFiles(e.target.files)} />

        <AnimatePresence mode="wait">
          {previewUrl && !uploading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-3">
              {fileType(previewUrl).startsWith('image') ? (
                <img src={previewUrl} alt="Preview" className="w-full max-h-48 object-contain rounded-xl bg-slate-100" />
              ) : (
                <div className="flex items-center justify-center gap-2 py-6 text-slate-400">
                  <FileText className="w-8 h-8" />
                  <span className="text-sm font-semibold">{result?.original_name || 'File'}</span>
                </div>
              )}
              <button onClick={(e) => { e.stopPropagation(); clear(); }}
                className="absolute top-2 right-2 p-1 rounded-full bg-white shadow-md hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ) : uploading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6">
              <Loader2 className="w-8 h-8 animate-spin text-uew-red mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">Uploading… {progress}%</p>
              <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div className="h-full bg-uew-red rounded-full" initial={{ width: '10%' }} animate={{ width: `${progress}%` }} />
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4">
              <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600">Click or drag file here</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {selectedCategory.replace('-', ' ')}
                {selectedSub && <span> → <FolderTree className="w-3 h-3 inline mr-0.5" />{selectedSub}</span>}
                {' · Max '}{maxSizeMB} MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{result.original_name} ({formatSize(result.size)})</span>
          {result.subcategory && (
            <span className="ml-auto text-[10px] text-emerald-500 bg-emerald-100 px-1.5 py-0.5 rounded-md">
              {result.category}/{result.subcategory}
            </span>
          )}
          {result.description && (
            <span className="text-[10px] text-emerald-500 bg-emerald-100 px-1.5 py-0.5 rounded-md truncate max-w-[200px]" title={result.description}>
              {result.description}
            </span>
          )}
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </motion.div>
      )}
    </div>
  );
}

function fileType(mimeType) {
  if (!mimeType) return 'other';
  if (mimeType.startsWith('image')) return 'image';
  if (mimeType.startsWith('video')) return 'video';
  if (mimeType.startsWith('audio')) return 'audio';
  return 'document';
}

function formatSize(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0, size = bytes;
  while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
  return `${size.toFixed(1)} ${units[i]}`;
}
