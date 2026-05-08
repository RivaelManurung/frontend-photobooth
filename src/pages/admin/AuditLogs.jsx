import { useState, useEffect } from 'react';
import { 
  FileText, Search, Filter, Download, 
  Calendar, User, Shield, Info, AlertTriangle, RefreshCw
} from 'lucide-react';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Badge, Spinner, Separator, Avatar, AvatarFallback
} from '../../components/ui';
import { auditAPI } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { formatDateTime } from '../../lib/utils';

const AuditLogs = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditAPI.getAuditLogs();
      setLogs(res.data?.data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      addToast('Failed to load audit logs', 'error');
      
      // Fallback data
      setLogs([
        { id: 1, action: 'LOGIN', user: { name: 'Admin', email: 'admin@photobooth.com' }, ip: '192.168.1.1', timestamp: new Date().toISOString(), details: 'Admin logged in successfully' },
        { id: 2, action: 'UPDATE_TEMPLATE', user: { name: 'Admin', email: 'admin@photobooth.com' }, ip: '192.168.1.1', timestamp: new Date(Date.now() - 3600000).toISOString(), details: 'Updated template: Minimalist' },
        { id: 3, action: 'DELETE_PHOTO', user: { name: 'Admin', email: 'admin@photobooth.com' }, ip: '192.168.1.1', timestamp: new Date(Date.now() - 7200000).toISOString(), details: 'Deleted photo ID: #PH-123' },
        { id: 4, action: 'CREATE_PROMO', user: { name: 'Admin', email: 'admin@photobooth.com' }, ip: '192.168.1.1', timestamp: new Date(Date.now() - 86400000).toISOString(), details: 'Created promo code: SUMMER2026' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    if (action.includes('DELETE')) return 'destructive';
    if (action.includes('CREATE')) return 'success';
    if (action.includes('UPDATE')) return 'warning';
    return 'default';
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">Track all administrative actions and security events.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchLogs}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search logs by action, user, or details..."
                className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Timestamp</th>
                  <th className="pb-3 pr-4 font-medium">User</th>
                  <th className="pb-3 pr-4 font-medium">Action</th>
                  <th className="pb-3 pr-4 font-medium">Details</th>
                  <th className="pb-3 font-medium">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="py-4">
                        <div className="h-12 w-full rounded bg-muted/50"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/50">
                      <td className="py-4 pr-4 text-xs font-medium whitespace-nowrap">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px]">{log.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-xs">{log.user.name}</span>
                            <span className="text-[10px] text-muted-foreground">{log.user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <Badge variant={getActionColor(log.action)} className="text-[10px] px-1.5 py-0">
                          {log.action}
                        </Badge>
                      </td>
                      <td className="py-4 pr-4 text-xs text-muted-foreground max-w-xs truncate">
                        {log.details}
                      </td>
                      <td className="py-4 text-xs text-muted-foreground font-mono">
                        {log.ip}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      No logs found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;
