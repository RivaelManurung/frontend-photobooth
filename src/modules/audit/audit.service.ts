import { apiClient } from '@/services/http/client';

export interface AuditLog {
  id: string;
  actor_name: string;
  actor_email: string;
  ip_address: string;
  resource: string;
  action: string;
  status: string;
  created_at: string;
}

export interface AuditLogsResponse {
  data: AuditLog[];
  total: number;
  page: number;
  last_page: number;
}

export const auditService = {
  getLogs: async (params: { page?: number; limit?: number; search?: string }): Promise<AuditLogsResponse> => {
    const response = await apiClient.get<AuditLogsResponse>('/admin/audit-logs', { params });
    return response.data;
  },
};
