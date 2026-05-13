import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PhotoboothState {
  photoCount: number;
  selectedTemplateId: string | null;
  sessionId: string | null;
  capturedPhotoUrls: string[];
  isPaymentVerified: boolean;
  
  setPhotoCount: (count: number) => void;
  setSelectedTemplateId: (id: string | null) => void;
  setSessionId: (id: string | null) => void;
  setCapturedPhotoUrls: (urls: string[]) => void;
  setPaymentVerified: (verified: boolean) => void;
  resetFlow: () => void;
}

export const usePhotoboothStore = create<PhotoboothState>()(
  persist(
    (set) => ({
      photoCount: 3,
      selectedTemplateId: null,
      sessionId: null,
      capturedPhotoUrls: [],
      isPaymentVerified: false,

      setPhotoCount: (photoCount) => set({ photoCount }),
      setSelectedTemplateId: (selectedTemplateId) => set({ selectedTemplateId }),
      setSessionId: (sessionId) => set({ sessionId }),
      setCapturedPhotoUrls: (capturedPhotoUrls) => set({ capturedPhotoUrls }),
      setPaymentVerified: (isPaymentVerified) => set({ isPaymentVerified }),
      
      resetFlow: () => set({
        photoCount: 3,
        selectedTemplateId: null,
        sessionId: null,
        capturedPhotoUrls: [],
        isPaymentVerified: false,
      }),
    }),
    {
      name: 'photobooth-storage',
      // Only persist non-binary data
      partialize: (state) => ({
        photoCount: state.photoCount,
        selectedTemplateId: state.selectedTemplateId,
        sessionId: state.sessionId,
        isPaymentVerified: state.isPaymentVerified,
      }),
    }
  )
);
