import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Camera, Image, FileText, Command, Loader2, X } from 'lucide-react';
import { searchAPI } from '../../lib/api';
import { cn } from '../../lib/utils';
import { Badge } from '../ui';

const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Toggle modal with CMD+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search when query changes
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchAPI.globalSearch({ q: query });
        setResults(res.data?.data || []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (item) => {
    setIsOpen(false);
    setQuery('');
    
    switch (item.type) {
      case 'user': navigate(`/admin/users/${item.id}`); break;
      case 'session': navigate(`/admin/sessions/${item.id}`); break;
      case 'photo': navigate(`/admin/photos/${item.id}`); break;
      case 'template': navigate(`/admin/templates/${item.id}`); break;
      default: break;
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'user': return <User className="h-4 w-4" />;
      case 'session': return <Camera className="h-4 w-4" />;
      case 'photo': return <Image className="h-4 w-4" />;
      case 'template': return <FileText className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)}
      className="hidden items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground transition-all hover:bg-muted md:flex w-64 lg:w-80"
    >
      <Search className="h-4 w-4" />
      <span className="flex-1 text-left">Search...</span>
      <div className="flex items-center gap-1 rounded border bg-background px-1 text-[10px] font-medium opacity-50">
        <Command className="h-3 w-3" />
        <span>K</span>
      </div>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-background/80 pt-[15vh] backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        ref={containerRef}
        className="w-full max-w-2xl overflow-hidden rounded-xl border bg-card shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center border-b px-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            autoFocus
            className="h-14 w-full bg-transparent px-4 text-sm focus:outline-none"
            placeholder="Search for users, sessions, templates..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <button 
            onClick={() => setIsOpen(false)}
            className="rounded p-1 hover:bg-muted"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query.length < 2 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Command className="mx-auto mb-4 h-8 w-8 opacity-20" />
              <p>Type at least 2 characters to start searching.</p>
              <p className="mt-1 text-xs opacity-50">Press ESC to close.</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-4 py-3 text-left transition-colors",
                    activeIndex === idx ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{item.subtitle}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase">{item.type}</Badge>
                </button>
              ))}
            </div>
          ) : !loading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              <p>No results found for "{query}".</p>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-4 border-t bg-muted/30 px-4 py-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <kbd className="rounded border bg-background px-1.5 py-0.5">Enter</kbd>
            <span>to select</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="rounded border bg-background px-1.5 py-0.5">↑↓</kbd>
            <span>to navigate</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="rounded border bg-background px-1.5 py-0.5">Esc</kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
