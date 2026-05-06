import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const location = useLocation();
  
  // Map routes to titles
  const getPageTitle = (pathname) => {
    const path = pathname.split('/')[2] || 'overview';
    switch (path) {
      case 'overview': return 'Overview';
      case 'users': return 'Users';
      case 'photos': return 'Photos';
      case 'sessions': return 'Sessions';
      case 'payments': return 'Payments';
      case 'promos': return 'Promo Codes';
      case 'templates': return 'Templates';
      case 'settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  const title = getPageTitle(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6 lg:p-8">
          <div className="w-full h-full">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default Layout;
