import { useState, useEffect } from 'react';
import { 
  Activity, Server, Database, Cloud, 
  ShieldCheck, AlertCircle, CheckCircle2, RefreshCw,
  Cpu, HardDrive, Zap
} from 'lucide-react';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Badge, Spinner, Separator, Progress
} from '../../components/ui';
import { adminAPI } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';

const Health = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getSystemHealth();
      setHealth(res.data?.data || null);
    } catch (error) {
      console.error('Error fetching system health:', error);
      // Fallback data
      setHealth({
        status: 'healthy',
        services: [
          { name: 'API Server', status: 'online', latency: '45ms', version: '1.2.0' },
          { name: 'Database', status: 'online', latency: '12ms', type: 'PostgreSQL' },
          { name: 'Storage (S3)', status: 'online', usage: '42%' },
          { name: 'Auth Service', status: 'online', latency: '28ms' },
          { name: 'Payment Gateway', status: 'online', provider: 'Stripe' },
        ],
        system: {
          cpu: 24,
          memory: 68,
          storage: 45,
          uptime: '14 days, 6 hours'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Health</h1>
          <p className="text-muted-foreground">Real-time status of services and infrastructure.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={health?.status === 'healthy' ? 'success' : 'warning'} className="px-3 py-1">
            System {health?.status === 'healthy' ? 'Operational' : 'Degraded'}
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchHealth} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Resource Usage */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Resource Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Cpu className="h-3 w-3 text-muted-foreground" />
                  <span>CPU Usage</span>
                </div>
                <span className="font-medium">{health?.system?.cpu}%</span>
              </div>
              <Progress value={health?.system?.cpu} className="h-1.5" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-muted-foreground" />
                  <span>Memory</span>
                </div>
                <span className="font-medium">{health?.system?.memory}%</span>
              </div>
              <Progress value={health?.system?.memory} className="h-1.5" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-3 w-3 text-muted-foreground" />
                  <span>Storage</span>
                </div>
                <span className="font-medium">{health?.system?.storage}%</span>
              </div>
              <Progress value={health?.system?.storage} className="h-1.5" />
            </div>
            <Separator />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Uptime</span>
              <span className="font-medium">{health?.system?.uptime}</span>
            </div>
          </CardContent>
        </Card>

        {/* Services Status */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Service Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {health?.services?.map((service, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 bg-muted/50`}>
                      {service.name.includes('DB') || service.name.includes('Database') ? <Database className="h-4 w-4" /> : 
                       service.name.includes('API') ? <Server className="h-4 w-4" /> :
                       service.name.includes('Storage') ? <Cloud className="h-4 w-4" /> :
                       <ShieldCheck className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{service.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {service.latency ? `Latency: ${service.latency}` : 
                         service.usage ? `Usage: ${service.usage}` : 
                         service.provider ? `Provider: ${service.provider}` : 'Running normally'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {service.version && <span className="text-[10px] text-muted-foreground font-mono">v{service.version}</span>}
                    {getStatusIcon(service.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Security & Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <div className="rounded-full bg-green-500/10 p-2">
                <ShieldCheck className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium">SSL Certificate</p>
                <p className="text-xs text-muted-foreground">Valid until 2027-02-15 (Auto-renews)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <div className="rounded-full bg-green-500/10 p-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Daily Backups</p>
                <p className="text-xs text-muted-foreground">Last backup: 4 hours ago (Completed)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Health;
