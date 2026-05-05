import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Image,
  FileText,
  CreditCard,
  Tag,
  Settings,
  LogOut,
  Camera,
  Users,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
  { type: 'section', key: 's1', label: 'General' },
  {
    key: 'dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    path: '/admin',
  },
  { type: 'section', key: 's2', label: 'Management' },
  { key: 'users',     icon: Users,         label: 'Users',       path: '/admin/users' },
  { key: 'photos',    icon: Image,          label: 'Photos',      path: '/admin/photos' },
  { key: 'templates', icon: FileText,        label: 'Templates',   path: '/admin/templates' },
  { key: 'sessions',  icon: Camera,          label: 'Sessions',    path: '/admin/sessions' },
  { type: 'section', key: 's3', label: 'Finance' },
  { key: 'payments',  icon: CreditCard,      label: 'Payments',    path: '/admin/payments' },
  { key: 'promos',    icon: Tag,             label: 'Promo Codes', path: '/admin/promos' },
  { type: 'section', key: 's4', label: 'System' },
  {
    key: 'settings',
    icon: Settings,
    label: 'Settings',
    path: '/admin/settings',
    submenu: [
      { label: 'General',  path: '/admin/settings' },
      { label: 'Profile',  path: '/admin/settings/profile' },
    ],
  },
];

const Sidebar = () => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState([]);
  const [user] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  });

  const toggleMenu = (key) =>
    setExpandedMenus((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin' || location.pathname === '/admin/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r-[3px] border-black bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b-[3px] border-black px-4 gap-3 flex-shrink-0 bg-[var(--neo-yellow)]">
        <div className="flex h-10 w-10 items-center justify-center border-[3px] border-black bg-black neo-shadow">
          <Camera className="h-6 w-6 text-white" />
        </div>
        <div>
          <div className="text-lg font-black uppercase tracking-tighter leading-none">PhotoBooth</div>
          <div className="text-[10px] font-bold uppercase opacity-70">Admin Panel</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {NAV_ITEMS.map((item) => {
            if (item.type === 'section') {
              return (
                <div key={item.key} className="px-1 pb-1 pt-4 first:pt-0">
                  <div className="text-[10px] font-black uppercase tracking-widest text-black/40">
                    {item.label}
                  </div>
                </div>
              );
            }

            const Icon = item.icon;
            const active = isActive(item.path);
            const expanded = expandedMenus.includes(item.key);
            const hasSubmenu = item.submenu?.length > 0;

            return (
              <div key={item.key}>
                {hasSubmenu ? (
                  <button
                    onClick={() => toggleMenu(item.key)}
                    className={cn(
                      'flex w-full items-center justify-between border-[3px] border-black px-3 py-2.5 text-sm font-black uppercase transition-all',
                      active
                        ? 'bg-[var(--neo-cyan)] neo-shadow'
                        : 'bg-white hover:bg-[var(--neo-cyan)]/20'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </div>
                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 border-[3px] border-black px-3 py-2.5 text-sm font-black uppercase transition-all',
                      active
                        ? 'bg-[var(--neo-green)] neo-shadow'
                        : 'bg-white hover:bg-[var(--neo-green)]/20'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                )}

                {/* Submenu */}
                {hasSubmenu && expanded && (
                  <div className="ml-4 mt-2 space-y-2 border-l-[3px] border-black pl-3">
                    {item.submenu.map((sub) => (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        className={cn(
                          'block border-[3px] border-black px-3 py-1.5 text-xs font-bold uppercase transition-all',
                          location.pathname === sub.path
                            ? 'bg-[var(--neo-cyan)] neo-shadow'
                            : 'bg-white hover:bg-[var(--neo-cyan)]/10'
                        )}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="border-t-[3px] border-black p-4 flex-shrink-0 bg-[var(--neo-pink)]">
        <div className="flex items-center gap-3 border-[3px] border-black bg-white p-2 neo-shadow">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border-[3px] border-black bg-black text-white text-sm font-black">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-black uppercase truncate">{user?.name || 'Admin'}</div>
            <div className="text-[10px] font-bold opacity-70 truncate">{user?.email || 'admin@photobooth.com'}</div>
          </div>
          <button
            onClick={handleLogout}
            className="border-[2px] border-black bg-white p-1.5 hover:bg-black hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
