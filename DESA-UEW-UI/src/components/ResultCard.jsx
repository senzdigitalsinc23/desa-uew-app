import React from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  FileText,
  Layers,
  MapPin,
  Building2,
  Megaphone,
  CalendarDays,
  Info,
  Users,
  GraduationCap,
  Briefcase,
  Heart,
  Search,
  ShieldCheck,
  UserCheck,
  Monitor,
  Presentation,
} from 'lucide-react';

const categoryMeta = {
  'Study Centers': {
    icon: MapPin, color: 'sky',
    bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200',
  },
  'Study Center': {
    icon: MapPin, color: 'sky',
    bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200',
  },
  'Region': {
    icon: Building2, color: 'blue',
    bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200',
  },
  'Program': {
    icon: GraduationCap, color: 'emerald',
    bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200',
  },
  'DESA Hub': {
    icon: Users, color: 'red',
    bg: 'bg-red-50', text: 'text-uew-red', border: 'border-red-200',
  },
  'About DESA': {
    icon: Info, color: 'red',
    bg: 'bg-red-50', text: 'text-uew-red', border: 'border-red-200',
  },
  'Mission': {
    icon: Info, color: 'red',
    bg: 'bg-red-50', text: 'text-uew-red', border: 'border-red-200',
  },
  'Vision': {
    icon: Info, color: 'red',
    bg: 'bg-red-50', text: 'text-uew-red', border: 'border-red-200',
  },
  'Leadership': {
    icon: Users, color: 'red',
    bg: 'bg-red-50', text: 'text-uew-red', border: 'border-red-200',
  },
  'Constitution': {
    icon: FileText, color: 'purple',
    bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200',
  },
  'Article': {
    icon: FileText, color: 'purple',
    bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200',
  },
  'Committee': {
    icon: Users, color: 'red',
    bg: 'bg-red-50', text: 'text-uew-red', border: 'border-red-200',
  },
  'Archive': {
    icon: FileText, color: 'amber',
    bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-200',
  },
  'Asset': {
    icon: Layers, color: 'slate',
    bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200',
  },
  'Gallery': {
    icon: Monitor, color: 'indigo',
    bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200',
  },
  'Announcement': {
    icon: Megaphone, color: 'red',
    bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200',
  },
  'Event': {
    icon: CalendarDays, color: 'purple',
    bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200',
  },
  'DeLaC': {
    icon: GraduationCap, color: 'blue',
    bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200',
  },
  'Academic Peer PPT': {
    icon: Presentation, color: 'purple',
    bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200',
  },
  '24/7 Academic Vault': {
    icon: ShieldCheck, color: 'emerald',
    bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200',
  },
  'DESA Opportunity Radar': {
    icon: Search, color: 'amber',
    bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-200',
  },
  'Digital Student Opportunity Board': {
    icon: Monitor, color: 'indigo',
    bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200',
  },
  'Internship Opportunity Network': {
    icon: Briefcase, color: 'teal',
    bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200',
  },
  'Supervisor Connection Initiative': {
    icon: UserCheck, color: 'cyan',
    bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200',
  },
  'Student Health Referral Network': {
    icon: Heart, color: 'rose',
    bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200',
  },
  'Welfare': {
    icon: Heart, color: 'orange',
    bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200',
  },
  'Alumni': {
    icon: Users, color: 'violet',
    bg: 'bg-violet-50', text: 'text-violet-800', border: 'border-violet-200',
  },
  'Announcement Hub': {
    icon: Megaphone, color: 'red',
    bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200',
  },
  // Legacy fallbacks
  Courses: { icon: Layers, color: 'blue', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  'Past Questions': { icon: FileText, color: 'amber', bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-200' },
  Materials: { icon: FileText, color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  Fees: { icon: Download, color: 'red', bg: 'bg-red-50', text: 'text-uew-red', border: 'border-red-200' },
  Timetable: { icon: CalendarDays, color: 'purple', bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  'General Info': { icon: Info, color: 'slate', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

const systemTypeIcons = {
  region: Building2,
  center: MapPin,
  announcement: Megaphone,
  event: CalendarDays,
};

function getDisplayCategory(item) {
  if (item.displayCategory) return item.displayCategory;
  const st = item.systemType;
  const cat = item.category;
  if (st === 'program') return 'Program';
  if (st === 'center') return 'Study Center';
  if (st === 'region') return 'Region';
  if (st === 'announcement' || cat === 'Announcement') return 'Announcement';
  if (st === 'event') return 'Event';
  if (cat === 'Study Centers') return 'Program';
  // Hub sub-categories
  if (st === 'hub') {
    const sec = item.rawItem?._section;
    if (sec === 'mission') return 'Mission';
    if (sec === 'vision') return 'Vision';
    if (item.id?.startsWith('leader-')) return 'Leadership';
    if (item.id?.startsWith('const-') && !item.id.startsWith('constitution')) return 'Article';
    if (item.id === 'hub-constitution') return 'Constitution';
    if (item.id?.startsWith('committee-')) return 'Committee';
    if (item.id?.startsWith('archive-')) return 'Archive';
    if (item.id?.startsWith('asset-')) return 'Asset';
    if (item.id === 'hub-about') return 'About DESA';
    if (item.id?.startsWith('gallery-')) return 'Gallery';
    return 'DESA Hub';
  }
  return cat;
}

export default function ResultCard({ item, onSelect }) {
  const displayCat = getDisplayCategory(item);
  const meta = categoryMeta[displayCat] || categoryMeta[item.category] || categoryMeta['General Info'];
  const Icon = meta.icon;
  const SystemIcon = systemTypeIcons[item.systemType];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-uew-red/25 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
      onClick={() => onSelect(item)}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-uew-navy via-uew-red to-uew-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-3.5 sm:p-4 md:p-5 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${meta.bg} ${meta.text} ${meta.border}`}>
            <Icon className="w-3 h-3" />
            {displayCat}
          </span>

          {SystemIcon && (
            <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
              <SystemIcon className="w-3.5 h-3.5 text-slate-400" />
            </div>
          )}
        </div>

        {/* Title */}
        <h4 className="text-xs sm:text-sm md:text-base font-black text-uew-navy leading-snug group-hover:text-uew-red transition-colors duration-200 line-clamp-2">
          {item.title}
        </h4>

        {/* Program / Level badges */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {item.program && (
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
              {item.program}
            </span>
          )}
          {item.level && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
              <Layers className="w-3 h-3 text-slate-400" />
              {item.level}
            </span>
          )}
          {item.region && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
              <MapPin className="w-3 h-3 text-slate-400" />
              {item.region}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-[11px] sm:text-xs md:text-sm text-slate-600 mt-2 sm:mt-3 line-clamp-3 leading-relaxed flex-1">
          {item.description}
        </p>

        {/* Tags preview */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {item.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[10px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                #{tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="text-[10px] font-medium text-slate-400">
                +{item.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3.5 py-3 sm:px-4 sm:py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
          {item.fileSize && (
            <span className="inline-flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              {item.fileSize}
            </span>
          )}
          {item.date && <span className="text-slate-400">• {item.date}</span>}
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-uew-navy text-white text-xs font-bold group-hover:bg-uew-red transition-colors duration-200 shadow-sm">
          <span>View</span>
          <Download className="w-3.5 h-3.5" />
        </span>
      </div>
    </motion.div>
  );
}
