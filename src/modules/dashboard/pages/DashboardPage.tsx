import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Tabs, TabsList, TabsTrigger, TabsContent,
  Avatar, AvatarFallback, Table, TableHeader, TableBody, TableHead, TableRow, TableCell
} from '@/components/ui';
import { Users, DollarSign, CreditCard, Activity, Download } from 'lucide-react';
import { dashboardService } from '../dashboard.service';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardPage: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
  });

  const { data: revenue, isLoading: revenueLoading } = useQuery({
    queryKey: ['dashboard-revenue'],
    queryFn: () => dashboardService.getRevenueReport(),
  });

  const { data: recentSales, isLoading: salesLoading } = useQuery({
    queryKey: ['recent-sales'],
    queryFn: dashboardService.getRecentSales,
  });

  if (statsLoading || revenueLoading || salesLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
      </div>
    );
  }

  const mainStats = [
    {
      title: 'Total Revenue',
      value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(stats?.total_revenue || 0),
      description: `Monthly: ${stats?.monthly_revenue?.toLocaleString()}`,
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
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button size="sm">Refresh</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={revenue}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                    />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#000" 
                      fill="#e2e8f0"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>
                  Latest transaction activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {recentSales?.map((sale: any) => (
                    <div key={sale.id} className="flex items-center">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{sale.email?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{sale.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {sale.status}
                        </p>
                      </div>
                      <div className="ml-auto font-medium">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(sale.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
