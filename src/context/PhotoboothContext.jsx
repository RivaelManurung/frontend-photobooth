import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const PhotoboothContext = createContext(null);

const STORAGE_KEYS = {
  PHOTO_COUNT: 'pb_photo_count',
  SELECTED_TEMPLATE: 'pb_selected_template',
  SESSION: 'pb_session',
  CAPTURED_IMAGES: 'pb_captured_images',
  PAYMENT_VERIFIED: 'pb_payment_verified'
};

/**
 * Global state for the photobooth user flow.
 * Persisted in localStorage to survive page refreshes.
 */
export function PhotoboothProvider({ children }) {
  // --- Initialization from LocalStorage ---
  
  const [photoCount, setPhotoCount] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PHOTO_COUNT);
    return saved ? parseInt(saved, 10) : 3;
  });

  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_TEMPLATE);
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [capturedImages, setCapturedImages] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CAPTURED_IMAGES);
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [paymentVerified, setPaymentVerified] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.PAYMENT_VERIFIED) === 'true';
  });

  // --- Persistence Side Effects ---

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PHOTO_COUNT, photoCount);
  }, [photoCount]);

  useEffect(() => {
    if (selectedTemplate) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_TEMPLATE, JSON.stringify(selectedTemplate));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_TEMPLATE);
    }
  }, [selectedTemplate]);

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  }, [session]);

  useEffect(() => {
    // Note: base64 images can be large. localStorage limit is ~5MB.
    // We only persist if there are images, otherwise clear it.
    if (capturedImages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEYS.CAPTURED_IMAGES, JSON.stringify(capturedImages));
      } catch (e) {
        console.warn('Failed to save images to localStorage (likely size limit):', e);
      }
    } else {
      localStorage.removeItem(STORAGE_KEYS.CAPTURED_IMAGES);
    }
  }, [capturedImages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_VERIFIED, paymentVerified);
  }, [paymentVerified]);

  // --- Helper Methods ---

  const resetFlow = useCallback(() => {
    setPhotoCount(3);
    setSelectedTemplate(null);
    setSession(null);
    setCapturedImages([]);
    setPaymentVerified(false);
    
    // Clear all storage
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  }, []);

  return (
    <PhotoboothContext.Provider
      value={{
        photoCount, setPhotoCount,
        selectedTemplate, setSelectedTemplate,
        session, setSession,
        capturedImages, setCapturedImages,
        paymentVerified, setPaymentVerified,
        resetFlow,
      }}
    >
      {children}
    </PhotoboothContext.Provider>
  );
}

export function usePhotobooth() {
  const ctx = useContext(PhotoboothContext);
  if (!ctx) throw new Error('usePhotobooth must be used inside PhotoboothProvider');
  return ctx;
}
