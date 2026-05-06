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
  User,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button, Separator } from '../ui';


const NAV_ITEMS = [
  { type: 'label', label: 'General' },
  {
    key: 'dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    path: '/admin',
  },
  { type: 'label', label: 'Management' },
  { key: 'users',     icon: Users,         label: 'Users',       path: '/admin/users' },
  { key: 'photos',    icon: Image,          label: 'Photos',      path: '/admin/photos' },
  { key: 'templates', icon: FileText,        label: 'Templates',   path: '/admin/templates' },
  { key: 'sessions',  icon: Camera,          label: 'Sessions',    path: '/admin/sessions' },
  { type: 'label', label: 'Finance' },
  { key: 'payments',  icon: CreditCard,      label: 'Payments',    path: '/admin/payments' },
  { key: 'promos',    icon: Tag,             label: 'Promo Codes', path: '/admin/promos' },
  { type: 'label', label: 'System' },
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
    <div className="flex h-screen w-64 flex-col border-r bg-muted/30">
      {/* Brand */}
      <div className="flex h-16 items-center px-6 gap-3 flex-shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Camera className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight">PhotoBooth</span>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Admin Panel</span>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {NAV_ITEMS.map((item, idx) => {
            if (item.type === 'label') {
              return (
                <div key={`label-${idx}`} className="px-3 py-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {item.label}
                  </span>
                </div>
              );
            }

            const Icon = item.icon;
            const active = isActive(item.path);
            const expanded = expandedMenus.includes(item.key);
            const hasSubmenu = item.submenu?.length > 0;

            if (hasSubmenu) {
              return (
                <div key={item.key} className="space-y-1">
                  <button
                    onClick={() => toggleMenu(item.key)}
                    className={cn(
                      "group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </div>
                    {expanded ? (
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    ) : (
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    )}
                  </button>
                  {expanded && (
                    <div className="ml-4 space-y-1 border-l pl-2">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          className={cn(
                            "block rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                            location.pathname === sub.path 
                              ? "bg-accent text-accent-foreground" 
                              : "text-muted-foreground"
                          )}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.key}
                to={item.path}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Footer */}
      <div className="mt-auto border-t p-4">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-4 w-4" />
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-xs font-semibold">{user?.name || 'Admin'}</span>
            <span className="truncate text-[10px] text-muted-foreground">{user?.email || 'admin@photobooth.com'}</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
