import { apiClient } from '@/services/http/client';

export interface PhotoUploadResponse {
  id: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export const photoService = {
  uploadPhoto: async (file: Blob | string, sessionId: string): Promise<PhotoUploadResponse> => {
    const formData = new FormData();
    if (typeof file === 'string') {
      // Convert data URL to blob
      const res = await fetch(file);
      const blob = await res.blob();
      formData.append('photo', blob, `photo_${Date.now()}.jpg`);
    } else {
      formData.append('photo', file);
    }
    formData.append('sessionId', sessionId);

    const response = await apiClient.post<PhotoUploadResponse>('/photos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getProcessingStatus: async (photoId: string): Promise<{ status: string; resultUrl?: string }> => {
    const response = await apiClient.get(`/photos/status/${photoId}`);
    return response.data;
  },

  generateResult: async (sessionId: string, templateId: string): Promise<{ resultUrl: string }> => {
    const response = await apiClient.post('/photos/generate-result', { sessionId, templateId });
    return response.data;
  }
};
