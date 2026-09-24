import React from 'react';
import {
  Compass,
  MapPin,
  Building2,
  Users,
  GraduationCap,
  Briefcase,
  Heart,
  Megaphone,
  BookOpen,
  Lightbulb,
  Search,
  Network,
  ShieldCheck,
  UserCheck,
  MessageSquare,
  Monitor,
  RefreshCw,
  Presentation,
} from 'lucide-react';

const categoryMeta = {
  'Study Centers': { icon: MapPin, badge: 'bg-sky-50 text-sky-800 border-sky-200' },
  'DESA Hub': { icon: Users, badge: 'bg-red-50 text-uew-red border-red-200' },
  'DeLaC': { icon: GraduationCap, badge: 'bg-blue-50 text-blue-800 border-blue-200' },
  'Academic Peer PPT': { icon: Presentation, badge: 'bg-purple-50 text-purple-800 border-purple-200' },
  '24/7 Academic Vault': { icon: ShieldCheck, badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  'DESA Opportunity Radar': { icon: Search, badge: 'bg-amber-50 text-amber-800 border-amber-200' },
  'Digital Student Opportunity Board': { icon: Monitor, badge: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  'Internship Opportunity Network': { icon: Briefcase, badge: 'bg-teal-50 text-teal-800 border-teal-200' },
  'Supervisor Connection Initiative': { icon: UserCheck, badge: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
  'Student Health Referral Network': { icon: Heart, badge: 'bg-rose-50 text-rose-800 border-rose-200' },
  'Welfare': { icon: Heart, badge: 'bg-orange-50 text-orange-800 border-orange-200' },
  'Alumni': { icon: Users, badge: 'bg-violet-50 text-violet-800 border-violet-200' },
  'Announcement Hub': { icon: Megaphone, badge: 'bg-rose-50 text-rose-800 border-rose-200' },
};

// Fallback icon for any uncategorized
const fallbackIcons = {
  'Study Centers': MapPin,
  'DESA Hub': Users,
  'DeLaC': GraduationCap,
  'Academic Peer PPT': Presentation,
  '24/7 Academic Vault': ShieldCheck,
  'DESA Opportunity Radar': Search,
  'Digital Student Opportunity Board': Monitor,
  'Internship Opportunity Network': Briefcase,
  'Supervisor Connection Initiative': UserCheck,
  'Student Health Referral Network': Heart,
  'Welfare': Heart,
  'Alumni': Users,
  'Announcement Hub': Megaphone,
};

export default function FilterChips({ categories, selected, onSelect, counts = {} }) {
  return (
    <div className="w-full max-w-5xl mx-auto overflow-x-auto py-2 no-scrollbar">
      <div className="flex items-center gap-2 px-1 md:justify-center min-w-max">
        {categories.map((cat) => {
          const isSelected = selected === cat;
          const meta = categoryMeta[cat] || { badge: 'bg-slate-100 text-slate-600 border-slate-200' };
          const Icon = fallbackIcons[cat] || Compass;
          const count = counts[cat];

          return (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-uew-red text-white shadow-md shadow-uew-red/20 ring-2 ring-uew-red scale-105'
                  : `${meta.badge} border`
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : ''}`} />
              <span>{cat}</span>
              {typeof count === 'number' && count > 0 && (
                <span
                  className={`ml-0.5 px-1.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-white/60 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
