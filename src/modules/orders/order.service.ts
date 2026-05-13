import { apiClient } from '@/services/http/client';

export interface CreateOrderRequest {
  packageId: string;
}

export interface OrderResponse {
  id: string;
  amount: number;
  status: 'pending' | 'paid' | 'expired';
}

export const orderService = {
  createOrder: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    const response = await apiClient.post<OrderResponse>('/orders/subscription', data);
    return response.data;
  },
  
  getOrder: async (id: string): Promise<OrderResponse> => {
    const response = await apiClient.get<OrderResponse>(`/orders/${id}`);
    return response.data;
  }
};
