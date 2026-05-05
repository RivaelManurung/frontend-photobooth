import { Bell, Search, Calendar, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../ui/Button';

const Header = ({ title = "Dashboard", showActions = true }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b-[3px] border-black bg-white px-6">
      {/* Left Section - Title & Search */}
      <div className="flex flex-1 items-center gap-4">
        <h1 className="text-2xl font-black uppercase tracking-tighter">{title}</h1>
        
        <div className="relative ml-8 w-96">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-black" />
          <input
            type="text"
            placeholder="SEARCH ANYTHING..."
            className="h-10 w-full border-[3px] border-black bg-white pl-10 pr-4 text-xs font-bold uppercase focus:bg-[var(--neo-yellow)] focus:outline-none neo-shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Right Section - Actions */}
      {showActions && (
        <div className="flex items-center gap-4">
          <Button className="neo-btn-primary h-10 px-4 text-xs font-black">
            <Download className="mr-2 h-4 w-4" />
            EXPORT
          </Button>
          
          <button className="relative border-[3px] border-black bg-white p-2 neo-shadow hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
            <Bell className="h-5 w-5" />
            <span className="absolute right-[-4px] top-[-4px] h-4 w-4 border-[2px] border-black bg-[var(--neo-pink)] text-[10px] font-black flex items-center justify-center">2</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
