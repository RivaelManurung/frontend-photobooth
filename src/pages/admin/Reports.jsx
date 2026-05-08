import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { 
  TrendingUp, Users, CreditCard, Camera, Calendar, 
  Download, Filter, RefreshCw 
} from 'lucide-react';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Badge, Spinner, Separator
} from '../../components/ui';
import { adminAPI } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';

const Reports = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [templateData, setTemplateData] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [revRes, tempRes, growthRes, statsRes] = await Promise.all([
        adminAPI.getRevenue({ period: 'last-30-days' }),
        adminAPI.getTemplateAnalytics(),
        adminAPI.getUserGrowth(),
        adminAPI.getStats()
      ]);

      setRevenueData(revRes.data?.data || []);
      setTemplateData(tempRes.data?.data || []);
      setGrowthData(growthRes.data?.data || []);
      setStats(statsRes.data?.data || null);
    } catch (error) {
      console.error('Error fetching report data:', error);
      addToast('Failed to load report data', 'error');
      
      // Fallback sample data for demonstration if API fails
      setRevenueData([
        { date: '2026-05-01', revenue: 450 },
        { date: '2026-05-02', revenue: 520 },
        { date: '2026-05-03', revenue: 610 },
        { date: '2026-05-04', revenue: 480 },
        { date: '2026-05-05', revenue: 700 },
        { date: '2026-05-06', revenue: 850 },
        { date: '2026-05-07', revenue: 920 },
      ]);
      setTemplateData([
        { name: 'Minimalist', usage: 145 },
        { name: 'Retro Vibes', usage: 98 },
        { name: 'Summer Party', usage: 76 },
        { name: 'Wedding Classic', usage: 112 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">Detailed overview of revenue, usage, and growth.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <h3 className="text-2xl font-bold">${stats?.totalRevenue?.toLocaleString() || '0'}</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-green-500">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                <h3 className="text-2xl font-bold">{stats?.totalSessions?.toLocaleString() || '0'}</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Camera className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-green-500">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>+8.2% from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <h3 className="text-2xl font-bold">{stats?.totalUsers?.toLocaleString() || '0'}</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-green-500">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>+5.4% from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <h3 className="text-2xl font-bold">3.2%</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-red-500">
              <span>-1.2% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
            <CardDescription>Daily revenue for the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12}}
                    tickFormatter={(str) => {
                      const date = new Date(str);
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Template Usage Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Template Popularity</CardTitle>
            <CardDescription>Most used templates across all sessions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={templateData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12}}
                    width={100}
                  />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Bar dataKey="usage" radius={[0, 4, 4, 0]}>
                    {templateData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${1 - index * 0.15})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest events and interactions.</CardDescription>
            </div>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-muted p-2">
                    <Camera className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New Session Started</p>
                    <p className="text-xs text-muted-foreground">Session #SESS-2026-050{i} • User: John Doe</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline">Success</Badge>
                  <p className="mt-1 text-[10px] text-muted-foreground">2 mins ago</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
