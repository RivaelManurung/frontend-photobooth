import { apiClient } from '@/services/http/client';

export interface SessionResponse {
  id: string;
  status: 'active' | 'completed' | 'expired';
  orderId: string;
}

export const sessionService = {
  createSession: async (orderId: string): Promise<SessionResponse> => {
    const response = await apiClient.post<SessionResponse>('/sessions/create', { orderId });
    return response.data;
  },

  verifySession: async (sessionId: string): Promise<SessionResponse> => {
    const response = await apiClient.get<SessionResponse>(`/sessions/verify/${sessionId}`);
    return response.data;
  },
};
