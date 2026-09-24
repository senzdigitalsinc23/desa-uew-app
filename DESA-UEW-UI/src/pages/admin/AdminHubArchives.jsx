import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, CheckCircle2, AlertCircle, X, Plus, Pencil, Trash2 } from 'lucide-react';
import { getHubData, persistHubData, resetHubData } from '../../data/hubPersistence';

export default function AdminHubArchives() {
  const [items, setItems] = useState([]);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ year: '', title: '', type: 'PDF' });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = await getHubData();
      if (!cancelled) setItems(data.archives || []);
    }
    load();
    const handler = () => { getHubData().then((d) => { if (!cancelled) setItems(d.archives || []); }); };
    window.addEventListener('desa-data-changed', handler);
    return () => { cancelled = true; window.removeEventListener('desa-data-changed', handler); };
  }, []);

  const save = (data) => { setItems(data); persistHubData({ archives: data }); };

  const startEdit = (idx) => { setEditingIdx(idx); setEditForm({ ...items[idx] }); };
  const cancelEdit = () => { setEditingIdx(null); setEditForm({}); };

  const saveEdit = async () => {
    if (!editForm.title.trim()) { setErrorMsg('Title required'); return; }
    const updated = items.map((item, i) => i === editingIdx ? editForm : item);
    await save(updated); setEditingIdx(null); setSuccessMsg('Saved'); setTimeout(() => setSuccessMsg(''), 3000); setErrorMsg('');
  };

  const handleAdd = async () => {
    if (!addForm.title.trim()) { setErrorMsg('Title required'); return; }
    await save([...items, addForm]); setShowAdd(false); setAddForm({ year: '', title: '', type: 'PDF' });
    setSuccessMsg('Added'); setTimeout(() => setSuccessMsg(''), 3000); setErrorMsg('');
  };

  const deleteItem = async (idx) => {
    if (!confirm('Delete this archive?')) return;
    await save(items.filter((_, i) => i !== idx));
    setSuccessMsg('Deleted'); setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">Manage historical documents and past reports.</p>
        <div className="flex gap-2">
          <button onClick={() => { setShowAdd(true); setAddForm({ year: '', title: '', type: 'PDF' }); }} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-uew-red text-white text-xs font-bold hover:bg-uew-redHover cursor-pointer"><Plus className="w-3.5 h-3.5" />Add Archive</button>
          <button onClick={resetHubData} className="px-3 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 cursor-pointer">Reset</button>
        </div>
      </div>

      <AnimatePresence>
        {successMsg && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold"><CheckCircle2 className="w-4 h-4" />{successMsg}</motion.div>}
        {errorMsg && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold"><AlertCircle className="w-4 h-4" />{errorMsg}</motion.div>}
      </AnimatePresence>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-uew-navy">Add Archive Document</h3>
            <button onClick={() => setShowAdd(false)} className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer"><X className="w-4 h-4 text-slate-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {['year', 'title'].map((f) => (
              <div key={f}>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{f}</label>
                <input type="text" value={addForm[f]} onChange={(e) => setAddForm((form) => ({ ...form, [f]: e.target.value }))} placeholder={f} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-uew-red/20 bg-slate-50" />
              </div>
            ))}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Type</label>
              <select value={addForm.type} onChange={(e) => setAddForm((form) => ({ ...form, type: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-uew-red/20 bg-slate-50">
                {['PDF', 'DOC', 'TXT'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer">Cancel</button>
            <button onClick={handleAdd} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-uew-red text-white text-xs font-bold hover:bg-uew-redHover cursor-pointer"><CheckCircle2 className="w-3.5 h-3.5" />Save</button>
          </div>
        </motion.div>
      )}

      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
              <span className="text-xs font-black text-blue-600">{item.type}</span>
            </div>
            <div className="flex-1 min-w-0">
              {editingIdx === idx ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    {['year', 'title', 'type'].map((f) => (
                      <input key={f} type="text" value={editForm[f]} onChange={(e) => setEditForm((form) => ({ ...form, [f]: e.target.value }))} className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-uew-red/20" />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="px-3 py-1 rounded-lg bg-uew-red text-white text-xs font-bold cursor-pointer">Save</button>
                    <button onClick={cancelEdit} className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer">Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-uew-navy text-sm truncate">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.year}</p>
                </div>
              )}
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg shrink-0">{item.type}</span>
            {editingIdx !== idx && (
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => startEdit(idx)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-uew-navy cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => deleteItem(idx)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-uew-red cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
