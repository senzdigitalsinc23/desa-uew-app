import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  CheckCircle2, 
  FileText, 
  Calendar, 
  BookOpen, 
  Sparkles
} from 'lucide-react';

export default function ItemModal({ item, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!item) return null;

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3500);
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-uew-navyDark/65 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-uew-navy via-[#1E2F4D] to-uew-navy text-white relative border-b-2 border-uew-red">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-uew-red text-white">
                {item.category}
              </span>
              {item.level && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
                  {item.level}
                </span>
              )}
            </div>

            <h3 className="text-xl md:text-2xl font-bold leading-snug">
              {item.title}
            </h3>

            {item.program && (
              <p className="text-sm font-medium text-slate-300 mt-1 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-uew-red" />
                {item.program}
              </p>
            )}
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm md:text-base">
            <div>
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
                Overview & Summary
              </h4>
              <p className="leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-700">
                {item.description}
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-400 block font-medium">Format / Type</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5 text-sm">
                  <FileText className="w-4 h-4 text-uew-navy" />
                  {item.fileType || 'Official Document'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-400 block font-medium">File Size</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5 text-sm">
                  <Download className="w-4 h-4 text-uew-red" />
                  {item.fileSize || 'Direct Access'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2">
                <span className="text-xs text-slate-400 block font-medium">Academic Session / Release</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5 text-sm">
                  <Calendar className="w-4 h-4 text-slate-600" />
                  {item.date || 'Current Academic Year'}
                </span>
              </div>
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div>
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
                  Keywords / Related Terms
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-uew-navy text-xs font-semibold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100 transition-colors"
            >
              Close
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all shadow-md ${
                downloaded
                  ? 'bg-emerald-600 shadow-emerald-200'
                  : 'bg-uew-red hover:bg-uew-redHover shadow-red-200'
              }`}
            >
              {downloading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-white" />
                  <span>Preparing Download...</span>
                </>
              ) : downloaded ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Downloaded Successfully!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Download Resource</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
