import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, Save, CheckCircle2, AlertCircle,
  MapPin, Building2, Download, RefreshCw, Eye, EyeOff, User,
  Hotel, Activity, Utensils, X, ChevronDown, ChevronUp, ChevronRight,
  Upload,
} from 'lucide-react';
import {
  getCentersData, persistCentersData, downloadJSON, resetAll,
  exportAllData, importJSONFile,
} from '../../data/persistence';

const EMPTY_CENTER = { id: '', name: '', premises: '', city: '', landmark: '', schedule: '', public: true,
  coordinator: { name: '', title: 'Study Center Coordinator', phone: '', email: '', office: '', hours: '' },
  nearbyHotels: [], nearbyHealth: [], nearbyRestaurants: [],
};
const EMPTY_HOTEL = { name: '', distance: '', rate: '', phone: '', rating: '' };
const EMPTY_HEALTH = { name: '', type: '', distance: '', phone: '' };
const EMPTY_REST = { name: '', specialty: '', distance: '', openHours: '' };

export default function AdminCenters() {
  const [regions, setRegions] = useState([]);
  const [openRegion, setOpenRegion] = useState(null);
  const [openCenter, setOpenCenter] = useState(null);
  const [editingKey, setEditingKey] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ ...EMPTY_CENTER });
  const [amenityModal, setAmenityModal] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  // Load data on mount and on every data change
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

  const persist = async (data) => {
    await persistCentersData(data);
    setRegions(data);
  };

  const allCenters = regions.flatMap((r) => r.centers.map((c) => ({ ...c, regionId: r.id, regionName: r.name })));
  const totalPrograms = regions.reduce((s, r) => s + (r.programs?.length || 0), 0);

  const startEdit = (rid, cid) => {
    const center = regions.find((r) => r.id === rid)?.centers.find((c) => c.id === cid);
    if (!center) return;
    setEditingKey(`${rid}-${cid}`); setEditForm({ ...center, regionId: rid });
  };
  const saveEdit = async () => {
    const [rid, cid] = editingKey.split('-');
    const updated = regions.map((r) => r.id === rid ? { ...r, centers: r.centers.map((c) => c.id === cid ? editForm : c) } : r);
    await persist(updated); setEditingKey(null); setSuccessMsg('Center saved'); setTimeout(() => setSuccessMsg(''), 3000);
  };
  const handleAdd = async () => {
    if (!addForm.regionId || !addForm.id || !addForm.name) { setErrorMsg('Region, ID and Name required'); return; }
    const updated = regions.map((r) => r.id === addForm.regionId ? { ...r, centers: [...r.centers, { ...addForm, coordinator: addForm.coordinator }] } : r);
    await persist(updated); setShowAddModal(false); setAddForm({ ...EMPTY_CENTER });
    setSuccessMsg('Center added'); setTimeout(() => setSuccessMsg(''), 3000); setErrorMsg('');
  };
  const deleteCenter = async (rid, cid) => {
    if (!confirm('Delete this center and all amenities?')) return;
    const updated = regions.map((r) => r.id === rid ? { ...r, centers: r.centers.filter((c) => c.id !== cid) } : r);
    await persist(updated); setSuccessMsg('Center deleted'); setTimeout(() => setSuccessMsg(''), 3000);
  };
  const togglePublic = async (rid, cid) => {
    const updated = regions.map((r) => r.id === rid ? { ...r, centers: r.centers.map((c) => c.id === cid ? { ...c, public: c.public !== false ? false : true } : c) } : r);
    await persist(updated);
  };
  const uf = (f, v) => setEditForm((x) => ({ ...x, [f]: v }));
  const uc = (f, v) => setEditForm((x) => ({ ...x, coordinator: { ...x.coordinator, [f]: v } }));
  const ua = (f, v) => setAddForm((x) => ({ ...x, [f]: v }));
  const uac = (f, v) => setAddForm((x) => ({ ...x, coordinator: { ...x.coordinator, [f]: v } }));

  // Amenity handlers
  const saveAmenity = async () => {
    const { type, regionId, centerId, idx } = amenityModal;
    const key = `nearby${type.charAt(0).toUpperCase() + type.slice(1)}`;
    const updated = regions.map((r) =>
      r.id === regionId ? { ...r, centers: r.centers.map((c) =>
        c.id === centerId ? { ...c, [key]: (c[key] || []).map((item, i) => i === idx ? amenityModal.form : item) } : c
      ) } : r
    );
    await persist(updated); setAmenityModal(null); setSuccessMsg('Saved'); setTimeout(() => setSuccessMsg(''), 2000);
  };
  const addAmenity = async () => {
    const { type, regionId, centerId, form } = amenityModal;
    const key = `nearby${type.charAt(0).toUpperCase() + type.slice(1)}`;
    const updated = regions.map((r) =>
      r.id === regionId ? { ...r, centers: r.centers.map((c) =>
        c.id === centerId ? { ...c, [key]: [...(c[key] || []), form] } : c
      ) } : r
    );
    await persist(updated); setAmenityModal(null); setSuccessMsg('Added'); setTimeout(() => setSuccessMsg(''), 2000);
  };
  const deleteAmenity = async (rid, cid, type, idx) => {
    const key = `nearby${type.charAt(0).toUpperCase() + type.slice(1)}`;
    const updated = regions.map((r) =>
      r.id === rid ? { ...r, centers: r.centers.map((c) =>
        c.id === cid ? { ...c, [key]: (c[key] || []).filter((_, i) => i !== idx) } : c
      ) } : r
    );
    await persist(updated); setSuccessMsg('Deleted'); setTimeout(() => setSuccessMsg(''), 2000);
  };

  const handleExport = async () => { await exportAllData(); setSuccessMsg('Data exported'); setTimeout(() => setSuccessMsg(''), 3000); };
  const handleImport = async (file) => {
    try { await importJSONFile(file); const data = await getCentersData(); setRegions(data); setSuccessMsg(`Imported ${file.name}`); setTimeout(() => setSuccessMsg(''), 3000); }
    catch (err) { setErrorMsg(err.message || 'Import failed'); setTimeout(() => setErrorMsg(''), 3000); }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        {[
          { label: 'Centers', value: allCenters.length, color: 'blue' },
          { label: 'Public', value: allCenters.filter((c) => c.public !== false).length, color: 'emerald' },
          { label: 'Programs', value: totalPrograms, color: 'amber' },
          { label: 'Regions', value: regions.length, color: 'red' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-${s.color}-50 border border-${s.color}-200 flex items-center justify-center`}>
              <Building2 className={`w-5 h-5 text-${s.color}-600`} />
            </div>
            <div><p className="text-xl font-black text-uew-navy">{s.value}</p><p className="text-[11px] text-slate-500 font-semibold">{s.label}</p></div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {successMsg && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold"><CheckCircle2 className="w-4 h-4" />{successMsg}</motion.div>}
        {errorMsg && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold"><AlertCircle className="w-4 h-4" />{errorMsg}</motion.div>}
      </AnimatePresence>

      {/* Action bar */}
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-uew-red text-white text-xs font-bold hover:bg-uew-redHover transition-colors cursor-pointer">
          <Plus className="w-3.5 h-3.5" />Add Center
        </button>
        <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto mt-1 sm:mt-0">
          <button onClick={handleExport} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-bold hover:bg-slate-50 cursor-pointer"><Download className="w-3 h-3" /><span className="hidden xs:inline">Export</span></button>
          <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-bold hover:bg-slate-50 cursor-pointer"><Upload className="w-3 h-3" /><span className="hidden xs:inline">Import</span></button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={(e) => { if (e.target.files[0]) { handleImport(e.target.files[0]); e.target.value = ''; } }} />
          <button onClick={resetAll} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-red-200 text-red-600 text-[10px] sm:text-xs font-bold hover:bg-red-50 cursor-pointer"><span>Reset</span></button>
        </div>
      </div>

      {/* Add Center Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-gradient-to-r from-uew-navy to-uew-blue text-white flex items-center justify-between shrink-0">
              <h3 className="text-sm font-black">Add New Study Center</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-5 overflow-y-auto flex-1">
              <div className="mb-4">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Region *</label>
                <select value={addForm.regionId} onChange={(e) => ua('regionId', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-uew-red/20 focus:border-uew-red bg-slate-50">
                  <option value="">Select a region...</option>
                  {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {['id', 'name', 'premises', 'city', 'landmark', 'schedule'].map((f) => (
                  <div key={f}>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{f}</label>
                    <input type="text" value={addForm[f]} onChange={(e) => ua(f, e.target.value)} placeholder={f}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-uew-red/20 focus:border-uew-red bg-slate-50" />
                  </div>
                ))}
              </div>
              <div className="mb-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Coordinator</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {['name', 'phone', 'email', 'office', 'hours'].map((f) => (
                    <input key={f} type="text" value={addForm.coordinator[f] || ''} onChange={(e) => uac(f, e.target.value)} placeholder={f}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-uew-red/20 focus:border-uew-red bg-white" />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={addForm.public !== false} onChange={(e) => ua('public', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-uew-red" />
                  <span className="text-xs font-bold text-slate-700">{addForm.public !== false ? <><Eye className="w-3.5 h-3.5 inline text-uew-red" /> Public</> : <><EyeOff className="w-3.5 h-3.5 inline" /> Draft</>}</span>
                </label>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 shrink-0">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer">Cancel</button>
              <button onClick={handleAdd} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-uew-red text-white text-xs font-bold hover:bg-uew-redHover cursor-pointer"><CheckCircle2 className="w-3.5 h-3.5" />Save Center</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Regions → Centers collapsible tree */}
      <div className="space-y-3">
        {regions.map((region) => (
          <div key={region.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Region header */}
            <button onClick={() => setOpenRegion(openRegion === region.id ? null : region.id)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors cursor-pointer">
              <span className="text-slate-400 transition-transform duration-200 shrink-0">
                {openRegion === region.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </span>
              <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                <span className="text-xs font-black text-uew-red">{region.code}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-uew-navy">{region.name}</span>
                  {!region.public && <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-slate-100 text-slate-500 uppercase">Draft</span>}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{region.capital} · {(region.programs?.length || 0)} programs · {(region.centers?.length || 0)} centers</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={(e) => { e.stopPropagation(); togglePublic(region.id); }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-uew-navy transition-colors cursor-pointer">
                  {region.public !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); if (!confirm('Delete entire region?')) return; persist(regions.filter((r) => r.id !== region.id)); }}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-uew-red transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </button>

            {/* Centers list */}
            <AnimatePresence>
              {openRegion === region.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="px-5 pb-4 space-y-2">
                    {(region.centers || []).map((center) => (
                      <div key={center.id} className="border border-slate-100 rounded-xl p-3 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-uew-navy">{center.name}</p>
                            <p className="text-[10px] text-slate-500">{center.city} · {(center.schedule || 'TBA')}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => startEdit(region.id, center.id)} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-uew-navy cursor-pointer"><Pencil className="w-3 h-3" /></button>
                            <button onClick={() => togglePublic(region.id, center.id)} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-uew-navy cursor-pointer">
                              {center.public !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            </button>
                            <button onClick={() => deleteCenter(region.id, center.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-uew-red cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </div>
                        {/* Inline edit */}
                        {editingKey === `${region.id}-${center.id}` && (
                          <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              {['name', 'city', 'landmark', 'schedule'].map((f) => (
                                <input key={f} type="text" value={editForm[f] || ''} onChange={(e) => uf(f, e.target.value)} className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-uew-red" />
                              ))}
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => setEditingKey(null)} className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer">Cancel</button>
                              <button onClick={saveEdit} className="px-3 py-1 rounded-lg bg-uew-red text-white text-xs font-bold cursor-pointer"><Save className="w-3 h-3 inline" />Save</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
