import React, { useRef } from 'react';
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

const sections = [
  { id: 'about', label: 'About DESA', icon: Info },
  { id: 'leadership', label: 'Leadership Tree', icon: Users },
  { id: 'gallery', label: 'Gallery', icon: Image },
  { id: 'constitution', label: 'Constitution', icon: ScrollText },
  { id: 'archives', label: 'Archives', icon: Archive },
  { id: 'assets', label: 'Asset Register', icon: Building2 },
  { id: 'activities', label: 'Announcements & Activities', icon: Megaphone },
  { id: 'committee', label: 'Committee', icon: UserCog },
];

const sectionIcons = {
  about: Info,
  leadership: Users,
  gallery: Image,
  constitution: ScrollText,
  archives: Archive,
  assets: Building2,
  activities: Megaphone,
  committee: UserCog,
};

function ScrollSection({ id, title, subtitle, icon: Icon, children, accentColor = 'red' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: '-15% 0px -15% 0px' });

  const colorMap = {
    red: { from: 'from-uew-red', to: 'to-[#881014]', ring: 'ring-uew-red', text: 'text-uew-red', bg: 'bg-red-50', border: 'border-red-200', glow: 'shadow-red-500/10' },
    navy: { from: 'from-uew-navy', to: 'to-uew-navyDark', ring: 'ring-uew-navy', text: 'text-uew-navy', bg: 'bg-sky-50', border: 'border-sky-200', glow: 'shadow-uew-navy/10' },
    gold: { from: 'from-uew-gold', to: 'to-uew-goldDark', ring: 'ring-uew-gold', text: 'text-uew-goldDark', bg: 'bg-amber-50', border: 'border-amber-200', glow: 'shadow-uew-gold/10' },
  };
  const c = colorMap[accentColor];

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -30, scale: 0.98 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      id={id}
      className={`scroll-mt-24 py-16 sm:py-20 border-b border-slate-200/60 last:border-0`}
    >
      <div className="max-w-4xl mx-auto px-4">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.from} ${c.to} flex items-center justify-center shadow-lg ${c.glow}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-uew-navy">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 font-semibold mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* Accent line */}
        <div className={`h-1 w-16 rounded-full bg-gradient-to-r ${c.from} to-transparent mb-6`} />

        {/* Content */}
        <div className={`rounded-2xl border ${c.border} ${c.bg} p-5 sm:p-7 shadow-sm`}>
          {children}
        </div>
      </div>
    </motion.section>
  );
}

export default function DesaHubPage() {
  const scrollContainerRef = useRef(null);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F4F7FB] overflow-x-hidden">
      {/* Top accent bar */}
      <div className="w-full h-1.5 bg-gradient-to-r from-uew-red via-[#C52227] to-uew-red" />
      <div className="w-full h-0.5 bg-gradient-to-r from-uew-gold via-amber-300 to-uew-gold" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 px-4 py-3 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-uew-red flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black text-uew-navy leading-tight">DESA Hub</h1>
              <p className="text-[10px] text-slate-500 font-semibold">University of Education, Winneba</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero banner */}
      <div className="relative bg-gradient-to-br from-uew-navy via-uew-blue to-uew-navyDark text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-uew-red rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-uew-gold rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-12 sm:py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
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

      {/* Main content */}
      <div className="flex-1 relative">
        {/* Side navigation dots */}
        <nav className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 z-20 flex-col gap-2">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                onClick={() => scrollTo(sec.id)}
                className="group flex items-center gap-2"
                title={sec.label}
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap absolute right-8">
                  {sec.label}
                </span>
                <div
                  className="w-3 h-3 rounded-full border-2 transition-all duration-300 bg-white"
                  aria-hidden
                />
              </button>
            );
          })}
        </nav>

        {/* Sections */}
        <div className="max-w-4xl mx-auto">

          {/* 1. About DESA */}
          <ScrollSection
            id="about"
            title="About DESA"
            subtitle="Distance Learning Students Association — UEW"
            icon={Info}
            accentColor="red"
          >
            <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
              <p>
                The <strong className="text-uew-navy">Distance Learning Students Association (DESA)</strong> is the official representative body for all students enrolled in the University of Education, Winneba's Centre for Distance e-Learning (CoDeL) programme.
              </p>
              <p>
                Established to champion the academic, welfare, and social interests of distance learners across all regions of Ghana, DESA serves as the vital bridge between the university's distance education directorate and its student population.
              </p>
              <p>
                Our mission is to ensure that every distance learning student receives the support, resources, and representation they deserve — regardless of their geographic location or study schedule.
              </p>
            </div>
          </ScrollSection>

          {/* 2. Leadership Tree */}
          <ScrollSection
            id="leadership"
            title="DESA Leadership Tree"
            subtitle="Current executive structure and roles"
            icon={Users}
            accentColor="navy"
          >
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                {/* President */}
                <div className="w-full max-w-sm p-4 rounded-xl bg-white border-2 border-uew-red shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-uew-red flex items-center justify-center text-white text-sm font-black">P</div>
                    <div>
                      <p className="font-black text-uew-navy text-sm">H.E. Francis Antwi Bosiako</p>
                      <p className="text-[10px] text-uew-red font-bold uppercase tracking-wider">National President</p>
                    </div>
                  </div>
                </div>
                {/* Connector */}
                <div className="w-0.5 h-6 bg-slate-300" />
                {/* VP + Secretary */}
                <div className="flex gap-3 w-full max-w-sm">
                  <div className="flex-1 p-3 rounded-xl bg-white border border-slate-200 text-center">
                    <p className="font-bold text-uew-navy text-xs">Vice President</p>
                    <p className="text-[10px] text-slate-500 mt-1">TBA</p>
                  </div>
                  <div className="flex-1 p-3 rounded-xl bg-white border border-slate-200 text-center">
                    <p className="font-bold text-uew-navy text-xs">Secretary General</p>
                    <p className="text-[10px] text-slate-500 mt-1">TBA</p>
                  </div>
                </div>
                {/* Connector */}
                <div className="w-0.5 h-6 bg-slate-300" />
                {/* Departments */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-sm">
                  {['Welfare', 'Publicity', 'Finance', 'Organising Sec.'].map((dept) => (
                    <div key={dept} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                      <p className="text-[10px] font-bold text-slate-600">{dept}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">TBA</p>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-500 text-center italic">Leadership positions marked TBA are yet to be filled. Updates will be posted here as elections conclude.</p>
            </div>
          </ScrollSection>

          {/* 3. Gallery */}
          <ScrollSection
            id="gallery"
            title="DESA Gallery"
            subtitle="Moments from our activities and events"
            icon={Image}
            accentColor="gold"
          >
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 hover:border-uew-red/40 hover:bg-red-50 transition-colors cursor-pointer group"
                  >
                    <Image className="w-6 h-6 text-slate-300 group-hover:text-uew-red transition-colors" />
                    <span className="text-[10px] text-slate-400 group-hover:text-uew-red font-semibold transition-colors">Photo {i}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 text-center mt-4">
                Gallery photos will be uploaded soon. Stay tuned for event highlights and community moments.
              </p>
            </div>
          </ScrollSection>

          {/* 4. Constitution */}
          <ScrollSection
            id="constitution"
            title="DESA Constitution"
            subtitle="Governing document of the association"
            icon={ScrollText}
            accentColor="red"
          >
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-black text-uew-navy text-base mb-2">Preamble</h3>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  We, the members of the Distance Learning Students Association (DESA) of the University of Education, Winneba, in order to promote unity, advocate for student welfare, and ensure effective representation of distance learners, do hereby ordain and establish this Constitution.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { art: 'Article 1', title: 'Name & Status', desc: 'Association name, legal status, and recognition.' },
                  { art: 'Article 2', title: 'Membership', desc: 'Eligibility, rights, and obligations of members.' },
                  { art: 'Article 3', title: 'Officers & Duties', desc: 'Executive positions, terms, and responsibilities.' },
                  { art: 'Article 4', title: 'Meetings & Elections', desc: 'AGM procedures, election timelines, and quorum.' },
                  { art: 'Article 5', title: 'Finance', desc: 'Funding sources, financial oversight, and audits.' },
                  { art: 'Article 6', title: 'Amendments', desc: 'Process for constitutional changes and revisions.' },
                ].map((a) => (
                  <div key={a.art} className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold text-uew-red uppercase tracking-wider">{a.art}</span>
                    <p className="font-bold text-uew-navy text-sm mt-0.5">{a.title}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{a.desc}</p>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-uew-red text-white text-xs font-bold hover:bg-uew-redHover transition-colors cursor-pointer shadow-sm">
                  <ScrollText className="w-4 h-4" />
                  Download Full Constitution (PDF)
                </button>
              </div>
            </div>
          </ScrollSection>

          {/* 5. Archives */}
          <ScrollSection
            id="archives"
            title="DESA Archives"
            subtitle="Historical records, past reports & documents"
            icon={Archive}
            accentColor="navy"
          >
            <div className="space-y-3">
              {[
                { year: '2024/2025', title: 'Annual Report', type: 'PDF' },
                { year: '2023/2024', title: 'Annual Report', type: 'PDF' },
                { year: '2022/2023', title: 'Constitution Review', type: 'PDF' },
                { year: '2021/2022', title: 'Activity Summary', type: 'PDF' },
              ].map((doc, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200 hover:border-uew-navy/30 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
                    <Archive className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-uew-navy truncate">{doc.title}</p>
                    <p className="text-[10px] text-slate-500">{doc.year}</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg shrink-0">{doc.type}</span>
                </div>
              ))}
              <p className="text-xs text-slate-500 text-center italic">Older archives will be digitised and made available over time.</p>
            </div>
          </ScrollSection>

          {/* 6. Asset Register */}
          <ScrollSection
            id="assets"
            title="Asset Register"
            subtitle="DESA property and equipment inventory"
            icon={Building2}
            accentColor="gold"
          >
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                A comprehensive inventory of all DESA-owned assets, equipment, and resources held in custody for the association.
              </p>
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
                    {[
                      ['1', 'Laptops', 'Dell Latitude × 4', '2024', 'Good'],
                      ['2', 'Projector', 'Epson EB-S04', '2023', 'Good'],
                      ['3', 'Sound System', 'Portable PA set', '2023', 'Fair'],
                      ['4', 'Furniture', 'Tables & chairs (×20)', '2022', 'Good'],
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                        {row.map((cell, j) => (
                          <td key={j} className={`py-2 px-2 ${j === 0 ? 'font-mono text-slate-400' : 'font-semibold text-uew-navy'} ${j === 4 ? 'text-emerald-600' : 'text-slate-600'}`}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-center pt-2">
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-uew-navy text-white text-xs font-bold hover:bg-uew-red transition-colors cursor-pointer">
                  <Building2 className="w-3.5 h-3.5" />
                  Download Full Register
                </button>
              </div>
            </div>
          </ScrollSection>

          {/* 7. Announcements & Activities */}
          <ScrollSection
            id="activities"
            title="Announcements & Activities"
            subtitle="Latest news, events, and updates"
            icon={Megaphone}
            accentColor="red"
          >
            <div className="space-y-4">
              {[
                { date: '15 Sep 2025', title: 'DESA Annual General Meeting 2025', body: 'The annual general meeting for all registered distance learning students will hold at the UEW Main Campus. All regional representatives are expected to attend.', tag: 'Event' },
                { date: '01 Sep 2025', title: '2025/2026 Academic Registration Opens', body: 'Registration for the new academic year is now open. Visit your regional study center coordinator for enrollment assistance.', tag: 'Notice' },
                { date: '20 Aug 2025', title: 'DESA Leadership Elections Scheduled', body: 'Nominations for the 2025/2026 DESA executive committee are now open. Submit your nomination forms to the Returning Officer.', tag: 'Election' },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-uew-red/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${item.tag === 'Event' ? 'bg-red-100 text-uew-red' : item.tag === 'Notice' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {item.tag}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-slate-400 font-semibold">{item.date}</p>
                      <h4 className="font-bold text-uew-navy text-sm mt-0.5">{item.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                </div>
              ))}
              <p className="text-xs text-slate-500 text-center italic">New announcements will appear here as they are published.</p>
            </div>
          </ScrollSection>

          {/* 8. Committee */}
          <ScrollSection
            id="committee"
            title="Committees"
            subtitle="Standing and ad-hoc committees of DESA"
            icon={UserCog}
            accentColor="navy"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: 'Welfare Committee', chair: 'TBA', members: 5, desc: 'Student welfare, disputes, and support services.' },
                { name: 'Academic Affairs', chair: 'TBA', members: 4, desc: 'Tutorial coordination, exam support, and academic advocacy.' },
                { name: 'Publicity & Media', chair: 'TBA', members: 4, desc: 'Communications, social media, and public relations.' },
                { name: 'Finance & Grants', chair: 'TBA', members: 3, desc: 'Budget oversight, fund allocation, and financial reporting.' },
                { name: 'Events & Logistics', chair: 'TBA', members: 5, desc: 'Event planning, venue coordination, and logistics.' },
                { name: 'Legal & Constitutional', chair: 'TBA', members: 3, desc: 'Constitutional compliance, policy review, and legal matters.' },
              ].map((committee, i) => (
                <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-uew-navy/30 hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center">
                      <UserCog className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <h4 className="font-bold text-uew-navy text-sm">{committee.name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">{committee.desc}</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    <span className="font-semibold">Chair: <span className="text-slate-700">{committee.chair}</span></span>
                    <span>·</span>
                    <span>{committee.members} members</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollSection>

        </div>
      </div>

      {/* Footer */}
      <footer className="py-5 px-4 text-center border-t border-slate-200 bg-white">
        <p className="text-[10px] text-slate-400 font-medium">Education for Service · DESA · UEW</p>
      </footer>
    </div>
  );
}
