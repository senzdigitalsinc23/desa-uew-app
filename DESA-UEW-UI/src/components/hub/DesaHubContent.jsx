import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Info,
  Users,
  Image,
  ScrollText,
  Archive,
  Building2,
  Megaphone,
  UserCog,
} from 'lucide-react';
import { getHubData } from '../../data/persistence';

function ScrollSection({ id, title, subtitle, icon: Icon, accentColor = 'red', children }) {
  const colorMap = {
    red: { from: 'from-uew-red', to: 'to-[#881014]', ring: 'ring-uew-red', text: 'text-uew-red', bg: 'bg-red-50', border: 'border-red-200', glow: 'shadow-red-500/10' },
    navy: { from: 'from-uew-navy', to: 'to-uew-navyDark', ring: 'ring-uew-navy', text: 'text-uew-navy', bg: 'bg-sky-50', border: 'border-sky-200', glow: 'shadow-uew-navy/10' },
    gold: { from: 'from-uew-gold', to: 'to-uew-goldDark', ring: 'ring-uew-gold', text: 'text-uew-goldDark', bg: 'bg-amber-50', border: 'border-amber-200', glow: 'shadow-uew-gold/10' },
  };
  const c = colorMap[accentColor];
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: '-20% 0px -20% 0px' });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      id={id}
      className="scroll-mt-24 py-12 sm:py-16 border-b border-slate-200/60 last:border-0"
    >
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.from} ${c.to} flex items-center justify-center shadow-lg ${c.glow}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-uew-navy">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 font-semibold mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <div className={`h-1 w-16 rounded-full bg-gradient-to-r ${c.from} to-transparent mb-6`} />
        <div className={`rounded-2xl border ${c.border} ${c.bg} p-5 sm:p-7 shadow-sm`}>
          {children}
        </div>
      </div>
    </motion.section>
  );
}

export function DesaHubContent({ onNavigate }) {
  const [hubData, setHubData] = useState(null);
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Load hub data on mount and rebuild on every data change
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = await getHubData();
      if (!cancelled) setHubData(data);
    }
    load();
    const handler = () => {
      getHubData().then((data) => {
        if (!cancelled) setHubData(data);
      });
    };
    window.addEventListener('desa-data-changed', handler);
    return () => { cancelled = true; window.removeEventListener('desa-data-changed', handler); };
  }, []);

  return (
    <div className="bg-[#F4F7FB]">
      {!hubData ? (
        <div className="py-16 text-center">
          <p className="text-sm text-slate-500 font-semibold">Loading DESA Hub data...</p>
        </div>
      ) : (
      <>
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-uew-navy via-uew-blue to-uew-navyDark text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-uew-red rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-uew-gold rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-12 sm:py-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white/90 uppercase tracking-widest mb-4">
              Distance Learning Students Association
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif leading-tight mb-3">
              DESA <span className="text-uew-red">Hub</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Your central portal for everything DESA — leadership, constitution, events, archives, and more.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Inline nav */}
      <div className="sticky top-[60px] z-20 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 px-4 py-2.5 shadow-sm">
        <div className="max-w-4xl mx-auto flex gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'about', label: 'About', icon: Info },
            { id: 'leadership', label: 'Leadership', icon: Users },
            { id: 'gallery', label: 'Gallery', icon: Image },
            { id: 'constitution', label: 'Constitution', icon: ScrollText },
            { id: 'archives', label: 'Archives', icon: Archive },
            { id: 'assets', label: 'Assets', icon: Building2 },
            { id: 'activities', label: 'Activities', icon: Megaphone },
            { id: 'committee', label: 'Committees', icon: UserCog },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-uew-red whitespace-nowrap transition-colors cursor-pointer border border-transparent hover:border-uew-red/30"
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <ScrollSection id="about" title="About DESA" subtitle="Distance Learning Students Association — UEW" icon={Info} accentColor="red">
        {hubData?.about?.content ? (
          <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
            {hubData.about.content.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">Loading about content...</p>
        )}
      </ScrollSection>

      <ScrollSection id="leadership" title="DESA Leadership Tree" subtitle="Current executive structure and roles" icon={Users} accentColor="navy">
        {hubData?.leadership?.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              {hubData.leadership.map((person, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <div className="w-0.5 h-6 bg-slate-300" />}
                  <div className={`w-full max-w-sm p-4 rounded-xl bg-white border ${idx === 0 ? 'border-uew-red shadow-md' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black ${idx === 0 ? 'bg-uew-red' : 'bg-slate-300'}`}>
                        {person.name?.charAt(0) || 'T'}
                      </div>
                      <div>
                        <p className="font-black text-uew-navy text-sm">{person.name || <span className="text-slate-400 italic">TBA</span>}</p>
                        <p className="text-[10px] text-uew-red font-bold uppercase tracking-wider">{person.role}</p>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
            <p className="text-xs text-slate-500 text-center italic">Updates will be posted here as elections conclude.</p>
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">Loading leadership data...</p>
        )}
      </ScrollSection>

      <ScrollSection id="gallery" title="DESA Gallery" subtitle="Moments from our activities and events" icon={Image} accentColor="gold">
        <div>
          {hubData.gallery?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {hubData.gallery.map((photo, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  {photo.url ? (
                    <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Image className="w-8 h-8" />
                    </div>
                  )}
                  {photo.caption && <p className="text-[10px] text-slate-600 p-2 font-semibold truncate bg-white">{photo.caption}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2">
                  <Image className="w-6 h-6 text-slate-300" />
                  <span className="text-[10px] text-slate-400 font-semibold">Photo {i}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-slate-500 text-center mt-4">
            Gallery photos will be uploaded soon. Stay tuned for event highlights and community moments.
          </p>
        </div>
      </ScrollSection>

      <ScrollSection id="constitution" title="DESA Constitution" subtitle="Governing document of the association" icon={ScrollText} accentColor="red">
        <div className="space-y-4">
          {hubData.constitution?.preamble && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-black text-uew-navy text-base mb-2">Preamble</h3>
              <p className="text-xs text-slate-600 leading-relaxed italic">{hubData.constitution.preamble}</p>
            </div>
          )}
          {hubData.constitution?.articles?.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hubData.constitution.articles.map((a, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-bold text-uew-red uppercase tracking-wider">{a.number}</span>
                  <p className="font-bold text-uew-navy text-sm mt-0.5">{a.title}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{a.content}</p>
                </div>
              ))}
            </div>
          )}
          <div className="text-center">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-uew-red text-white text-xs font-bold hover:bg-uew-redHover transition-colors cursor-pointer shadow-sm">
              <ScrollText className="w-4 h-4" />
              Download Full Constitution (PDF)
            </button>
          </div>
        </div>
      </ScrollSection>

      <ScrollSection id="archives" title="DESA Archives" subtitle="Historical records, past reports & documents" icon={Archive} accentColor="navy">
        <div className="space-y-3">
          {hubData.archives?.length > 0 ? hubData.archives.map((doc, i) => (
            <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200 hover:border-uew-navy/30 hover:shadow-sm transition-all cursor-pointer group">
              <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
                <Archive className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-uew-navy truncate">{doc.title}</p>
                <p className="text-[10px] text-slate-500">{doc.year}</p>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg shrink-0">{doc.type}</span>
            </div>
          )) : (
            <p className="text-xs text-slate-500 text-center">No archives added yet.</p>
          )}
        </div>
      </ScrollSection>

      <ScrollSection id="assets" title="Asset Register" subtitle="DESA property and equipment inventory" icon={Building2} accentColor="gold">
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  {['S/N', 'Item', 'Description', 'Date Acquired', 'Status'].map((h) => (
                    <th key={h} className="text-left py-2 px-2 font-bold text-slate-500 uppercase tracking-wider text-[10px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hubData.assets?.length > 0 ? hubData.assets.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 px-2 font-mono text-slate-400">{row.sn}</td>
                    <td className="py-2 px-2 font-semibold text-uew-navy">{row.item}</td>
                    <td className="py-2 px-2 text-slate-600">{row.description}</td>
                    <td className="py-2 px-2 text-slate-500">{row.dateAcquired}</td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${row.status === 'Good' ? 'text-emerald-600 bg-emerald-50' : row.status === 'Fair' ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50'}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="py-4 text-center text-xs text-slate-400">No assets recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollSection>

      <ScrollSection id="activities" title="Announcements & Activities" subtitle="Latest news, events, and updates" icon={Megaphone} accentColor="red">
        <div className="space-y-4">
          {hubData.activities?.length > 0 ? hubData.activities.map((item, i) => (
            <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-uew-red/30 transition-colors">
              <div className="flex items-start gap-3">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${item.tag === 'Event' ? 'bg-red-100 text-uew-red' : item.tag === 'Notice' ? 'bg-blue-100 text-blue-700' : item.tag === 'Election' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                  {item.tag}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 font-semibold">{item.date}</p>
                  <h4 className="font-bold text-uew-navy text-sm mt-0.5">{item.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.body}</p>
                </div>
              </div>
            </div>
          )) : (
            <p className="text-xs text-slate-500 text-center">No activities or announcements yet.</p>
          )}
        </div>
      </ScrollSection>

      <ScrollSection id="committee" title="Committees" subtitle="Standing and ad-hoc committees of DESA" icon={UserCog} accentColor="navy">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {hubData.committees?.length > 0 ? hubData.committees.map((committee, i) => (
            <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-uew-navy/30 hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center">
                  <UserCog className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <h4 className="font-bold text-uew-navy text-sm">{committee.name}</h4>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">{committee.description}</p>
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span className="font-semibold">Chair: <span className="text-slate-700">{committee.chair || 'TBA'}</span></span>
                <span>·</span>
                <span>{committee.members} members</span>
              </div>
            </div>
          )) : (
            <p className="text-xs text-slate-500 text-center col-span-full">No committees added yet.</p>
          )}
        </div>
      </ScrollSection>

      <footer className="py-5 px-4 text-center border-t border-slate-200 bg-white">
        <p className="text-[10px] text-slate-400 font-medium">Education for Service · DESA · UEW</p>
      </footer>
      </>
      )}
    </div>
  );
}
