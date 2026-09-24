import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pencil, Trash2, Save, CheckCircle2, AlertCircle,
  GraduationCap, Download, RefreshCw, Eye, EyeOff,
  MapPin, X, Layers, Plus, Upload,
} from 'lucide-react';
import {
  getCentersData, persistCentersData, downloadJSON, resetAll,
  exportAllData, importJSONFile,
} from '../../data/persistence';

const ALL_CENTER_IDS = '___ALL___';

export default function AdminPrograms() {
  const [regions, setRegions] = useState([]);
  const [editingKey, setEditingKey] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ id: '', title: '', department: '', level: '', centerIds: [], public: true });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = React.useRef(null);

  const allPrograms = regions.flatMap((r) => r.programs.map((p) => ({ ...p, regionId: r.id, regionName: r.name })));
  const totalCenters = regions.reduce((s, r) => s + r.centers.length, 0);
  const allCenters = regions.flatMap((r) =>
    r.centers.map((c) => ({ id: c.id, name: c.name, city: c.city, regionId: r.id, regionName: r.name, regionCode: r.code }))
  );

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

  const startEdit = (rid, pid) => {
    const prog = regions.find((r) => r.id === rid)?.programs.find((p) => p.id === pid);
    if (!prog) return;
    setEditingKey(`${rid}-${pid}`); setEditForm({ ...prog });
  };

  const saveEdit = async () => {
    const [rid, pid] = editingKey.split('-');
    const updated = regions.map((r) => r.id === rid ? { ...r, programs: r.programs.map((p) => p.id === pid ? editForm : p) } : r);
    await persistCentersData(updated);
    setRegions(updated); setEditingKey(null);
    setSuccessMsg('Program saved'); setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAdd = async () => {
    if (!addForm.id.trim() || !addForm.title.trim()) { setErrorMsg('ID and Title required'); return; }
    const centerIds = addForm.centerIds.includes(ALL_CENTER_IDS) ? allCenters.map((c) => c.id) : addForm.centerIds;
    const newProg = { ...addForm, centerIds };
    const updated = regions.map((r) => r.id === addForm.regionId ? { ...r, programs: [...r.programs, newProg] } : r);
    await persistCentersData(updated);
    setRegions(updated); setShowAdd(false); setAddForm({ id: '', title: '', department: '', level: '', centerIds: [], regionId: '', public: true });
    setSuccessMsg('Program added'); setTimeout(() => setSuccessMsg(''), 3000); setErrorMsg('');
  };

  const deleteProgram = async (rid, pid) => {
    if (!confirm('Delete this program?')) return;
    const updated = regions.map((r) => r.id === rid ? { ...r, programs: r.programs.filter((p) => p.id !== pid) } : r);
    await persistCentersData(updated);
    setRegions(updated);
    setSuccessMsg('Program deleted'); setTimeout(() => setSuccessMsg(''), 3000);
  };

  const togglePublic = async (rid, pid) => {
    const updated = regions.map((r) => r.id === rid ? { ...r, programs: r.programs.map((p) => p.id === pid ? { ...p, public: p.public !== false ? false : true } : p) } : r);
    await persistCentersData(updated);
    setRegions(updated);
  };

  const uf = (f, v) => setEditForm((x) => ({ ...x, [f]: v }));
  const ua = (f, v) => setAddForm((x) => ({ ...x, [f]: v }));

  const toggleCenter = (centerId) => {
    setAddForm((f) => {
      const ids = f.centerIds;
      if (ids.includes(centerId)) return { ...f, centerIds: ids.filter((c) => c !== centerId) };
      return { ...f, centerIds: [...ids, centerId] };
    });
  };

  const selectAll = () => setAddForm((f) => ({ ...f, centerIds: allCenters.map((c) => c.id) }));
  const deselectAll = () => setAddForm((f) => ({ ...f, centerIds: [] }));

  const handleExport = async () => { await exportAllData(); setSuccessMsg('Data exported'); setTimeout(() => setSuccessMsg(''), 3000); };
  const handleImport = async (file) => {
    try { await importJSONFile(file); const data = await getCentersData(); setRegions(data); setSuccessMsg(`Imported ${file.name}`); setTimeout(() => setSuccessMsg(''), 3000); }
    catch (err) { setErrorMsg(err.message || 'Import failed'); setTimeout(() => setErrorMsg(''), 3000); }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Programs', value: allPrograms.length, color: 'blue' },
          { label: 'Public', value: allPrograms.filter((p) => p.public !== false).length, color: 'emerald' },
          { label: 'Centers', value: totalCenters, color: 'red' },
          { label: 'Regions', value: regions.length, color: 'amber' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-${s.color}-50 border border-${s.color}-200 flex items-center justify-center`}>
              <GraduationCap className={`w-5 h-5 text-${s.color}-600`} />
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
        <button onClick={() => setShowAdd(!showAdd)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-uew-red hover:bg-uew-redHover text-white text-xs font-bold shadow-sm cursor-pointer">
          <Plus className="w-3.5 h-3.5" />Add Program
        </button>
        <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto mt-1 sm:mt-0">
          <button onClick={handleExport} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-bold hover:bg-slate-50 cursor-pointer"><Download className="w-3 h-3" /><span className="hidden xs:inline">Export</span></button>
          <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-bold hover:bg-slate-50 cursor-pointer"><Upload className="w-3 h-3" /><span className="hidden xs:inline">Import</span></button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={(e) => { if (e.target.files[0]) { handleImport(e.target.files[0]); e.target.value = ''; } }} />
          <button onClick={resetAll} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-red-200 text-red-600 text-[10px] sm:text-xs font-bold hover:bg-red-50 cursor-pointer"><span>Reset</span></button>
        </div>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-uew-navy to-[#1E2F4D] text-white flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black">Add New Program</h3>
              <p className="text-[11px] text-slate-300 mt-0.5">Assign study centers — check "All centers" to make it available nationwide</p>
            </div>
            <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Region *</label>
                <select value={addForm.regionId} onChange={(e) => ua('regionId', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-uew-red/20 bg-slate-50">
                  <option value="">Select region...</option>
                  {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              {['id', 'title', 'department', 'level'].map((f) => (
                <div key={f}>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{f}</label>
                  <input type="text" value={addForm[f]} onChange={(e) => ua(f, e.target.value)} placeholder={f} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-uew-red/20 bg-slate-50" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={addForm.public !== false} onChange={(e) => ua('public', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-uew-red" />
                <span className="text-xs font-bold text-slate-700">{addForm.public !== false ? <><Eye className="w-3.5 h-3.5 inline text-uew-red" /> Public</> : <><EyeOff className="w-3.5 h-3.5 inline" /> Draft</>}</span>
              </label>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer">Cancel</button>
              <button onClick={handleAdd} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-uew-red text-white text-xs font-bold hover:bg-uew-redHover cursor-pointer"><CheckCircle2 className="w-3.5 h-3.5" />Save</button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        {regions.map((region) =>
          region.programs.map((prog) => (
            <div key={prog.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-uew-navy text-sm">{prog.title}</span>
                    {!prog.public && <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-slate-100 text-slate-500 uppercase">Draft</span>}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{prog.department} · {prog.level} · {region.name}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => startEdit(region.id, prog.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-uew-navy cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => togglePublic(region.id, prog.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-uew-navy cursor-pointer">
                    {prog.public !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => deleteProgram(region.id, prog.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-uew-red cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {editingKey === `${region.id}-${prog.id}` && (
                <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {['title', 'department', 'level'].map((f) => (
                      <input key={f} type="text" value={editForm[f]} onChange={(e) => uf(f, e.target.value)} className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-uew-red" />
                    ))}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingKey(null)} className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer">Cancel</button>
                    <button onClick={saveEdit} className="px-3 py-1 rounded-lg bg-uew-red text-white text-xs font-bold cursor-pointer"><Save className="w-3 h-3 inline" />Save</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
