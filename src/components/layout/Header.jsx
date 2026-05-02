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
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      {/* Left Section - Title & Search */}
      <div className="flex flex-1 items-center gap-4">
        <h1 className="text-xl font-semibold">{title}</h1>
        
        <div className="relative ml-4 w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search"
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Right Section - Actions */}
      {showActions && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Pick a date
          </Button>

          <button className="relative rounded-md p-2 hover:bg-accent">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive"></span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
