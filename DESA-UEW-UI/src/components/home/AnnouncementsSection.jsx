import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, CalendarDays, ChevronRight, Clock, MapPin } from 'lucide-react';
import { getPublicAnnouncements } from '../../data/persistence';
import AnnouncementModal from './AnnouncementModal';

const TABS = [
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'events', label: 'Events & Activities', icon: CalendarDays },
];

export default function AnnouncementsSection() {
  const [activeTab, setActiveTab] = useState('announcements');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [annData, setAnnData] = useState(getPublicAnnouncements);

  useEffect(() => {
    const handler = () => setAnnData(getPublicAnnouncements);
    window.addEventListener('desa-data-changed', handler);
    return () => window.removeEventListener('desa-data-changed', handler);
  }, []);

  const items =
    activeTab === 'announcements'
      ? annData.announcements
      : (annData.events || []);

  const displayItems = showAll ? items : items.slice(0, 6);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  };

  return (
    <section className="relative z-10 w-full px-3 sm:px-4 md:px-8 py-8 sm:py-10 md:py-12 bg-gradient-to-b from-transparent via-slate-50/50 to-transparent">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 sm:mb-6">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-uew-navy font-serif leading-tight">
              Latest{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-uew-red to-uew-redHover">
                News & Updates
              </span>
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-500 font-semibold mt-0.5">
              Official university announcements and campus events
            </p>
          </div>

          {/* Tab Toggle */}
          <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setShowAll(false); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-uew-navy text-white shadow-sm'
                      : 'text-slate-500 hover:text-uew-navy'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Red accent line */}
        <div className="w-16 h-0.5 bg-gradient-to-r from-uew-red to-transparent rounded-full mb-6" />

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
        >
          <AnimatePresence mode="wait">
            {displayItems.map((item) => (
              <motion.button
                key={item.id}
                variants={itemVariants}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedItem(item)}
                className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-uew-red/25 transition-all duration-200 text-left overflow-hidden cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="relative h-28 sm:h-32 md:h-36 overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <span
                    className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-sm"
                    style={{
                      backgroundColor: activeTab === 'events' ? 'rgba(29,53,112,0.85)' : 'rgba(168,24,29,0.85)',
                      color: '#ffffff',
                    }}
                  >
                    {activeTab === 'events' ? 'Event' : 'Notice'}
                  </span>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-4 flex flex-col flex-1">
                  <h3
                    className="text-xs sm:text-sm font-bold leading-snug line-clamp-2 group-hover:text-uew-red transition-colors"
                    style={{ color: '#1D3570' }}
                  >
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 flex-1 leading-relaxed">
                    {item.excerpt}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-uew-red" />
                      {item.date}
                    </span>
                    {item.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-uew-red" />
                        {item.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <ChevronRight className="w-4 h-4 text-white" />
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Load More */}
        {items.length > 6 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 flex justify-center"
          >
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-slate-200 text-uew-navy text-sm font-bold hover:border-uew-red/40 hover:bg-uew-red/5 transition-all cursor-pointer shadow-sm"
            >
              {showAll ? 'Show Less' : `Show More ${activeTab === 'announcements' ? 'Announcements' : 'Events'}`}
              <ChevronRight className={`w-4 h-4 transition-transform ${showAll ? 'rotate-90' : ''}`} />
            </button>
          </motion.div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <AnnouncementModal
          item={selectedItem}
          type={activeTab === 'events' ? 'event' : 'announcement'}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </section>
  );
}
