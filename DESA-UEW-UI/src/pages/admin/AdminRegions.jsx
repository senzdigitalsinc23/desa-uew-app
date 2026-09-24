import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, Save, CheckCircle2, AlertCircle,
  MapPin, Download, RefreshCw, Eye, EyeOff, ChevronRight, Building2, GraduationCap, Upload,
} from 'lucide-react';
import {
  getCentersData, persistCentersData, downloadJSON, resetAll,
  exportAllData, importJSONFile,
} from '../../data/persistence';
import Collapsible from '../../components/admin/Collapsible';

export default function AdminRegions() {
  const [regions, setRegions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [addMode, setAddMode] = useState(false);
  const [addForm, setAddForm] = useState({ id: '', name: '', shortName: '', capital: '', code: '', description: '', public: true });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = React.useRef(null);

  const totalCenters = regions.reduce((s, r) => s + r.centers.length, 0);
  const totalPrograms = regions.reduce((s, r) => s + r.programs.length, 0);

  // Load data on mount and on data changes
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = await getCentersData();
      if (!cancelled) setRegions(data);
    }
    load();
    const handler = () => { getCentersData().then((d) => { if (!cancelled) setRegions(d); }); };
    window.addEventListener('desa-data-changed', handler);
    return () => { cancelled = true; window.removeEventListener('desa-data-changed', handler); };
  }, []);

  const startEdit = (r) => { setEditingId(r.id); setEditForm({ ...r }); };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };
  const uf = (field, value) => setEditForm((f) => ({ ...f, [field]: value }));
  const ua = (field, value) => setAddForm((f) => ({ ...f, [field]: value }));

  const saveEdit = async () => {
    if (!editForm.id.trim() || !editForm.name.trim()) { setErrorMsg('ID and Name required'); return; }
    const updated = regions.map((r) => r.id === editingId ? editForm : r);
    await persistCentersData(updated);
    setRegions(updated); setEditingId(null);
    setSuccessMsg('Region saved'); setTimeout(() => setSuccessMsg(''), 3000); setErrorMsg('');
  };

  const handleAdd = async () => {
    if (!addForm.id.trim() || !addForm.name.trim()) { setErrorMsg('ID and Name required'); return; }
    if (regions.some((r) => r.id === addForm.id)) { setErrorMsg('ID already exists'); return; }
    const updated = [...regions, { ...addForm, programs: [], centers: [] }];
    await persistCentersData(updated);
    setRegions(updated); setAddMode(false); setAddForm({ id: '', name: '', shortName: '', capital: '', code: '', description: '', public: true });
    setSuccessMsg('Region added'); setTimeout(() => setSuccessMsg(''), 3000); setErrorMsg('');
  };

  const deleteRegion = async (id) => {
    if (!confirm('Delete this region and all its data?')) return;
    const updated = regions.filter((r) => r.id !== id);
    await persistCentersData(updated);
    setRegions(updated);
    setSuccessMsg('Region deleted'); setTimeout(() => setSuccessMsg(''), 3000);
  };

  const togglePublic = async (id) => {
    const updated = regions.map((r) => r.id === id ? { ...r, public: r.public !== false ? false : true } : r);
    await persistCentersData(updated);
    setRegions(updated);
  };

  const handleExport = async () => {
    await exportAllData();
    setSuccessMsg('Data exported as JSON files');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleImport = async (file) => {
    try {
      await importJSONFile(file);
      const data = await getCentersData();
      setRegions(data);
      setSuccessMsg(`Imported ${file.name}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Import failed');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Regions', value: regions.length, color: 'blue' },
          { label: 'Centers', value: totalCenters, color: 'red' },
          { label: 'Programs', value: totalPrograms, color: 'amber' },
          { label: 'Public', value: regions.filter((r) => r.public !== false).length, color: 'emerald' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-${s.color}-50 border border-${s.color}-200 flex items-center justify-center`}>
              <MapPin className={`w-5 h-5 text-${s.color}-600`} />
            </div>
            <div><p className="text-xl font-black text-uew-navy">{s.value}</p><p className="text-[11px] text-slate-500 font-semibold">{s.label}</p></div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {successMsg && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold"><CheckCircle2 className="w-4 h-4" />{successMsg}</motion.div>}
        {errorMsg && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold"><AlertCircle className="w-4 h-4" />{errorMsg}</motion.div>}
      </AnimatePresence>

      <div className="flex flex-wrap gap-2 justify-between items-center">
        <button onClick={() => setAddMode(!addMode)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-uew-red hover:bg-uew-redHover text-white text-xs font-bold shadow-sm cursor-pointer">
          <Plus className="w-3.5 h-3.5" />Add Region
        </button>
        <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto mt-1 sm:mt-0">
          <button onClick={handleExport} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-bold hover:bg-slate-50 cursor-pointer"><Download className="w-3 h-3" /><span className="hidden xs:inline">Export</span></button>
          <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-bold hover:bg-slate-50 cursor-pointer"><Upload className="w-3 h-3" /><span className="hidden xs:inline">Import</span></button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={(e) => { if (e.target.files[0]) { handleImport(e.target.files[0]); e.target.value = ''; } }} />
          <button onClick={resetAll} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-red-200 text-red-600 text-[10px] sm:text-xs font-bold hover:bg-red-50 cursor-pointer"><span>Reset</span></button>
        </div>
      </div>

      {/* Add Region Form */}
      <AnimatePresence>
        {addMode && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white rounded-2xl border border-slate-200 p-5 overflow-hidden">
            <h3 className="text-sm font-black text-uew-navy mb-4">New Region</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {['id', 'name', 'shortName', 'capital', 'code', 'description'].map((f) => (
                <div key={f}>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{f}</label>
                  <input type="text" value={addForm[f]} onChange={(e) => ua(f, e.target.value)} placeholder={f}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-uew-red/20 focus:border-uew-red bg-slate-50" />
                </div>
              ))}
              <div className="flex items-center gap-3 pt-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={addForm.public !== false} onChange={(e) => ua('public', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-uew-red" />
                  <span className="text-xs font-bold text-slate-700">{addForm.public !== false ? <><Eye className="w-3.5 h-3.5 inline text-uew-red" /> Public</> : <><EyeOff className="w-3.5 h-3.5 inline" /> Draft</>}</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setAddMode(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer">Cancel</button>
              <button onClick={handleAdd} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-uew-red text-white text-xs font-bold hover:bg-uew-redHover cursor-pointer"><CheckCircle2 className="w-3.5 h-3.5" />Save</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Regions list */}
      <div className="space-y-3">
        {regions.map((region) => (
          <div key={region.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                <span className="text-xs font-black text-uew-red">{region.code}</span>
              </div>
              <div className="flex-1 min-w-0">
                {editingId === region.id ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {['id', 'name'].map((f) => (
                        <input key={f} type="text" value={editForm[f]} onChange={(e) => uf(f, e.target.value)} className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-uew-red" />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="px-3 py-1 rounded-lg bg-uew-red text-white text-xs font-bold cursor-pointer">Save</button>
                      <button onClick={cancelEdit} className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-uew-navy">{region.name}</span>
                      {!region.public && <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-slate-100 text-slate-500 uppercase">Draft</span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{region.capital} · {region.programs.length} programs · {region.centers.length} centers</p>
                  </>
                )}
              </div>
              {editingId !== region.id && (
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => startEdit(region)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-uew-navy cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => togglePublic(region.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-uew-navy cursor-pointer">
                    {region.public !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => deleteRegion(region.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-uew-red cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
