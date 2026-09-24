import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import SearchBox from '../components/SearchBox';
import FilterChips from '../components/FilterChips';
import ResultCard from '../components/ResultCard';
import ItemModal from '../components/ItemModal';
import CenterDetailModal from '../components/centers/CenterDetailModal';
import AnnouncementModal from '../components/home/AnnouncementModal';
import { getUnifiedDirectory, searchDirectory } from '../data/unifiedDirectory';
import { getPublicCentersData } from '../data/persistence';
import { useAuth } from '../contexts/AuthContext';
import { DesaHubContent } from '../components/hub/DesaHubContent';

// ─── NEW TABS ───────────────────────────────────────────────
const CATEGORIES = [
  'Study Centers',
  'DESA Hub',
  'DeLaC',
  'Academic Peer PPT',
  '24/7 Academic Vault',
  'DESA Opportunity Radar',
  'Digital Student Opportunity Board',
  'Internship Opportunity Network',
  'Supervisor Connection Initiative',
  'Student Health Referral Network',
  'Welfare',
  'Alumni',
  'Announcement Hub',
];

// Keywords that auto-detect category
const CATEGORY_KEYWORDS = {
  'Study Centers': ['center', 'centers', 'study center', 'study centers', 'region', 'regions', 'coordinator', 'campus', 'location', 'place', 'address', 'hotel', 'accommodation', 'guest house'],
  'DESA Hub': ['desa hub', 'event', 'events', 'activity', 'activities', 'conference', 'meeting', 'gala', 'congress'],
  'Announcement Hub': ['announcement', 'announcements', 'notice', 'notices', 'news', 'alert', 'update'],
  'Academic Peer PPT': ['ppt', 'presentation', 'slides', 'peer ppt'],
  '24/7 Academic Vault': ['vault', 'academic vault', 'resource', 'resources', 'material', 'materials'],
  'DESA Opportunity Radar': ['opportunity', 'opportunities', 'radar'],
  'Digital Student Opportunity Board': ['board', 'student board', 'digital board'],
  'Internship Opportunity Network': ['internship', 'internships', 'network', 'placement'],
  'Supervisor Connection Initiative': ['supervisor', 'supervision', 'connection'],
  'Student Health Referral Network': ['health', 'health referral', 'medical', 'clinic', 'hospital', 'referral'],
  'Welfare': ['welfare', 'welfare support'],
  'Alumni': ['alumni', 'alumnus', 'graduate'],
};

function detectCategory(query) {
  if (!query.trim()) return 'Study Centers';
  const q = query.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (q.includes(kw)) return cat;
    }
  }
  return 'Study Centers';
}

export default function SeekPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [selectedCategory, setSelectedCategory] = useState('Study Centers');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [hasSearched, setHasSearched] = useState(urlQuery.length > 0);
  const [quickLinksOpen, setQuickLinksOpen] = useState(false);
  const quickLinksRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (quickLinksRef.current && !quickLinksRef.current.contains(e.target)) {
        setQuickLinksOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== undefined) setSearchQuery(q);
  }, [searchParams]);

  // Auto-detect category from search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const detected = detectCategory(searchQuery);
      if (detected !== selectedCategory) setSelectedCategory(detected);
    }
  }, [searchQuery]);

  const [allDirectoryItems, setAllDirectoryItems] = useState([]);
  const [regionsList, setRegionsList] = useState(['All Regions']);

  // Load data on mount and rebuild on every data change
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const items = getUnifiedDirectory();
      const centers = await getPublicCentersData();
      if (!cancelled) {
        setAllDirectoryItems(items);
        setRegionsList(['All Regions', ...centers.map((r) => r.name)]);
      }
    }
    load();
    const handler = () => {
      const items = getUnifiedDirectory();
      getPublicCentersData().then((centers) => {
        if (!cancelled) {
          setAllDirectoryItems(items);
          setRegionsList(['All Regions', ...centers.map((r) => r.name)]);
        }
      });
    };
    window.addEventListener('desa-data-changed', handler);
    return () => { cancelled = true; window.removeEventListener('desa-data-changed', handler); };
  }, []);

  const categoryCounts = useMemo(() => {
    const counts = { 'Study Centers': allDirectoryItems.filter(i => i.category === 'Study Centers').length };
    CATEGORIES.forEach(cat => {
      if (cat !== 'Study Centers') {
        counts[cat] = allDirectoryItems.filter(item => item.category.toLowerCase() === cat.toLowerCase()).length;
      }
    });
    return counts;
  }, [allDirectoryItems]);

  const filteredResults = useMemo(() => {
    let results = searchDirectory(allDirectoryItems, searchQuery, selectedCategory);
    if (selectedCategory === 'Study Centers' && selectedRegion !== 'All Regions') {
      results = results.filter((item) => item.region === selectedRegion);
    }
    return results;
  }, [allDirectoryItems, searchQuery, selectedCategory, selectedRegion]);

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    } else {
      setSearchParams({});
    }
  };

  // Auto-trigger results view as soon as user types anything
  useEffect(() => {
    if (searchQuery.trim()) setHasSearched(true);
  }, [searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
  };

  const handleSelectItem = (item) => {
    setActiveModalItem(item);
  };

  const hasActiveSearch = hasSearched || searchQuery.trim().length > 0;
  return (
    <div className="min-h-screen w-full flex flex-col overflow-x-hidden">
      {/* UEW Accent Bar */}
      <div className="w-full h-1.5 bg-gradient-to-r from-uew-red via-[#C52227] to-uew-red" />
      <div className="w-full h-0.5 bg-gradient-to-r from-uew-gold via-amber-300 to-uew-gold" />

      {/* Top Nav */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 px-4 py-3 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logos */}
          <div className="flex items-center gap-3">
            <a href="https://uew.edu.gh" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden p-1.5 shadow-sm shrink-0">
                <img src="/images/uew logo.webp" alt="UEW" className="w-full h-full object-contain" />
              </div>
            </a>
            <button onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden p-1.5 shadow-sm shrink-0">
                <img src="/images/DESA Logo.webp" alt="DESA" className="w-full h-full object-contain" />
              </div>
              <div className="hidden sm:flex flex-col items-start border-l border-slate-200 pl-2 sm:pl-3 min-w-0">
                <span className="text-[7px] sm:text-[8px] md:text-[9px] font-extrabold text-uew-navy uppercase tracking-tight leading-tight truncate">Distance Education Students Association</span>
                <span className="text-[9px] sm:text-[10px] md:text-[11px] font-black text-uew-red uppercase tracking-wider leading-tight">DESA · UEW</span>
                <span className="text-[6px] sm:text-[7px] md:text-[8px] text-slate-500 font-semibold uppercase tracking-wide leading-tight truncate">University of Education, Winneba</span>
              </div>
            </button>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-2">
              {/* Quick Links Dropdown */}
              <div className="relative" ref={quickLinksRef}>
                <button
                  onClick={() => setQuickLinksOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[10px] font-bold hover:border-uew-red hover:text-uew-red transition-all cursor-pointer"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${quickLinksOpen ? 'rotate-180' : ''}`} />
                  <span>Quick Links</span>
                </button>
                {quickLinksOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                    <div className="py-1">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setHasSearched(true);
                            setSelectedCategory(cat);
                            setQuickLinksOpen(false);
                            if (cat !== 'Study Centers') {
                              setSelectedRegion('All Regions');
                            }
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between ${selectedCategory === cat ? 'text-uew-red bg-red-50' : 'text-slate-700'}`}
                        >
                          {cat}
                          {selectedCategory === cat && <span className="text-uew-red font-black">●</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {user ? (
              <>
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                  <div className="w-5 h-5 rounded-full bg-uew-red flex items-center justify-center text-white text-[9px] font-black">{user.name?.charAt(0) || 'A'}</div>
                  <span className="text-[10px] font-bold text-slate-700 max-w-[80px] truncate">{user.name}</span>
                </div>
                <button onClick={() => navigate('/admin')} className="px-2.5 py-1.5 rounded-lg bg-uew-navy text-white text-[10px] font-bold hover:bg-uew-red transition-colors cursor-pointer">Admin</button>
                <button onClick={logout} className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-[10px] font-bold hover:bg-red-50 hover:text-uew-red transition-colors cursor-pointer">Out</button>
              </>
            ) : (
              <button onClick={() => navigate('/login')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-uew-navy text-[10px] font-bold hover:border-uew-red hover:text-uew-red transition-all cursor-pointer">
                <UserCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero — search field always mounted; avatar/name hidden once search is active */}
      <main className="flex-1 flex flex-col items-center px-4 py-8 sm:py-12 md:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="w-full max-w-lg flex flex-col items-center text-center">
          {/* President Avatar — hidden when searching */}
          {!hasActiveSearch && (
            <motion.div initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} className="mb-5">
              <div className="relative inline-block">
                <div className="absolute -inset-4 bg-gradient-to-r from-uew-red via-red-700 to-uew-red rounded-full opacity-25 blur-2xl animate-pulse-slow" />
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 xl:w-[28rem] xl:h-[28rem] rounded-full p-3 sm:p-3.5 md:p-4 bg-gradient-to-b from-uew-red via-[#881014] to-[#600A0D] shadow-2xl portrait-glow">
                  <div className="w-full h-full rounded-full overflow-hidden bg-uew-navy border-4 border-white shadow-inner">
                    <img src="/images/President.webp" alt="Current President" className="w-full h-full object-cover" style={{ objectPosition: '50% 15%' }} onError={(e) => { e.target.style.display = 'none'; }} loading="eager" />
                  </div>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-uew-navy border-2 border-uew-red text-white text-xs font-extrabold uppercase tracking-wider whitespace-nowrap shadow-xl">Current President</div>
              </div>
            </motion.div>
          )}

          {/* Name — hidden when searching */}
          {!hasActiveSearch && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }} className="mb-6 w-full">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-uew-navy font-serif leading-tight">H.E Francis Antwi Bosiako</h1>
                <p className="text-[10px] sm:text-xs text-uew-red font-bold uppercase tracking-widest mt-1">National President</p>
                <p className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 font-medium">Distance Learning Students Association · UEW</p>
              </div>
            </motion.div>
          )}

          {/* Search — always mounted at the same position so focus is never lost */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }} className="w-full max-w-lg">
            <SearchBox
              value={searchQuery}
              onChange={(v) => setSearchQuery(v)}
              onClear={() => { setSearchQuery(''); setSearchParams({}); }}
              placeholder="Search courses, exams, fees, centers..."
              totalRecords={allDirectoryItems.length}
            />
          </motion.div>

          {!hasActiveSearch && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.55 }} className="mt-4 text-xs text-slate-400 font-medium">
              University of Education, Winneba · CoDeL
            </motion.p>
          )}
        </motion.div>
      </main>

      {/* Results view */}
      <main className={`${!hasActiveSearch ? 'hidden' : ''} flex-1 w-full px-3 py-4 sm:px-4 sm:py-6 md:py-8 flex flex-col items-center`}>
        {/* Results summary + filter */}
        <div className="w-full max-w-5xl mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              Found{' '}
              <span className="text-uew-red font-black">{filteredResults.length}</span>
              {selectedCategory !== 'Study Centers' && <span> in <strong className="text-uew-navy">{selectedCategory}</strong></span>}
              {selectedRegion !== 'All Regions' && <span> in <strong className="text-uew-navy">{selectedRegion}</strong></span>}
              {searchQuery && <span> for &ldquo;<strong className="text-uew-navy">{searchQuery}</strong>&rdquo;</span>}
            </p>
            {(searchQuery || selectedCategory !== 'Study Centers' || selectedRegion !== 'All Regions') && (
              <button onClick={() => { setHasSearched(false); setSearchQuery(''); setSelectedCategory('Study Centers'); setSelectedRegion('All Regions'); setSearchParams({}); }} className="text-xs font-bold text-uew-red hover:underline cursor-pointer">Clear</button>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <FilterChips categories={CATEGORIES} selected={selectedCategory} onSelect={setSelectedCategory} counts={categoryCounts} />
            {selectedCategory === 'Study Centers' && (
              <div className="relative ml-auto shrink-0">
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:border-uew-red/40 focus:outline-none focus:ring-2 focus:ring-uew-red/20 cursor-pointer transition-all"
                >
                  {regionsList.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            )}
          </div>
        </div>

        {/* DESA Hub content or results grid */}
        <div className="w-full max-w-5xl flex-1">
          {selectedCategory === 'DESA Hub' ? (
            <DesaHubContent />
          ) : filteredResults.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedCategory}-${searchQuery}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filteredResults.map((item) => (
                  <ResultCard key={item.id} item={item} onSelect={handleSelectItem} />
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto my-12 text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-red-50 border border-red-200 text-uew-red flex items-center justify-center">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-uew-navy">No results found</h3>
              <p className="text-sm text-slate-500 mt-1">Try a different keyword or browse all records.</p>
              <button onClick={() => { setSearchQuery(''); setSelectedCategory('Study Centers'); setSearchParams({}); }} className="mt-4 px-5 py-2 rounded-xl bg-uew-red text-white text-xs font-bold hover:bg-uew-redHover cursor-pointer">Browse All</button>
            </motion.div>
          )}
        </div>
      </main>

      {/* MODALS */}
      {activeModalItem && activeModalItem.systemType === 'center' && (
        <CenterDetailModal center={activeModalItem.rawItem} regionName={activeModalItem.region} onClose={() => setActiveModalItem(null)} />
      )}
      {activeModalItem && activeModalItem.systemType === 'region' && (
        <CenterDetailModal center={activeModalItem.rawItem.centers?.[0] || {}} regionName={activeModalItem.region} onClose={() => setActiveModalItem(null)} />
      )}
      {activeModalItem && activeModalItem.systemType === 'announcement' && (
        <AnnouncementModal item={activeModalItem.rawItem} type="announcement" onClose={() => setActiveModalItem(null)} />
      )}
      {activeModalItem && activeModalItem.systemType === 'event' && (
        <AnnouncementModal item={activeModalItem.rawItem} type="event" onClose={() => setActiveModalItem(null)} />
      )}
      {activeModalItem && activeModalItem.systemType === 'academic' && (
        <ItemModal item={activeModalItem.rawItem || activeModalItem} onClose={() => setActiveModalItem(null)} />
      )}

      {/* Footer */}
      <footer className="py-4 px-4 text-center border-t border-slate-200 bg-white/60">
        <p className="text-[10px] text-slate-400 font-medium">Education for Service · DESA SEEK Portal · UEW</p>
      </footer>
    </div>
  );
}
