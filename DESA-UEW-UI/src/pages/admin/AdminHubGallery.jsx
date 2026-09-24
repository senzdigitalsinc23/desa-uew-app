import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, CheckCircle2, AlertCircle, X, Plus, Pencil, Trash2 } from 'lucide-react';
import { getHubData, persistHubData, resetHubData } from '../../data/hubPersistence';

export default function AdminHubGallery() {
  const [photos, setPhotos] = useState([]);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ url: '', caption: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = await getHubData();
      if (!cancelled) setPhotos(data.gallery || []);
    }
    load();
    const handler = () => { getHubData().then((d) => { if (!cancelled) setPhotos(d.gallery || []); }); };
    window.addEventListener('desa-data-changed', handler);
    return () => { cancelled = true; window.removeEventListener('desa-data-changed', handler); };
  }, []);

  const save = (data) => { setPhotos(data); persistHubData({ gallery: data }); };

  const startEdit = (idx) => { setEditingIdx(idx); setEditForm({ ...photos[idx] }); };
  const cancelEdit = () => { setEditingIdx(null); setEditForm({}); };

  const saveEdit = async () => {
    if (!editForm.caption.trim()) { setErrorMsg('Caption required'); return; }
    const updated = photos.map((p, i) => i === editingIdx ? editForm : p);
    await save(updated); setEditingIdx(null); setSuccessMsg('Saved'); setTimeout(() => setSuccessMsg(''), 3000); setErrorMsg('');
  };

  const handleAdd = async () => {
    if (!addForm.caption.trim()) { setErrorMsg('Caption required'); return; }
    await save([...photos, addForm]); setShowAdd(false); setAddForm({ url: '', caption: '' });
    setSuccessMsg('Added'); setTimeout(() => setSuccessMsg(''), 3000); setErrorMsg('');
  };

  const deleteItem = async (idx) => {
    if (!confirm('Delete this photo?')) return;
    await save(photos.filter((_, i) => i !== idx));
    setSuccessMsg('Deleted'); setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">Manage gallery photos and captions.</p>
        <div className="flex gap-2">
          <button onClick={() => { setShowAdd(true); setAddForm({ url: '', caption: '' }); }} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-uew-red text-white text-xs font-bold hover:bg-uew-redHover cursor-pointer"><Plus className="w-3.5 h-3.5" />Add Photo</button>
          <button onClick={resetHubData} className="px-3 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 cursor-pointer">Reset</button>
        </div>
      </div>

      <AnimatePresence>
        {successMsg && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold"><CheckCircle2 className="w-4 h-4" />{successMsg}</motion.div>}
        {errorMsg && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold"><AlertCircle className="w-4 h-4" />{errorMsg}</motion.div>}
      </AnimatePresence>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-black text-uew-navy mb-4">Add Photo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Image URL</label>
              <input type="text" value={addForm.url} onChange={(e) => setAddForm((form) => ({ ...form, url: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-uew-red/20 bg-slate-50" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Caption</label>
              <input type="text" value={addForm.caption} onChange={(e) => setAddForm((form) => ({ ...form, caption: e.target.value }))} placeholder="Photo caption" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-uew-red/20 bg-slate-50" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer">Cancel</button>
            <button onClick={handleAdd} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-uew-red text-white text-xs font-bold hover:bg-uew-redHover cursor-pointer"><CheckCircle2 className="w-3.5 h-3.5" />Save</button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((photo, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm group">
            <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden relative">
              {photo.url ? (
                <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <div className="text-center text-slate-300">
                  <div className="text-3xl font-black">#{idx + 1}</div>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => startEdit(idx)} className="p-2 rounded-full bg-white text-slate-700 hover:text-uew-red cursor-pointer"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => deleteItem(idx)} className="p-2 rounded-full bg-white text-slate-700 hover:text-uew-red cursor-pointer"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="p-3">
              {editingIdx === idx ? (
                <div className="space-y-2">
                  <input type="text" value={editForm.caption || ''} onChange={(e) => setEditForm((form) => ({ ...form, caption: e.target.value }))} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-uew-red" placeholder="Caption" />
                  <div className="flex gap-2">
                    <button onClick={() => setEditingIdx(null)} className="px-2 py-1 rounded-lg border border-slate-200 text-slate-600 text-[10px] font-bold cursor-pointer">Cancel</button>
                    <button onClick={saveEdit} className="px-2 py-1 rounded-lg bg-uew-red text-white text-[10px] font-bold cursor-pointer">Save</button>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-semibold text-slate-700 truncate">{photo.caption || 'Untitled'}</p>
              )}
            </div>
          </div>
        ))}
        {photos.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <p className="text-sm text-slate-400">No photos yet. Click "Add Photo" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
