import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, CheckCircle2, AlertCircle,
  Download, RefreshCw, Activity, ChevronDown, ChevronRight, Upload, Link2, X, Building2,
} from 'lucide-react';
import {
  getCentersData, persistCentersData, exportAllData, importJSONFile, resetAll,
} from '../../data/persistence';
import {
  adminListHealth, adminCreateHealth, adminUpdateHealth, adminDeleteHealth,
  adminLinkHealthToCenter, adminUnlinkHealthFromCenter, adminGetHealthCenters,
} from '../../services/api';

const FIELDS = [
  { key: 'name', label: 'Name', required: true },
  { key: 'type', label: 'Type', required: true },
  { key: 'address', label: 'Address' },
  { key: 'distance', label: 'Distance' },
  { key: 'phone', label: 'Phone' },
  { key: 'hours', label: 'Hours' },
  { key: 'services', label: 'Services' },
  { key: 'is_24_7', label: '24/7', type: 'boolean' },
];

export default function AdminHealth() {
  const [facilities, setFacilities] = useState([]);
  const [centers, setCenters] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', type: '', address: '', distance: '', phone: '', hours: '', services: '', is_24_7: false });
  const [linkModal, setLinkModal] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = React.useRef(null);
  const isApiMode = import.meta.env.VITE_DATA_SOURCE === 'api_access';

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      if (isApiMode) {
        try {
          const [h] = await Promise.all([adminListHealth()]);
          const centersData = await getCentersData();
          const allCenters = (centersData || []).flatMap((r) => (r.centers || []).map((c) => ({ id: c.id, name: c.name, premises: c.premises, city: c.city })));
          if (!cancelled) { setFacilities(h || []); setCenters(allCenters); }
        } catch (e) {
          // API unavailable (401 etc.) — fall back to local data
          try {
            const data = await getCentersData();
            const all = (data || []).flatMap((r) =>
              (r.centers || []).flatMap((c) =>
                (c.nearbyHealth || []).map((h, idx) => ({ ...h, regionId: r.id, regionName: r.name, centerId: c.id, centerName: c.name, idx }))
              )
            );
            const allCenters = (data || []).flatMap((r) => (r.centers || []).map((c) => ({ id: c.id, name: c.name, premises: c.premises, city: c.city })));
            if (!cancelled) { setFacilities(all); setCenters(allCenters); }
          } catch (inner) {
            if (!cancelled) setErrorMsg('Failed to load data');
          }
        }
      } else {
        try {
          const data = await getCentersData();
          const all = (data || []).flatMap((r) =>
            (r.centers || []).flatMap((c) =>
              (c.nearbyHealth || []).map((h, idx) => ({ ...h, regionId: r.id, regionName: r.name, centerId: c.id, centerName: c.name, idx }))
            )
          );
          if (!cancelled) setFacilities(all);
        } catch (e) { if (!cancelled) setErrorMsg('Failed to load data'); }
      }
      setIsLoading(false);
    }
    load();
    const handler = () => { if (!cancelled) load(); };
    window.addEventListener('desa-data-changed', handler);
    return () => { cancelled = true; window.removeEventListener('desa-data-changed', handler); };
  }, []);

  const uf = (field, value) => setEditForm((f) => ({ ...f, [field]: value }));
  const uc = (field, value) => setCreateForm((f) => ({ ...f, [field]: value }));

  const startEdit = (item) => { setEditingId(item.id); setEditForm({ ...item }); };

  const saveEdit = async () => {
    if (isApiMode && editingId) {
      try { await adminUpdateHealth(editingId, editForm); setFacilities((prev) => prev.map((h) => h.id === editingId ? { ...h, ...editForm } : h)); setEditingId(null); setSuccessMsg('Updated'); }
      catch (e) { setErrorMsg(e.message || 'Update failed'); }
    } else { setEditingId(null); setSuccessMsg('Saved (local mode)'); }
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCreate = async () => {
    if (!createForm.name.trim()) { setErrorMsg('Name is required'); return; }
    if (isApiMode) {
      try {
        const res = await adminCreateHealth(createForm);
        const newId = res?.data?.id;
        if (newId) { setFacilities((prev) => [...prev, { ...createForm, id: newId }]); setShowCreateModal(false); setCreateForm({ name: '', type: '', address: '', distance: '', phone: '', hours: '', services: '', is_24_7: false }); setSuccessMsg('Created'); }
      } catch (e) { setErrorMsg(e.message || 'Create failed'); }
    } else { setShowCreateModal(false); setCreateForm({ name: '', type: '', address: '', distance: '', phone: '', hours: '', services: '', is_24_7: false }); setSuccessMsg('Created (local mode)'); }
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    if (isApiMode && item.id) {
      try { await adminDeleteHealth(item.id); setFacilities((prev) => prev.filter((h) => h.id !== item.id)); setSuccessMsg('Deleted'); }
      catch (e) { setErrorMsg(e.message || 'Delete failed'); }
    } else { setSuccessMsg('Deleted (local mode)'); }
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const openLinkModal = async (item) => {
    let linkedIds = [];
    if (isApiMode && item.id) { try { linkedIds = (await adminGetHealthCenters(item.id)).map((c) => c.id); } catch { linkedIds = []; } }
    setLinkModal({ itemId: item.id, itemName: item.name, linkedIds });
    setSelectedCenter('');
  };

  const handleLink = async () => {
    if (!selectedCenter) return;
    if (isApiMode && linkModal?.itemId) {
      try { await adminLinkHealthToCenter(linkModal.itemId, parseInt(selectedCenter)); const centers = await adminGetHealthCenters(linkModal.itemId); setLinkModal((prev) => ({ ...prev, linkedIds: centers.map((c) => c.id) })); setSuccessMsg('Linked'); }
      catch (e) { setErrorMsg(e.message || 'Link failed'); }
    } else { setSuccessMsg('Linked (local mode)'); }
    setTimeout(() => setSuccessMsg(''), 3000);
    setSelectedCenter('');
  };

  const handleUnlink = async (centerId) => {
    if (!linkModal?.itemId) return;
    if (isApiMode) {
      try { await adminUnlinkHealthFromCenter(linkModal.itemId, centerId); const centers = await adminGetHealthCenters(linkModal.itemId); setLinkModal((prev) => ({ ...prev, linkedIds: centers.map((c) => c.id) })); setSuccessMsg('Unlinked'); }
      catch (e) { setErrorMsg(e.message || 'Unlink failed'); }
    }
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleExport = async () => { await exportAllData(); setSuccessMsg('Data exported'); setTimeout(() => setSuccessMsg(''), 3000); };
  const handleImport = async (file) => {
    try { await importJSONFile(file); setSuccessMsg(`Imported ${file.name}`); setTimeout(() => setSuccessMsg(''), 3000); }
    catch (err) { setErrorMsg(err.message || 'Import failed'); setTimeout(() => setErrorMsg(''), 3000); }
  };

  const unlinkedCenters = centers.filter((c) => !linkModal?.linkedIds.includes(c.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-slate-500 font-semibold">
          Manage nearby health facilities ({facilities.length} total)
          {isApiMode && <span className="text-uew-red ml-1">· API Mode</span>}
        </p>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowCreateModal(true)} className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-uew-red text-white text-xs font-bold hover:bg-red-700 cursor-pointer">
            <Plus className="w-3.5 h-3.5" />Create New
          </button>
          <button onClick={handleExport} className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"><Download className="w-3.5 h-3.5" />Export</button>
          <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"><Upload className="w-3.5 h-3.5" />Import</button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={(e) => { if (e.target.files[0]) { handleImport(e.target.files[0]); e.target.value = ''; } }} />
          <button onClick={resetAll} className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 cursor-pointer">Reset</button>
          <button onClick={() => window.location.reload()} className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"><RefreshCw className="w-3.5 h-3.5" />Refresh</button>
        </div>
      </div>

      <AnimatePresence>
        {successMsg && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold"><CheckCircle2 className="w-4 h-4" />{successMsg}</motion.div>}
        {errorMsg && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold"><AlertCircle className="w-4 h-4" />{errorMsg}</motion.div>}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex items-center justify-center py-16"><RefreshCw className="w-6 h-6 animate-spin text-uew-red" /><span className="ml-3 text-sm text-slate-500 font-semibold">Loading…</span></div>
      ) : facilities.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-semibold">No health facilities yet. Click "Create New" to add one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {facilities.map((item) => (
            <div key={item.id ?? item.name} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-uew-red" />
                </div>
                <div className="flex-1 min-w-0">
                  {editingId === item.id ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {FIELDS.map((f) => (
                          <div key={f.key}>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{f.label}{f.required ? ' *' : ''}</label>
                            {f.type === 'boolean' ? (
                              <input type="checkbox" checked={!!editForm[f.key]} onChange={(e) => uf(f.key, e.target.checked)} className="w-4 h-4 mt-1" />
                            ) : (
                              <input type="text" value={editForm[f.key] ?? ''} onChange={(e) => uf(f.key, e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-uew-red" />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer">Cancel</button>
                        <button onClick={saveEdit} className="px-3 py-1.5 rounded-lg bg-uew-red text-white text-xs font-bold cursor-pointer">Save</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-black text-uew-navy truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {item.type && <span className="px-1.5 py-0.5 rounded-md bg-red-50 text-uew-red text-[10px] font-bold mr-1">{item.type}</span>}
                        {item.distance && <span className="mr-2">📍 {item.distance}</span>}
                        {item.is_24_7 && <span className="text-uew-red font-bold">24/7</span>}
                        {!item.type && !item.distance && <span className="text-slate-400">No details</span>}
                      </p>
                      {item.centerName && <p className="text-[10px] text-slate-400 mt-0.5">{item.centerName}</p>}
                    </>
                  )}
                </div>
                {editingId !== item.id && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openLinkModal(item)} title="Link to center" className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"><Link2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => startEdit(item)} title="Edit" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-uew-navy transition-colors cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(item)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-uew-red transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-uew-navy to-uew-blue text-white flex items-center justify-between">
              <h3 className="text-sm font-black">Create New Health Facility</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg hover:bg-white/10 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-5 overflow-y-auto max-h-[60vh]">
              <div className="space-y-3">
                {FIELDS.map((f) => (
                  <div key={f.key}>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{f.label}{f.required ? ' *' : ''}</label>
                    {f.type === 'boolean' ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={!!createForm[f.key]} onChange={(e) => uc(f.key, e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-uew-red" />
                        <span className="text-sm font-medium text-slate-700">24/7 Service</span>
                      </label>
                    ) : (
                      <input type="text" value={createForm[f.key] || ''} onChange={(e) => uc(f.key, e.target.value)} placeholder={f.label}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-uew-red/20 focus:border-uew-red" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer">Cancel</button>
              <button onClick={handleCreate} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-uew-red text-white text-xs font-bold hover:bg-red-700 cursor-pointer"><Plus className="w-3.5 h-3.5" />Create</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Link Modal */}
      {linkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setLinkModal(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-uew-navy to-uew-blue text-white flex items-center justify-between">
              <h3 className="text-sm font-black">Link Facility — {linkModal.itemName}</h3>
              <button onClick={() => setLinkModal(null)} className="p-1 rounded-lg hover:bg-white/10 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-5 overflow-y-auto max-h-[60vh]">
              {linkModal.linkedIds.length > 0 && (
                <div className="mb-4">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Linked Centers</p>
                  <div className="space-y-1">
                    {centers.filter((c) => linkModal.linkedIds.includes(c.id)).map((c) => (
                      <div key={c.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
                        <span className="text-xs font-semibold text-uew-navy">{c.name}</span>
                        <button onClick={() => handleUnlink(c.id)} className="p-1 rounded hover:bg-red-100 text-slate-400 hover:text-uew-red cursor-pointer"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Add Center</p>
                {unlinkedCenters.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-3">All centers already linked</p>
                ) : (
                  <>
                    <select value={selectedCenter} onChange={(e) => setSelectedCenter(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-uew-red/20 focus:border-uew-red bg-slate-50 mb-2">
                      <option value="">Select a center…</option>
                      {unlinkedCenters.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.premises || c.city || ''}</option>)}
                    </select>
                  </>
                )}
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setLinkModal(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer">Close</button>
              <button onClick={handleLink} disabled={!selectedCenter} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-uew-red text-white text-xs font-bold hover:bg-red-700 cursor-pointer disabled:opacity-50"><Link2 className="w-3.5 h-3.5" />Link Center</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
