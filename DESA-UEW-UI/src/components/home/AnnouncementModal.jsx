import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function AnnouncementModal({ item, type, onClose }) {
  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-start justify-between gap-3 px-5 py-4 bg-white border-b border-slate-100">
            <div className="flex-1 min-w-0">
              <span
                className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2"
                style={{
                  backgroundColor: type === 'event' ? '#EFF6FF' : '#FFF1F2',
                  color: type === 'event' ? '#1D3570' : '#A8181D',
                }}
              >
                {type === 'event' ? '📅 Event' : '📢 Announcement'}
              </span>
              <h2 className="text-base md:text-lg font-bold text-[#1D3570] leading-snug">
                {item.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 mt-1 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 overflow-y-auto max-h-[calc(85vh-80px)]">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-slate-500 font-medium">
              <span>📅 Published: {item.date}</span>
              {item.location && <span>📍 {item.location}</span>}
            </div>

            {/* Thumbnail */}
            {item.thumbnail && (
              <div className="mb-4 rounded-lg overflow-hidden bg-slate-50">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-40 object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}

            {/* Content */}
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {item.body}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
