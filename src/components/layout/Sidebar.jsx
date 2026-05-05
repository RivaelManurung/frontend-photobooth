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
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4 gap-3 flex-shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Camera className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <div className="text-sm font-semibold">PhotoBooth</div>
          <div className="text-xs text-muted-foreground">Admin Panel</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            // Section separator
            if (item.type === 'section') {
              return (
                <div key={item.key} className="px-3 pb-1 pt-4 first:pt-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
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
                      'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </div>
                    {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )}

                {/* Submenu */}
                {hasSubmenu && expanded && (
                  <div className="ml-7 mt-0.5 space-y-0.5">
                    {item.submenu.map((sub) => (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        className={cn(
                          'block rounded-md px-3 py-1.5 text-sm transition-colors',
                          location.pathname === sub.path
                            ? 'text-accent-foreground font-medium'
                            : 'text-muted-foreground hover:text-accent-foreground'
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
      <div className="border-t p-3 flex-shrink-0">
        <div className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent/50">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.name || 'Admin'}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email || 'admin@photobooth.com'}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
