import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, CheckCircle2, AlertCircle, X, Plus, Pencil, Trash2 } from 'lucide-react';
import { getHubData, persistHubData, resetHubData } from '../../data/hubPersistence';
import { setNested } from '../../data/nestedSet';

export default function AdminHubAbout() {
  const [data, setData] = useState(null);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const d = await getHubData();
      if (!cancelled) setData(d);
    }
    load();
    const handler = () => { getHubData().then((d) => { if (!cancelled) setData(d); }); };
    window.addEventListener('desa-data-changed', handler);
    return () => { cancelled = true; window.removeEventListener('desa-data-changed', handler); };
  }, []);

  if (!data) return <div className="text-sm text-slate-500 font-semibold">Loading...</div>;

  const save = async (field, value) => {
    const updated = setNested(data, field, value);
    await persistHubData(updated);
    setData(updated);
    setSuccessMsg('Saved'); setTimeout(() => setSuccessMsg(''), 3000);
    setEditField(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">Edit the About DESA section content.</p>
        <button onClick={resetHubData} className="px-3 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 cursor-pointer">Reset</button>
      </div>
      <AnimatePresence>
        {successMsg && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold"><CheckCircle2 className="w-4 h-4" />{successMsg}</motion.div>}
        {errorMsg && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold"><AlertCircle className="w-4 h-4" />{errorMsg}</motion.div>}
      </AnimatePresence>

      {/* Title */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-uew-navy">Title</h3>
          <button onClick={() => { setEditField('title'); setEditValue(data.about?.title || ''); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-uew-navy cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
        </div>
        {editField === 'title' ? (
          <div className="flex gap-2">
            <input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-uew-red/20" />
            <button onClick={() => save('about.title', editValue)} className="px-3 py-2 rounded-lg bg-uew-red text-white text-xs font-bold cursor-pointer"><Save className="w-3.5 h-3.5 inline" /></button>
            <button onClick={() => setEditField(null)} className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer"><X className="w-3.5 h-3.5 inline" /></button>
          </div>
        ) : (
          <p className="text-base font-bold text-uew-navy">{data.about?.title}</p>
        )}
      </div>

      {/* Subtitle */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-uew-navy">Subtitle</h3>
          <button onClick={() => { setEditField('subtitle'); setEditValue(data.about?.subtitle || ''); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-uew-navy cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
        </div>
        {editField === 'subtitle' ? (
          <div className="flex gap-2">
            <input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-uew-red/20" />
            <button onClick={() => save('about.subtitle', editValue)} className="px-3 py-2 rounded-lg bg-uew-red text-white text-xs font-bold cursor-pointer"><Save className="w-3.5 h-3.5 inline" /></button>
            <button onClick={() => setEditField(null)} className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer"><X className="w-3.5 h-3.5 inline" /></button>
          </div>
        ) : (
          <p className="text-sm text-slate-600">{data.about?.subtitle}</p>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-uew-navy">Content (paragraphs)</h3>
          <button onClick={() => { setEditField('content'); setEditValue(data.about?.content || ''); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-uew-navy cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
        </div>
        {editField === 'content' ? (
          <div className="space-y-2">
            <textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} rows={8} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-uew-red/20" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditField(null)} className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer">Cancel</button>
              <button onClick={() => save('about.content', editValue)} className="px-3 py-2 rounded-lg bg-uew-red text-white text-xs font-bold cursor-pointer"><Save className="w-3.5 h-3.5 inline" />Save</button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
            {data.about?.content?.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
          </div>
        )}
      </div>
    </div>
  );
}
