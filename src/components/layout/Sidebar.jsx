import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Image, 
  FileText, 
  CreditCard, 
  Tag, 
  Settings,
  LogOut,
  Camera,
  ChevronDown,
  ChevronRight,
  User,
  Bell,
  Key,
  Link2,
  FileCode,
  Activity
} from 'lucide-react';
import { cn } from '../../lib/utils';

const Sidebar = () => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState(['dashboard']);
  const [user] = useState(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });

  const toggleMenu = (key) => {
    setExpandedMenus(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const menuItems = [
    {
      key: 'general',
      label: 'General',
      type: 'section'
    },
    { 
      key: 'dashboard',
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: '/admin',
      submenu: [
        { label: 'Dashboard 1', path: '/admin' },
        { label: 'Dashboard 2', path: '/admin/dashboard-2' },
        { label: 'Dashboard 3', path: '/admin/dashboard-3' },
      ]
    },
    { 
      key: 'tasks',
      icon: FileCode, 
      label: 'Tasks', 
      path: '/admin/tasks'
    },
    { 
      key: 'users',
      icon: Users, 
      label: 'Users', 
      path: '/admin/users'
    },
    {
      key: 'pages',
      label: 'Pages',
      type: 'section'
    },
    { 
      key: 'photos',
      icon: Image, 
      label: 'Photos', 
      path: '/admin/photos'
    },
    { 
      key: 'templates',
      icon: FileText, 
      label: 'Templates', 
      path: '/admin/templates'
    },
    { 
      key: 'payments',
      icon: CreditCard, 
      label: 'Payments', 
      path: '/admin/payments'
    },
    { 
      key: 'promos',
      icon: Tag, 
      label: 'Promo Codes', 
      path: '/admin/promos'
    },
    { 
      key: 'sessions',
      icon: Camera, 
      label: 'Sessions', 
      path: '/admin/sessions'
    },
    {
      key: 'other',
      label: 'Other',
      type: 'section'
    },
    { 
      key: 'settings',
      icon: Settings, 
      label: 'Settings', 
      path: '/admin/settings',
      submenu: [
        { label: 'General', path: '/admin/settings' },
        { label: 'Profile', path: '/admin/settings/profile' },
        { label: 'Billing', path: '/admin/settings/billing' },
        { label: 'Plans', path: '/admin/settings/plans' },
        { label: 'Connected Apps', path: '/admin/settings/apps' },
        { label: 'Notifications', path: '/admin/settings/notifications' },
      ]
    },
    {
      key: 'developers',
      icon: FileCode,
      label: 'Developers',
      path: '/admin/developers',
      submenu: [
        { label: 'Overview', path: '/admin/developers' },
        { label: 'API Keys', path: '/admin/developers/api-keys' },
        { label: 'Webhooks', path: '/admin/developers/webhooks' },
        { label: 'Events/Logs', path: '/admin/developers/logs' },
      ]
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const isPathActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin' || location.pathname === '/admin/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Camera className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="ml-2">
          <div className="text-sm font-semibold">PhotoBooth</div>
          <div className="text-xs text-muted-foreground">Admin Panel</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            if (item.type === 'section') {
              return (
                <div key={item.key} className="px-3 py-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {item.label}
                  </div>
                </div>
              );
            }

            const Icon = item.icon;
            const isActive = isPathActive(item.path);
            const isExpanded = expandedMenus.includes(item.key);
            const hasSubmenu = item.submenu && item.submenu.length > 0;

            return (
              <div key={item.key}>
                {hasSubmenu ? (
                  <button
                    onClick={() => toggleMenu(item.key)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )}

                {/* Submenu */}
                {hasSubmenu && isExpanded && (
                  <div className="ml-7 mt-1 space-y-1">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className={cn(
                          "block rounded-md px-3 py-1.5 text-sm transition-colors",
                          location.pathname === subItem.path
                            ? "text-accent-foreground font-medium"
                            : "text-muted-foreground hover:text-accent-foreground"
                        )}
                      >
                        {subItem.label}
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
      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent/50 cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.name || 'Admin'}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email || 'admin@photobooth.com'}</div>
          </div>
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
