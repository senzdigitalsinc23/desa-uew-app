import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function Collapsible({ title, subtitle, badge, defaultOpen = false, children, rightAction }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <span className="text-slate-400 transition-transform duration-200 shrink-0">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-black text-uew-navy">{title}</span>
            {badge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 text-uew-red border border-red-200 uppercase">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5 font-medium">{subtitle}</p>}
        </div>
        {rightAction && <div className="shrink-0">{rightAction}</div>}
      </button>

      {/* Body */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-slate-100 pt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CollapsibleGroup({ title, subtitle, count, color = 'blue', children }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    red: 'bg-red-50 text-uew-red border-red-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    sky: 'bg-sky-50 text-sky-700 border-sky-200',
  };
  const cls = colors[color] || colors.blue;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <span className={`text-xs font-extrabold uppercase tracking-wider ${cls.split(' ')[1]}`}>{title}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>{count}</span>
      </div>
      {children}
    </div>
  );
}
