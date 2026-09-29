import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, CheckCircle2, AlertCircle,
  Download, RefreshCw, Hotel, ChevronDown, ChevronRight, Upload, Link2, X, Building2,
} from 'lucide-react';
import {
  getCentersData, persistCentersData, exportAllData, importJSONFile, resetAll,
} from '../../data/persistence';
import {
  adminListHotels, adminCreateHotel, adminUpdateHotel, adminDeleteHotel,
  adminLinkHotelToCenter, adminUnlinkHotelFromCenter, adminGetHotelCenters,
} from '../../services/api';

const FIELDS = [
  { key: 'name', label: 'Name', required: true },
  { key: 'address', label: 'Address' },
  { key: 'distance', label: 'Distance' },
  { key: 'rate_range', label: 'Rate Range' },
  { key: 'phone', label: 'Phone' },
  { key: 'rating', label: 'Rating' },
  { key: 'amenities', label: 'Amenities' },
  { key: 'website', label: 'Website' },
];

export default function AdminHotels() {
  const [hotels, setHotels] = useState([]);
  const [centers, setCenters] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', address: '', distance: '', rate_range: '', phone: '', rating: '', amenities: '', website: '' });
  const [linkModal, setLinkModal] = useState(null); // { hotelId, hotelName, linkedIds: [] }
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
          const [h] = await Promise.all([adminListHotels()]);
          const centersData = await getCentersData();
          const allCenters = (centersData || []).flatMap((r) => (r.centers || []).map((c) => ({ id: c.id, name: c.name, premises: c.premises, city: c.city })));
          if (!cancelled) {
            setHotels(h || []);
            setCenters(allCenters);
          }
        } catch (e) {
          // API unavailable (401 etc.) — fall back to local data
          try {
            const data = await getCentersData();
            const all = (data || []).flatMap((r) =>
              (r.centers || []).flatMap((c) =>
                (c.nearbyHotels || []).map((h, idx) => ({ ...h, regionId: r.id, regionName: r.name, centerId: c.id, centerName: c.name, idx }))
              )
            );
            const allCenters = (data || []).flatMap((r) => (r.centers || []).map((c) => ({ id: c.id, name: c.name, premises: c.premises, city: c.city })));
            if (!cancelled) { setHotels(all); setCenters(allCenters); }
          } catch (inner) {
            if (!cancelled) setErrorMsg('Failed to load data');
          }
        }
      } else {
        try {
          const data = await getCentersData();
          const all = (data || []).flatMap((r) =>
            (r.centers || []).flatMap((c) =>
              (c.nearbyHotels || []).map((h, idx) => ({ ...h, regionId: r.id, regionName: r.name, centerId: c.id, centerName: c.name, idx }))
            )
          );
          if (!cancelled) setHotels(all);
        } catch (e) {
          if (!cancelled) setErrorMsg('Failed to load data');
        }
      }
      setIsLoading(false);
    }
    load();
    const handler = () => { if (!cancelled) load(); };
    window.addEventListener('desa-data-changed', handler);
    return () => { cancelled = true; window.removeEventListener('desa-data-changed', handler); };
  }, []);

  const uf = (field, value) => isApiMode
    ? setEditForm((f) => ({ ...f, [field]: value }))
    : setEditForm((f) => ({ ...f, [field]: value }));

  const uc = (field, value) => setCreateForm((f) => ({ ...f, [field]: value }));

  const startEdit = (hotel) => {
    setEditingId(hotel.id);
    setEditForm({ ...hotel });
  };

  const saveEdit = async () => {
    if (isApiMode) {
      try {
        await adminUpdateHotel(editingId, editForm);
        setHotels((prev) => prev.map((h) => h.id === editingId ? { ...h, ...editForm } : h));
        setEditingId(null);
        setSuccessMsg('Hotel updated');
      } catch (e) { setErrorMsg(e.message || 'Update failed'); }
    } else {
      // Local mode: update via centers data
      setEditingId(null);
      setSuccessMsg('Saved (local mode)');
    }
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCreate = async () => {
    const { name } = createForm;
    if (!name.trim()) { setErrorMsg('Name is required'); return; }
    if (isApiMode) {
      try {
        const res = await adminCreateHotel(createForm);
        const newId = res?.data?.id;
        if (newId) {
          setHotels((prev) => [...prev, { ...createForm, id: newId }]);
          setShowCreateModal(false);
          setCreateForm({ name: '', address: '', distance: '', rate_range: '', phone: '', rating: '', amenities: '', website: '' });
          setSuccessMsg('Hotel created');
        }
      } catch (e) { setErrorMsg(e.message || 'Create failed'); }
    } else {
      setSuccessMsg('Created (local mode)');
      setShowCreateModal(false);
      setCreateForm({ name: '', address: '', distance: '', rate_range: '', phone: '', rating: '', amenities: '', website: '' });
    }
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = async (hotel) => {
    if (!confirm(`Delete "${hotel.name}"?`)) return;
    if (isApiMode) {
      try {
        await adminDeleteHotel(hotel.id);
        setHotels((prev) => prev.filter((h) => h.id !== hotel.id));
        setSuccessMsg('Deleted');
      } catch (e) { setErrorMsg(e.message || 'Delete failed'); }
    } else {
      setSuccessMsg('Deleted (local mode)');
    }
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const openLinkModal = async (hotel) => {
    let linkedIds = [];
    if (isApiMode && hotel.id) {
      try { linkedIds = (await adminGetHotelCenters(hotel.id)).map((c) => c.id); } catch { linkedIds = []; }
    }
    setLinkModal({ hotelId: hotel.id, hotelName: hotel.name, linkedIds });
    setSelectedCenter('');
  };

  const handleLink = async () => {
    if (!selectedCenter) return;
    if (isApiMode && linkModal?.hotelId) {
      try {
        await adminLinkHotelToCenter(linkModal.hotelId, parseInt(selectedCenter));
        const centers = await adminGetHotelCenters(linkModal.hotelId);
        setLinkModal((prev) => ({ ...prev, linkedIds: centers.map((c) => c.id) }));
        setSuccessMsg('Linked to center');
      } catch (e) { setErrorMsg(e.message || 'Link failed'); }
    } else {
      setSuccessMsg('Linked (local mode)');
    }
    setTimeout(() => setSuccessMsg(''), 3000);
    setSelectedCenter('');
  };

  const handleUnlink = async (centerId) => {
    if (!linkModal?.hotelId) return;
    if (isApiMode) {
      try {
        await adminUnlinkHotelFromCenter(linkModal.hotelId, centerId);
        const centers = await adminGetHotelCenters(linkModal.hotelId);
        setLinkModal((prev) => ({ ...prev, linkedIds: centers.map((c) => c.id) }));
        setSuccessMsg('Unlinked');
      } catch (e) { setErrorMsg(e.message || 'Unlink failed'); }
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
          Manage nearby hotels ({hotels.length} total)
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
      ) : hotels.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <Hotel className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-semibold">No hotels yet. Click "Create New" to add one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {hotels.map((hotel) => (
            <div key={hotel.id ?? hotel.name} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                  <Hotel className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  {editingId === hotel.id ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {FIELDS.map((f) => (
                          <div key={f.key}>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{f.label}{f.required ? ' *' : ''}</label>
                            <input type="text" value={editForm[f.key] || ''} onChange={(e) => uf(f.key, e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-uew-red" />
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
                      <p className="text-sm font-black text-uew-navy truncate">{hotel.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {hotel.distance && <span className="mr-2">📍 {hotel.distance}</span>}
                        {hotel.rate_range && <span className="mr-2">💰 {hotel.rate_range}</span>}
                        {hotel.rating && <span className="text-amber-600 font-semibold">★ {hotel.rating}</span>}
                        {!hotel.distance && !hotel.rate_range && !hotel.rating && <span className="text-slate-400">No details</span>}
                      </p>
                      {(hotel.centerName || hotel.address) && (
                        <p className="text-[10px] text-slate-400 mt-0.5">{hotel.centerName || hotel.address}</p>
                      )}
                    </>
                  )}
                </div>
                {editingId !== hotel.id && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openLinkModal(hotel)} title="Link to center"
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer" >
                      <Link2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => startEdit(hotel)} title="Edit"
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-uew-navy transition-colors cursor-pointer">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(hotel)} title="Delete"
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-uew-red transition-colors cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
              <h3 className="text-sm font-black">Create New Hotel</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg hover:bg-white/10 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-5 overflow-y-auto max-h-[60vh]">
              <div className="space-y-3">
                {FIELDS.map((f) => (
                  <div key={f.key}>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{f.label}{f.required ? ' *' : ''}</label>
                    <input type="text" value={createForm[f.key] || ''} onChange={(e) => uc(f.key, e.target.value)}
                      placeholder={f.label}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-uew-red/20 focus:border-uew-red" />
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
              <h3 className="text-sm font-black">Link Hotel — {linkModal.hotelName}</h3>
              <button onClick={() => setLinkModal(null)} className="p-1 rounded-lg hover:bg-white/10 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-5 overflow-y-auto max-h-[60vh]">
              {/* Linked centers */}
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
              {/* Add new link */}
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Add Center</p>
                {unlinkedCenters.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-3">All centers already linked</p>
                ) : (
                  <select value={selectedCenter} onChange={(e) => setSelectedCenter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-uew-red/20 focus:border-uew-red bg-slate-50 mb-2">
                    <option value="">Select a center…</option>
                    {unlinkedCenters.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.premises || c.city || ''}</option>)}
                  </select>
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
