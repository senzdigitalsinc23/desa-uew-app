import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  GraduationCap,
  Building2,
  Hotel,
  Activity,
  Utensils,
  LogOut,
  Menu,
  X,
  FolderOpen,
  Users,
  Info,
  ScrollText,
  Archive,
  Building,
  Megaphone,
  UserCog,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const GROUPS = [
  {
    label: 'Dashboard',
    items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Center Management',
    items: [
      { id: 'regions', label: 'Regions', icon: MapPin },
      { id: 'programs', label: 'Programs', icon: GraduationCap },
      { id: 'centers', label: 'Centers', icon: Building2 },
      { id: 'hotels', label: 'Hotels', icon: Hotel },
      { id: 'health', label: 'Health Facilities', icon: Activity },
      { id: 'restaurants', label: 'Restaurants', icon: Utensils },
    ],
  },
  {
    label: 'DESA Hub',
    items: [
      { id: 'hub-about', label: 'About DESA', icon: Info },
      { id: 'hub-leadership', label: 'Leadership Tree', icon: Users },
      { id: 'hub-constitution', label: 'Constitution', icon: ScrollText },
      { id: 'hub-archives', label: 'Archives', icon: Archive },
      { id: 'hub-assets', label: 'Asset Register', icon: Building },
      { id: 'hub-activities', label: 'Activities', icon: Megaphone },
      { id: 'hub-committee', label: 'Committees', icon: UserCog },
    ],
  },
];

function NavItem({ item, isActive, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 sm:gap-3 px-2.5 sm:px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
        isActive
          ? 'bg-uew-red text-white shadow-md'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
      <span className="truncate">{item.label}</span>
      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shrink-0" />}
    </button>
  );
}

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [expandedGroups, setExpandedGroups] = React.useState({});

  React.useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setActiveTab(hash);
      for (const group of GROUPS) {
        if (group.items.some((item) => item.id === hash)) {
          setExpandedGroups((prev) => ({ ...prev, [group.label]: true }));
        }
      }
    }
  }, []);

  const handleNavClick = (id) => {
    setActiveTab(id);
    setSidebarOpen(false);
    window.location.hash = id;
    navigate(`/admin/${id}`);
  };

  const toggleGroup = (label) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeItem = GROUPS.flatMap((g) => g.items).find((item) => item.id === activeTab);

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex">
      {/* Overlay — mobile only */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-200 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-60 sm:w-64
          bg-uew-navy text-white flex flex-col shadow-2xl lg:shadow-none
          transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <img src="/logo.svg" alt="UEW" className="w-6 h-6 opacity-90" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest">DESA</p>
              <p className="text-[10px] text-slate-400 font-semibold">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-5 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-uew-red flex items-center justify-center text-xs font-black shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || ''}</p>
            </div>
            <span className="px-1.5 py-0.5 rounded-md bg-uew-red/20 text-uew-red text-[9px] font-extrabold uppercase shrink-0">
              {user?.role || 'admin'}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 sm:py-3 px-2 sm:px-3">
          {GROUPS.map((group) => {
            const isExpanded = expandedGroups[group.label];
            return (
              <div key={group.label} className="mb-1">
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                  <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{group.label}</span>
                </button>
                {/* Group items */}
                {isExpanded && (
                  <div className="mt-0.5 ml-2 space-y-0.5">
                    {group.items.map((item) => (
                      <NavItem
                        key={item.id}
                        item={item}
                        isActive={activeTab === item.id}
                        onClick={() => handleNavClick(item.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${sidebarOpen ? 'lg:ml-0 ml-60 sm:ml-64' : 'ml-0'}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer shrink-0"
              >
                {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-1 h-5 rounded-full bg-uew-red shrink-0" />
                <div className="min-w-0">
                  <h1 className="text-xs sm:text-sm font-black text-uew-navy uppercase tracking-wider truncate">
                    {activeItem?.label || 'Dashboard'}
                  </h1>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">
                    Manage {activeItem?.label?.toLowerCase()} data
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => navigate('/')}
                className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] sm:text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                <span className="hidden xs:inline">View Site</span>
                <span className="xs:hidden">Site</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-2 py-1.5 rounded-lg bg-uew-red hover:bg-uew-redHover text-white text-[10px] sm:text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                <LogOut className="w-3 h-3 xs:hidden" />
                <span className="hidden xs:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-3 sm:p-4 md:p-5 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
