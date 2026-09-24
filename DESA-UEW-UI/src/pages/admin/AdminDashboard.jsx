import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  MapPin,
  GraduationCap,
  Building2,
  Hotel,
  Activity,
  Utensils,
  Users,
  TrendingUp,
  ShieldCheck,
  DownloadCloud,
  Upload,
  FileJson,
  FolderOpen,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getCentersData, getAnnouncementsData, getMockData, getHubData,
  exportAllData, resetAll,
} from '../../data/persistence';

const NAV_GROUPS = [
  {
    label: 'Center Management',
    icon: FolderOpen,
    items: [
      { label: 'Regions', path: '/admin/regions', icon: MapPin, color: 'blue' },
      { label: 'Programs', path: '/admin/programs', icon: GraduationCap, color: 'amber' },
      { label: 'Centers', path: '/admin/centers', icon: Building2, color: 'red' },
      { label: 'Hotels', path: '/admin/hotels', icon: Hotel, color: 'sky' },
      { label: 'Health Facilities', path: '/admin/health', icon: Activity, color: 'rose' },
      { label: 'Restaurants', path: '/admin/restaurants', icon: Utensils, color: 'orange' },
    ],
  },
  {
    label: 'DESA Hub',
    icon: FolderOpen,
    items: [
      { label: 'About DESA', path: '/admin/hub-about', icon: ShieldCheck, color: 'red' },
      { label: 'Leadership Tree', path: '/admin/hub-leadership', icon: Users, color: 'navy' },
      { label: 'Constitution', path: '/admin/hub-constitution', icon: FileJson, color: 'gold' },
      { label: 'Archives', path: '/admin/hub-archives', icon: FileJson, color: 'blue' },
      { label: 'Asset Register', path: '/admin/hub-assets', icon: Building2, color: 'amber' },
      { label: 'Activities', path: '/admin/hub-activities', icon: Activity, color: 'red' },
      { label: 'Committees', path: '/admin/hub-committee', icon: Users, color: 'navy' },
      { label: 'Gallery', path: '/admin/hub-gallery', icon: FileJson, color: 'gold' },
    ],
  },
];

async function computeStats() {
  const centers = await getCentersData();
  const announcements = await getAnnouncementsData();
  const mock = await getMockData();
  const hub = await getHubData();

  return {
    regions: centers?.length || 0,
    centers: centers?.reduce((s, r) => s + (r.centers?.length || 0), 0) || 0,
    programs: centers?.reduce((s, r) => s + (r.programs?.length || 0), 0) || 0,
    announcements: announcements?.announcements?.length || 0,
    hotels: centers?.reduce((s, r) => s + (r.centers || []).reduce((ss, c) => ss + (c.nearbyHotels?.length || 0), 0), 0) || 0,
    health: centers?.reduce((s, r) => s + (r.centers || []).reduce((ss, c) => ss + (c.nearbyHealth?.length || 0), 0), 0) || 0,
    restaurants: centers?.reduce((s, r) => s + (r.centers || []).reduce((ss, c) => ss + (c.nearbyRestaurants?.length || 0), 0), 0) || 0,
    hubItems: Object.keys(hub || {}).filter(k => Array.isArray(hub[k])).reduce((s, k) => s + hub[k].length, 0),
  };
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    let cancelled = false;
    computeStats().then((s) => { if (!cancelled) setStats(s); });
  }, []);

  const handleExport = () => {
    exportAllData();
    setSuccessMsg('All data exported as JSON files');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleImport = async (file) => {
    setImportLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.centers) { localStorage.setItem('desa_centers_data', JSON.stringify(data.centers)); }
      if (data.announcements) { localStorage.setItem('desa_announcements_data', JSON.stringify(data.announcements)); }
      if (data.mockData) { localStorage.setItem('desa_mock_data', JSON.stringify(data.mockData)); }
      if (data.hubData) { localStorage.setItem('desa_hub_data', JSON.stringify(data.hubData)); }
      window.dispatchEvent(new CustomEvent('desa-data-changed'));
      setSuccessMsg(`Imported ${Object.keys(data).length} data sets`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setSuccessMsg('Failed to parse JSON');
      setTimeout(() => setSuccessMsg(''), 3000);
    } finally {
      setImportLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const colorMap = {
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-uew-red' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
    sky: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700' },
    rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
    navy: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-uew-navy' },
    gold: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  };

  return (
    <div className="space-y-5">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-uew-navy via-[#1E2F4D] to-uew-navy rounded-2xl p-4 sm:p-6 text-white flex items-center justify-between"
      >
        <div className="min-w-0">
          <h2 className="text-sm sm:text-lg font-black truncate">Welcome back, {user?.name || 'Admin'}</h2>
          <p className="text-xs text-slate-300 mt-0.5 sm:mt-1">Manage all DESA SEEK portal data. Changes sync immediately to the live site.</p>
          <div className="flex items-center gap-2 mt-2 sm:mt-3 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-uew-red text-[10px] sm:text-xs font-bold">{user?.role || 'admin'}</span>
            <span className="text-[10px] sm:text-xs text-slate-400">{user?.department || 'Distance Learning'}</span>
          </div>
        </div>
        <div className="hidden sm:block shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-uew-red" />
          </div>
        </div>
      </motion.div>

      {/* Data transfer panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
        <h3 className="text-xs font-black text-uew-navy uppercase tracking-wider mb-3">Data Management</h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-uew-navy text-white text-xs font-bold hover:bg-uew-blue transition-colors cursor-pointer shadow-sm">
            <DownloadCloud className="w-4 h-4" />
            Export All Data (JSON)
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 hover:border-uew-red/40 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Import from JSON
          </button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={(e) => { if (e.target.files[0]) handleImport(e.target.files[0]); }} />
          <button onClick={resetAll} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors cursor-pointer ml-auto">
            Reset to Defaults
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-3">
          Export creates 4 JSON files you can copy to another machine. Import combines all datasets from a single exported file.
          All changes sync instantly to the live site via localStorage.
        </p>
      </div>

      <AnimatePresence>
        {successMsg && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold"><ShieldCheck className="w-4 h-4" />{successMsg}</motion.div>}
      </AnimatePresence>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        {[
          { label: 'Regions', value: stats.regions, icon: MapPin, color: 'blue' },
          { label: 'Study Centers', value: stats.centers, icon: Building2, color: 'red' },
          { label: 'Academic Programs', value: stats.programs, icon: GraduationCap, color: 'amber' },
          { label: 'Announcements', value: stats.announcements, icon: ShieldCheck, color: 'emerald' },
          { label: 'Hotels Listed', value: stats.hotels, icon: Hotel, color: 'sky' },
          { label: 'Health Facilities', value: stats.health, icon: Activity, color: 'rose' },
          { label: 'Restaurants', value: stats.restaurants, icon: Utensils, color: 'orange' },
          { label: 'Hub Items', value: stats.hubItems, icon: Users, color: 'navy' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-xl ${colorMap[stat.color].bg} border ${colorMap[stat.color].border} flex items-center justify-center shrink-0`}>
              <stat.icon className={`w-5 h-5 ${colorMap[stat.color].text}`} />
            </div>
            <div>
              <p className="text-xl font-black text-uew-navy">{stat.value}</p>
              <p className="text-[11px] text-slate-500 font-semibold">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Navigation groups */}
      {NAV_GROUPS.map((group, gi) => {
        const GroupIcon = group.icon;
        return (
          <div key={gi} className="space-y-3">
            <div className="flex items-center gap-2">
              <GroupIcon className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-black text-uew-navy uppercase tracking-wider">{group.label}</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              {group.items.map((item, i) => {
                const c = colorMap[item.color] || colorMap.blue;
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.path}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-2xl border ${c.border} ${c.bg} hover:shadow-md transition-all duration-200 text-left cursor-pointer`}
                  >
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${c.text} shrink-0`} />
                    <span className="text-xs font-bold text-slate-700">{item.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
