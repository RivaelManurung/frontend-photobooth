import { apiClient } from '@/services/http/client';

export interface DashboardStats {
  total_revenue: number;
  monthly_revenue: number;
  total_users: number;
  new_users_today: number;
  total_photos: number;
  photos_today: number;
  active_users: number;
}

export interface RevenueData {
  date: string;
  amount: number;
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>('/admin/stats');
    return response.data;
  },

  getRevenueReport: async (period: string = 'month'): Promise<RevenueData[]> => {
    const response = await apiClient.get<{ report: RevenueData[] }>('/admin/reports/revenue', {
      params: { period },
    });
    return response.data.report;
  },

  getRecentSales: async (): Promise<any[]> => {
    const response = await apiClient.get('/admin/payments/recent');
    return response.data;
  }
};
