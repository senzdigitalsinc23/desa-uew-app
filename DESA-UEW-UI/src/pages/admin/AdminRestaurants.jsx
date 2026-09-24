import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pencil, Trash2, CheckCircle2, AlertCircle,
  Download, RefreshCw, Utensils, ChevronDown, ChevronRight, Upload,
} from 'lucide-react';
import {
  getCentersData, persistCentersData, downloadJSON, resetAll,
  exportAllData, importJSONFile,
} from '../../data/persistence';

export default function AdminRestaurants() {
  const [regions, setRegions] = useState([]);
  const [editingKey, setEditingKey] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [openGroup, setOpenGroup] = useState(null);
  const fileInputRef = React.useRef(null);

  const allRestaurants = regions.flatMap((r) =>
    r.centers.flatMap((c) =>
      (c.nearbyRestaurants || []).map((rest, idx) => ({ ...rest, regionId: r.id, regionName: r.name, centerId: c.id, centerName: c.name, idx }))
    )
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

  const persist = async (d) => { await persistCentersData(d); setRegions(d); };

  const startEdit = (rid, cid, idx) => {
    const region = regions.find((r) => r.id === rid);
    const center = region?.centers.find((c) => c.id === cid);
    if (!center?.nearbyRestaurants?.[idx]) return;
    setEditingKey({ rid, cid, idx }); setEditForm({ ...center.nearbyRestaurants[idx] });
  };
  const saveEdit = async () => {
    const { rid, cid, idx } = editingKey;
    const updated = regions.map((r) => r.id === rid ? { ...r, centers: r.centers.map((c) => c.id === cid ? { ...c, nearbyRestaurants: (c.nearbyRestaurants || []).map((h, i) => i === idx ? editForm : h) } : c) } : r);
    await persist(updated); setEditingKey(null); setSuccessMsg('Saved'); setTimeout(() => setSuccessMsg(''), 3000);
  };
  const deleteRestaurant = async (rid, cid, idx) => {
    if (!confirm('Delete this restaurant?')) return;
    const updated = regions.map((r) => r.id === rid ? { ...r, centers: r.centers.map((c) => c.id === cid ? { ...c, nearbyRestaurants: (c.nearbyRestaurants || []).filter((_, i) => i !== idx) } : c) } : r);
    await persist(updated); setSuccessMsg('Deleted'); setTimeout(() => setSuccessMsg(''), 3000);
  };

  const grouped = regions.map((r) => ({
    id: r.id, name: r.name, code: r.code,
    centers: r.centers.map((c) => ({
      id: c.id, name: c.name,
      restaurants: (c.nearbyRestaurants || []).map((h, idx) => ({ ...h, centerId: c.id, centerName: c.name, idx }))
    }))
  })).filter((g) => g.centers.some((c) => c.restaurants.length > 0));

  const handleExport = async () => { await exportAllData(); setSuccessMsg('Data exported'); setTimeout(() => setSuccessMsg(''), 3000); };
  const handleImport = async (file) => {
    try { await importJSONFile(file); const data = await getCentersData(); setRegions(data); setSuccessMsg(`Imported ${file.name}`); setTimeout(() => setSuccessMsg(''), 3000); }
    catch (err) { setErrorMsg(err.message || 'Import failed'); setTimeout(() => setErrorMsg(''), 3000); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 font-semibold">Manage nearby restaurants for all study centers.</p>
        <div className="flex gap-2">
          <button onClick={handleExport} className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"><Download className="w-3.5 h-3.5" />Export</button>
          <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"><Upload className="w-3.5 h-3.5" />Import</button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={(e) => { if (e.target.files[0]) { handleImport(e.target.files[0]); e.target.value = ''; } }} />
          <button onClick={resetAll} className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 cursor-pointer">Reset</button>
        </div>
      </div>

      <AnimatePresence>
        {successMsg && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold"><CheckCircle2 className="w-4 h-4" />{successMsg}</motion.div>}
        {errorMsg && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold"><AlertCircle className="w-4 h-4" />{errorMsg}</motion.div>}
      </AnimatePresence>

      <div className="space-y-3">
        {grouped.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <p className="text-sm text-slate-500 font-semibold">No restaurants added yet. Add them via the Centers page.</p>
          </div>
        ) : grouped.map((region) => (
          <div key={region.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <button onClick={() => setOpenGroup(openGroup === region.id ? null : region.id)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors cursor-pointer">
              <span className="text-slate-400 transition-transform duration-200">
                {openGroup === region.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </span>
              <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
                <Utensils className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-black text-uew-navy">{region.name}</span>
                <p className="text-xs text-slate-500 mt-0.5">{region.centers.reduce((s, c) => s + c.restaurants.length, 0)} eateries</p>
              </div>
            </button>
            <AnimatePresence>
              {openGroup === region.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="px-5 pb-4 space-y-2">
                    {region.centers.flatMap((center) =>
                      center.restaurants.map((restaurant, i) => {
                        const isEditing = editingKey?.rid === region.id && editingKey?.cid === center.id && editingKey?.idx === restaurant.idx;
                        return (
                          <div key={i} className={`p-3 rounded-xl border ${isEditing ? 'border-uew-red bg-red-50' : 'border-slate-100 bg-slate-50'}`}>
                            {isEditing ? (
                              <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                  {['name', 'specialty', 'distance', 'openHours'].map((f) => (
                                    <input key={f} type="text" value={editForm[f] || ''} onChange={(e) => setEditForm((form) => ({ ...form, [f]: e.target.value }))} className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-uew-red" />
                                  ))}
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <button onClick={() => setEditingKey(null)} className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer">Cancel</button>
                                  <button onClick={saveEdit} className="px-3 py-1 rounded-lg bg-uew-red text-white text-xs font-bold cursor-pointer">Save</button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-bold text-uew-navy">{restaurant.name}</p>
                                  <p className="text-[10px] text-slate-500">{restaurant.specialty} · {restaurant.distance}</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">at {restaurant.centerName}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button onClick={() => startEdit(region.id, center.id, restaurant.idx)} className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-uew-navy cursor-pointer"><Pencil className="w-3 h-3" /></button>
                                  <button onClick={() => deleteRestaurant(region.id, center.id, restaurant.idx)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-uew-red cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
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
