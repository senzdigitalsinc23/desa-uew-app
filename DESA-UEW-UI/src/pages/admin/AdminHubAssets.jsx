import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, CheckCircle2, AlertCircle, X, Plus, Pencil, Trash2 } from 'lucide-react';
import { getHubData, persistHubData, resetHubData } from '../../data/hubPersistence';

export default function AdminHubAssets() {
  const [items, setItems] = useState([]);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ sn: '', item: '', description: '', dateAcquired: '', status: 'Good' });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = await getHubData();
      if (!cancelled) setItems(data.assets || []);
    }
    load();
    const handler = () => { getHubData().then((d) => { if (!cancelled) setItems(d.assets || []); }); };
    window.addEventListener('desa-data-changed', handler);
    return () => { cancelled = true; window.removeEventListener('desa-data-changed', handler); };
  }, []);

  const save = (data) => { setItems(data); persistHubData({ assets: data }); };

  const startEdit = (idx) => { setEditingIdx(idx); setEditForm({ ...items[idx] }); };
  const cancelEdit = () => { setEditingIdx(null); setEditForm({}); };

  const saveEdit = async () => {
    if (!editForm.item.trim()) { setErrorMsg('Item name required'); return; }
    const updated = items.map((item, i) => i === editingIdx ? editForm : item);
    await save(updated); setEditingIdx(null); setSuccessMsg('Saved'); setTimeout(() => setSuccessMsg(''), 3000); setErrorMsg('');
  };

  const handleAdd = async () => {
    if (!addForm.item.trim()) { setErrorMsg('Item name required'); return; }
    await save([...items, addForm]); setShowAdd(false); setAddForm({ sn: String(items.length + 1), item: '', description: '', dateAcquired: '', status: 'Good' });
    setSuccessMsg('Added'); setTimeout(() => setSuccessMsg(''), 3000); setErrorMsg('');
  };

  const deleteItem = async (idx) => {
    if (!confirm('Delete this asset?')) return;
    await save(items.filter((_, i) => i !== idx));
    setSuccessMsg('Deleted'); setTimeout(() => setSuccessMsg(''), 3000);
  };

  const statusColor = (s) => s === 'Good' ? 'text-emerald-600 bg-emerald-50' : s === 'Fair' ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">Manage DESA assets and equipment inventory.</p>
        <div className="flex gap-2">
          <button onClick={() => { setShowAdd(true); setAddForm({ sn: String(items.length + 1), item: '', description: '', dateAcquired: '', status: 'Good' }); }} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-uew-red text-white text-xs font-bold hover:bg-uew-redHover cursor-pointer"><Plus className="w-3.5 h-3.5" />Add Asset</button>
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
            <h3 className="text-sm font-black text-uew-navy">Add Asset</h3>
            <button onClick={() => setShowAdd(false)} className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer"><X className="w-4 h-4 text-slate-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {['sn', 'item', 'description', 'dateAcquired'].map((f) => (
              <div key={f}>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{f}</label>
                <input type="text" value={addForm[f]} onChange={(e) => setAddForm((form) => ({ ...form, [f]: e.target.value }))} placeholder={f} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-uew-red/20 bg-slate-50" />
              </div>
            ))}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
              <select value={addForm.status} onChange={(e) => setAddForm((form) => ({ ...form, status: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-uew-red/20 bg-slate-50">
                {['Good', 'Fair', 'Poor'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer">Cancel</button>
            <button onClick={handleAdd} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-uew-red text-white text-xs font-bold hover:bg-uew-redHover cursor-pointer"><CheckCircle2 className="w-3.5 h-3.5" />Save</button>
          </div>
        </motion.div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {['S/N', 'Item', 'Description', 'Date Acquired', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 font-mono text-slate-400">{item.sn}</td>
                <td className="py-3 px-4 font-semibold text-uew-navy">{item.item}</td>
                <td className="py-3 px-4 text-slate-600">{item.description}</td>
                <td className="py-3 px-4 text-slate-500">{item.dateAcquired}</td>
                <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${statusColor(item.status)}`}>{item.status}</span></td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(idx)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-uew-navy cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteItem(idx)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-uew-red cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
