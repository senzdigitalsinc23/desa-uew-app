import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import FileUpload from '../../components/FileUpload';
import { listMediaFiles, deleteMediaFile } from '../../services/api';

export default function AdminHubGallery() {
  const [photos, setPhotos] = useState([]);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const isApiMode = import.meta.env.VITE_DATA_SOURCE === 'api_access';

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        if (isApiMode) {
          const mediaData = await listMediaFiles({ category: 'gallery', limit: 100 });
          const mediaItems = (mediaData || []).map((m) => ({
            id: m.id,
            url: m.url,
            caption: m.description || m.original_name,
            media_id: m.id,
            category: m.category,
            subcategory: m.subcategory,
            size: m.size,
            created_at: m.created_at,
          }));
          if (!cancelled) setPhotos(mediaItems);
        } else {
          const { getHubData } = await import('../../data/hubPersistence');
          const data = await getHubData();
          if (!cancelled) setPhotos(data.gallery || []);
        }
      } catch {
        if (!cancelled) setPhotos([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    const handler = () => {
      if (isApiMode) {
        listMediaFiles({ category: 'gallery', limit: 100 }).then((d) => {
          if (!cancelled) setPhotos((d || []).map((m) => ({
            id: m.id, url: m.url, caption: m.description || m.original_name, media_id: m.id,
          })));
        });
      }
    };
    window.addEventListener('desa-data-changed', handler);
    return () => { cancelled = true; window.removeEventListener('desa-data-changed', handler); };
  }, [isApiMode]);

  const toast = (msg, type = 'success') => {
    if (type === 'success') { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); }
    else { setErrorMsg(msg); setTimeout(() => setErrorMsg(''), 3000); }
  };

  const handleFileUploaded = async (fileData) => {
    try {
      // Refresh gallery from media files
      const data = await listMediaFiles({ category: 'gallery', limit: 100 });
      setPhotos((data || []).map((m) => ({
        id: m.id, url: m.url, caption: m.description || m.original_name, media_id: m.id,
      })));
      toast('Photo uploaded successfully');
    } catch (e) {
      toast(e.message || 'Upload failed', 'error');
    }
  };

  const startEdit = (idx) => { setEditingIdx(idx); setEditForm({ ...photos[idx] }); };
  const cancelEdit = () => { setEditingIdx(null); setEditForm({}); };

  const saveEdit = async () => {
    if (!editForm.caption?.trim()) { toast('Caption required', 'error'); return; }
    const updated = photos.map((p, i) => i === editingIdx ? { ...p, caption: editForm.caption } : p);
    setPhotos(updated);
    setEditingIdx(null);
    toast('Saved');
  };

  const deleteItem = async (photo) => {
    if (!confirm('Delete this photo?')) return;
    if (isApiMode && photo.media_id) {
      try { await deleteMediaFile(photo.media_id); } catch {}
    }
    const updated = photos.filter((p) => p.id !== photo.id);
    setPhotos(updated);
    toast('Deleted');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">Manage gallery photos and captions.</p>
      </div>

      <AnimatePresence>
        {successMsg && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold"><CheckCircle2 className="w-4 h-4 shrink-0" />{successMsg}</motion.div>}
        {errorMsg && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold"><AlertCircle className="w-4 h-4 shrink-0" />{errorMsg}</motion.div>}
      </AnimatePresence>

      {/* File upload zone */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Upload New Photo</p>
        <FileUpload onUploaded={handleFileUploaded} category="gallery" maxSizeMB={10} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-uew-red" />
        </div>
      ) : photos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No photos yet. Upload one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo, idx) => {
            const src = photo.url || '';
            return (
              <motion.div
                key={photo.id || idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm group"
              >
                <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden relative">
                  {src ? (
                    <img src={src} alt={photo.caption} className="w-full h-full object-top" onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className="text-center text-slate-300"><ImageIcon className="w-8 h-8 mx-auto" /><p className="text-xs mt-1">No image</p></div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button onClick={() => startEdit(idx)} className="p-2 rounded-full bg-white text-slate-700 hover:text-uew-red cursor-pointer"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                    <button onClick={() => deleteItem(photo)} className="p-2 rounded-full bg-white text-slate-700 hover:text-uew-red cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="p-3">
                  {editingIdx === idx ? (
                    <div className="space-y-2">
                      <input type="text" value={editForm.caption || ''} onChange={(e) => setEditForm((f) => ({ ...f, caption: e.target.value }))}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-uew-red" placeholder="Caption" />
                      <div className="flex gap-2">
                        <button onClick={cancelEdit} className="px-2 py-1 rounded-lg border border-slate-200 text-slate-600 text-[10px] font-bold cursor-pointer">Cancel</button>
                        <button onClick={saveEdit} className="px-2 py-1 rounded-lg bg-uew-red text-white text-[10px] font-bold cursor-pointer">Save</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-slate-700 truncate">{photo.caption || 'Untitled'}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
