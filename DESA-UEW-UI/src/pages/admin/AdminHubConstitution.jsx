import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, CheckCircle2, AlertCircle, X, Plus, Pencil, Trash2 } from 'lucide-react';
import { getHubData, persistHubData, resetHubData } from '../../data/hubPersistence';

export default function AdminHubConstitution() {
  const [data, setData] = useState(null);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editArticleIdx, setEditArticleIdx] = useState(null);
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

  const save = (field, value) => {
    const updated = { ...data, [field]: value };
    setData(updated);
    persistHubData(updated);
    setSuccessMsg('Saved'); setTimeout(() => setSuccessMsg(''), 3000);
    setEditField(null);
  };

  const saveArticle = (idx, field, value) => {
    const articles = data.constitution.articles.map((a, i) => i === idx ? { ...a, [field]: value } : a);
    const updated = { ...data, constitution: { ...data.constitution, articles } };
    setData(updated);
    persistHubData(updated);
    setSuccessMsg('Saved'); setTimeout(() => setSuccessMsg(''), 3000);
    setEditArticleIdx(null);
  };

  const addArticle = async () => {
    const num = data.constitution.articles.length + 1;
    const article = { number: `Article ${num}`, title: '', content: '' };
    const articles = [...data.constitution.articles, article];
    const updated = { ...data, constitution: { ...data.constitution, articles } };
    await persistHubData(updated);
    setData(updated);
    setSuccessMsg('Article added'); setTimeout(() => setSuccessMsg(''), 3000);
  };

  const deleteArticle = async (idx) => {
    const articles = data.constitution.articles.filter((_, i) => i !== idx);
    const updated = { ...data, constitution: { ...data.constitution, articles } };
    await persistHubData(updated);
    setData(updated);
    setSuccessMsg('Deleted'); setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">Edit the DESA constitution preamble and articles.</p>
        <button onClick={resetHubData} className="px-3 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 cursor-pointer">Reset</button>
      </div>

      <AnimatePresence>
        {successMsg && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold"><CheckCircle2 className="w-4 h-4" />{successMsg}</motion.div>}
        {errorMsg && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold"><AlertCircle className="w-4 h-4" />{errorMsg}</motion.div>}
      </AnimatePresence>

      {/* Preamble */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-uew-navy">Preamble</h3>
          <button onClick={() => { setEditField('preamble'); setEditValue(data.constitution.preamble || ''); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-uew-navy cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
        </div>
        {editField === 'preamble' ? (
          <div className="space-y-2">
            <textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-uew-red/20" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditField(null)} className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer">Cancel</button>
              <button onClick={() => save('constitution', { ...data.constitution, preamble: editValue })} className="px-3 py-2 rounded-lg bg-uew-red text-white text-xs font-bold cursor-pointer"><Save className="w-3.5 h-3.5 inline" />Save</button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-600 leading-relaxed italic">{data.constitution.preamble}</p>
        )}
      </div>

      {/* Articles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-uew-navy">Articles ({data.constitution.articles?.length || 0})</h3>
          <button onClick={addArticle} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-uew-red text-white text-xs font-bold hover:bg-uew-redHover cursor-pointer"><Plus className="w-3.5 h-3.5" />Add Article</button>
        </div>
        {data.constitution.articles?.map((article, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-uew-red uppercase tracking-wider">{article.number}</span>
              <div className="flex gap-1">
                <button onClick={() => { setEditArticleIdx(idx); setEditValue(article.title); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-uew-navy cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => deleteArticle(idx)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-uew-red cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            {editArticleIdx === idx ? (
              <div className="space-y-2">
                <input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-uew-red/20" placeholder="Article title" />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditArticleIdx(null)} className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer">Cancel</button>
                  <button onClick={() => saveArticle(idx, 'title', editValue)} className="px-3 py-2 rounded-lg bg-uew-red text-white text-xs font-bold cursor-pointer"><Save className="w-3.5 h-3.5 inline" />Save</button>
                </div>
              </div>
            ) : (
              <>
                <p className="font-bold text-uew-navy text-sm">{article.title}</p>
                <p className="text-xs text-slate-500 mt-1">{article.content}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
