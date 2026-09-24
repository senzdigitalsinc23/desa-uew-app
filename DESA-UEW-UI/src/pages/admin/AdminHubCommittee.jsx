import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, CheckCircle2, AlertCircle, X, Plus, Pencil, Trash2 } from 'lucide-react';
import { getHubData, persistHubData, resetHubData } from '../../data/hubPersistence';

export default function AdminHubCommittee() {
  const [items, setItems] = useState([]);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', chair: '', members: 3, description: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = await getHubData();
      if (!cancelled) setItems(data.committees || []);
    }
    load();
    const handler = () => { getHubData().then((d) => { if (!cancelled) setItems(d.committees || []); }); };
    window.addEventListener('desa-data-changed', handler);
    return () => { cancelled = true; window.removeEventListener('desa-data-changed', handler); };
  }, []);

  const save = (data) => { setItems(data); persistHubData({ committees: data }); };

  const startEdit = (idx) => { setEditingIdx(idx); setEditForm({ ...items[idx] }); };
  const cancelEdit = () => { setEditingIdx(null); setEditForm({}); };

  const saveEdit = async () => {
    if (!editForm.name.trim()) { setErrorMsg('Committee name required'); return; }
    const updated = items.map((item, i) => i === editingIdx ? editForm : item);
    await save(updated); setEditingIdx(null); setSuccessMsg('Saved'); setTimeout(() => setSuccessMsg(''), 3000); setErrorMsg('');
  };

  const handleAdd = async () => {
    if (!addForm.name.trim()) { setErrorMsg('Committee name required'); return; }
    await save([...items, addForm]); setShowAdd(false); setAddForm({ name: '', chair: '', members: 3, description: '' });
    setSuccessMsg('Added'); setTimeout(() => setSuccessMsg(''), 3000); setErrorMsg('');
  };

  const deleteItem = async (idx) => {
    if (!confirm('Delete this committee?')) return;
    await save(items.filter((_, i) => i !== idx));
    setSuccessMsg('Deleted'); setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">Manage DESA standing and ad-hoc committees.</p>
        <div className="flex gap-2">
          <button onClick={() => { setShowAdd(true); setAddForm({ name: '', chair: '', members: 3, description: '' }); }} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-uew-red text-white text-xs font-bold hover:bg-uew-redHover cursor-pointer"><Plus className="w-3.5 h-3.5" />Add Committee</button>
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
            <h3 className="text-sm font-black text-uew-navy">Add Committee</h3>
            <button onClick={() => setShowAdd(false)} className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer"><X className="w-4 h-4 text-slate-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {['name', 'chair'].map((f) => (
              <div key={f}>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{f}</label>
                <input type="text" value={addForm[f]} onChange={(e) => setAddForm((form) => ({ ...form, [f]: e.target.value }))} placeholder={f} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-uew-red/20 bg-slate-50" />
              </div>
            ))}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Members</label>
              <input type="number" value={addForm.members} onChange={(e) => setAddForm((form) => ({ ...form, members: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-uew-red/20 bg-slate-50" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
              <textarea value={addForm.description} onChange={(e) => setAddForm((form) => ({ ...form, description: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-uew-red/20 bg-slate-50" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer">Cancel</button>
            <button onClick={handleAdd} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-uew-red text-white text-xs font-bold hover:bg-uew-redHover cursor-pointer"><CheckCircle2 className="w-3.5 h-3.5" />Save</button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((committee, idx) => (
          <div key={idx} className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-uew-navy/30 hover:shadow-md transition-all ${editingIdx === idx ? 'ring-2 ring-uew-red' : ''}`}>
            {editingIdx === idx ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {['name', 'chair'].map((f) => (
                    <input key={f} type="text" value={editForm[f]} onChange={(e) => setEditForm((form) => ({ ...form, [f]: e.target.value }))} className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-uew-red/20" />
                  ))}
                </div>
                <input type="number" value={editForm.members} onChange={(e) => setEditForm((form) => ({ ...form, members: parseInt(e.target.value) || 0 }))} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-uew-red/20" placeholder="Members" />
                <textarea value={editForm.description || ''} onChange={(e) => setEditForm((form) => ({ ...form, description: e.target.value }))} rows={2} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-uew-red/20" placeholder="Description" />
                <div className="flex gap-2 justify-end">
                  <button onClick={cancelEdit} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer">Cancel</button>
                  <button onClick={saveEdit} className="px-3 py-1.5 rounded-lg bg-uew-red text-white text-xs font-bold cursor-pointer">Save</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-uew-navy text-sm">{committee.name}</h4>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => startEdit(idx)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-uew-navy cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteItem(idx)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-uew-red cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">{committee.description}</p>
                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                  <span className="font-semibold">Chair: <span className="text-slate-700">{committee.chair || 'TBA'}</span></span>
                  <span>·</span>
                  <span>{committee.members} members</span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
