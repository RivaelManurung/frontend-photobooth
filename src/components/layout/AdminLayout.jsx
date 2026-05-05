import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const location = useLocation();
  
  // Map routes to titles
  const getPageTitle = (pathname) => {
    const path = pathname.split('/')[2] || 'overview';
    switch (path) {
      case 'overview': return 'Dashboard Overview';
      case 'users': return 'Users Management';
      case 'photos': return 'Photos Gallery';
      case 'sessions': return 'Active Sessions';
      case 'payments': return 'Payments & Revenue';
      case 'promos': return 'Promo Codes';
      case 'templates': return 'Template Library';
      case 'settings': return 'System Settings';
      default: return 'Dashboard';
    }
  };

  const title = getPageTitle(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto bg-[#F0F0F0] p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
