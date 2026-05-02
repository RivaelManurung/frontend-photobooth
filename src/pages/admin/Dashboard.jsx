import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from '../../components/ui/Card';
import { Users, DollarSign, CreditCard, MoreVertical, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';
import { adminAPI } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Button from '../../components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import Badge from '../../components/ui/Badge';
import { Avatar, AvatarFallback } from '../../components/ui/Avatar';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/Table';
import Checkbox from '../../components/ui/Checkbox';
import Select from '../../components/ui/Select';
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
      
      // Mock payments data matching the reference image
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
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'New Subscriptions',
      subtitle: '+180.1% from last month',
      value: '4,682',
      change: '+15.54%',
      trend: 'up',
      icon: Users,
      chartData: [20, 35, 25, 45, 30, 50, 40],
      chartColor: '#ef4444',
    },
    {
      title: 'New Orders',
      subtitle: '+19% from last month',
      value: '1,226',
      change: '+40.2%',
      trend: 'up',
      icon: CreditCard,
      chartData: [30, 20, 40, 25, 45, 35, 50],
      chartColor: '#f97316',
    },
    {
      title: 'Avg Order Revenue',
      subtitle: '+201% from last month',
      value: '1,080',
      change: '+19.8%',
      trend: 'up',
      icon: DollarSign,
      chartData: [15, 25, 20, 35, 30, 40, 45],
      chartColor: '#22c55e',
    },
  ];

  const teamMembers = [
    { name: 'Dale Koman', email: 'dale@example.com', role: 'Member', avatar: 'DK' },
    { name: 'Sofia Davis', email: 'sofia@example.com', role: 'Owner', avatar: 'SD' },
    { name: 'Jackson Lee', email: 'jackson@example.com', role: 'Member', avatar: 'JL' },
    { name: 'Isabella Nguyen', email: 'isabella@example.com', role: 'Member', avatar: 'IN' },
    { name: 'Hasan Ramirez', email: 'hasan@example.com', role: 'Member', avatar: 'HR' },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs value={activeTab} className="space-y-4">
        <TabsList>
          <TabsTrigger 
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger 
            active={activeTab === 'reports'}
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </TabsTrigger>
          <TabsTrigger 
            active={activeTab === 'notifications'}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className={activeTab === 'overview' ? 'block' : 'hidden'}>
          <div className="space-y-4">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {statCards.map((stat, index) => {
                const Icon = stat.icon;
                const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
                
                return (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <CardAction>
                        <button className="text-muted-foreground hover:text-foreground">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </CardAction>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end justify-between">
                        <div className="space-y-1">
                          <div className="text-3xl font-bold">{stat.value}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>{stat.subtitle}</span>
                          </div>
                        </div>
                        
                        {/* Mini Sparkline Chart */}
                        <div className="h-12 w-24">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stat.chartData.map((value, i) => ({ value, index: i }))}>
                              <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke={stat.chartColor}
                                strokeWidth={1.5}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                          Details
                        </Button>
                        <div className={cn(
                          "flex items-center gap-1 text-xs font-medium ml-auto",
                          stat.trend === 'up' ? "text-green-600" : "text-red-600"
                        )}>
                          <TrendIcon className="h-3 w-3" />
                          {stat.change}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-4 md:grid-cols-7">
              {/* Sales Activity Chart - Takes 4 columns */}
              <Card className="md:col-span-4">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Sale Activity - Monthly</CardTitle>
                  <CardDescription className="text-xs">
                    Showing total sales for the last 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenue}>
                      <defs>
                        <linearGradient id="colorRevenue1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorRevenue2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                        stroke="#888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value / 1000}k`}
                      />
                      <Tooltip 
                        formatter={(value) => formatCurrency(value)}
                        labelFormatter={(label) => new Date(label).toLocaleDateString('id-ID')}
                        contentStyle={{ 
                          borderRadius: '8px', 
                          border: '1px solid #e5e7eb',
                          fontSize: '12px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#f97316" 
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRevenue1)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Right Side Stats */}
              <div className="md:col-span-3 space-y-4">
                {/* Total Revenue Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">$15,231.89</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      +20.1% from last month
                    </p>
                    <div className="mt-4 h-20">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenue.slice(-7)}>
                          <Line 
                            type="monotone" 
                            dataKey="amount" 
                            stroke="#000" 
                            strokeWidth={1.5}
                            dot={{ fill: '#000', r: 3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Subscriptions Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Subscriptions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">+2350</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      +180.1% from last month
                    </p>
                    <div className="mt-4 h-20">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={growth.slice(-12)}>
                          <Bar 
                            dataKey="count" 
                            fill="#22c55e"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar 
                            dataKey="count" 
                            fill="#ef4444"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Bottom Grid: Payments & Team */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Payments Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Payments</CardTitle>
                  <CardDescription className="text-xs">
                    Manage your payments.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Filter */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Filter emails..."
                        className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <Button variant="outline" size="sm" className="h-9">
                        Columns
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </div>

                    {/* Table */}
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">
                              <Checkbox 
                                checked={selectedPayments.length === payments.length}
                                onClick={toggleAllPayments}
                              />
                            </TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payments.map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell>
                                <Checkbox 
                                  checked={selectedPayments.includes(payment.id)}
                                  onClick={() => togglePaymentSelection(payment.id)}
                                />
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    payment.status === 'Success' ? 'success' :
                                    payment.status === 'Processing' ? 'warning' :
                                    'destructive'
                                  }
                                  className="text-xs"
                                >
                                  {payment.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium text-sm">
                                {payment.email}
                              </TableCell>
                              <TableCell className="text-right font-medium text-sm">
                                ${payment.amount.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <button className="text-muted-foreground hover:text-foreground">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Team Members */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Team Members</CardTitle>
                  <CardDescription className="text-xs">
                    Invite your team members to collaborate.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamMembers.map((member, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-muted text-sm font-medium">
                              {member.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{member.name}</div>
                            <div className="text-xs text-muted-foreground">{member.email}</div>
                          </div>
                        </div>
                        <Select className="w-28 h-9 text-xs">
                          <option value="member">Member</option>
                          <option value="owner">Owner</option>
                          <option value="admin">Admin</option>
                        </Select>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className={activeTab === 'analytics' ? 'block' : 'hidden'}>
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>View detailed analytics and insights.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Analytics content coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className={activeTab === 'reports' ? 'block' : 'hidden'}>
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Generate and download reports.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Reports content coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className={activeTab === 'notifications' ? 'block' : 'hidden'}>
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage your notifications.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Notifications content coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
