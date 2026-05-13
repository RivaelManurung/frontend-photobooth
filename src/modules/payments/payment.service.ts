import { apiClient } from '@/services/http/client';

export interface CreateQRISRequest {
  orderId: string;
}

export interface QRISResponse {
  qrData: string;
  qrImage: string;
  expiryTime: string;
}

export const paymentService = {
  createQRIS: async (data: CreateQRISRequest): Promise<QRISResponse> => {
    const response = await apiClient.post<QRISResponse>('/payment/qris/create', data);
    return response.data;
  },

  verifyPayment: async (orderId: string): Promise<{ status: string }> => {
    const response = await apiClient.get(`/payment/verify/${orderId}`);
    return response.data;
  }
};
