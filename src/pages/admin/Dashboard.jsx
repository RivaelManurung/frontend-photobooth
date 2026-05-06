import { useEffect, useState } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Input, Tabs, TabsList, TabsTrigger, TabsContent,
  Badge, Avatar, AvatarFallback, Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  Checkbox, Select 
} from '../../components/ui';
import { Users, DollarSign, CreditCard, MoreVertical, TrendingUp, TrendingDown, ChevronDown, Activity, Download } from 'lucide-react';
import { adminAPI } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../../lib/utils';


const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [growth, setGrowth] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayments, setSelectedPayments] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, revenueRes, growthRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getRevenue({ period: 'month' }),
        adminAPI.getUserGrowth(),
      ]);

      setStats(statsRes.data);
      setRevenue(revenueRes.data.report || []);
      setGrowth(growthRes.data.growth || []);
      
      setPayments([
        { id: 1, email: 'ken99@yahoo.com', status: 'Success', amount: 316.00 },
        { id: 2, email: 'abel45@gmail.com', status: 'Success', amount: 242.00 },
        { id: 3, email: 'monserrat44@gmail.com', status: 'Processing', amount: 837.00 },
        { id: 4, email: 'carmella@hotmail.com', status: 'Failed', amount: 721.00 },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePaymentSelection = (id) => {
    setSelectedPayments(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const toggleAllPayments = () => {
    if (selectedPayments.length === payments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(payments.map(p => p.id));
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const mainStats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.total_revenue || 0),
      description: `Monthly: ${formatCurrency(stats?.monthly_revenue || 0)}`,
      icon: DollarSign,
    },
    {
      title: 'Total Users',
      value: stats?.total_users?.toLocaleString() || '0',
      description: `${stats?.new_users_today || 0} joined today`,
      icon: Users,
    },
    {
      title: 'Total Photos',
      value: stats?.total_photos?.toLocaleString() || '0',
      description: `${stats?.photos_today || 0} captured today`,
      icon: CreditCard,
    },
    {
      title: 'Active Now',
      value: stats?.active_users?.toLocaleString() || '0',
      description: 'Active in last 30 days',
      icon: Activity,
    },
  ];


  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button size="sm">Create New</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {mainStats.map((stat, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>
                  Your sales performance over time.
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={revenue}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                        fontSize: '12px',
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorAmount)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>
                  You made 265 sales this month.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{payment.email.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{payment.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.status}
                        </p>
                      </div>
                      <div className="ml-auto font-medium">+${payment.amount.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Detailed insights into your business performance.</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground italic">
              Analytics visualization coming soon...
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
