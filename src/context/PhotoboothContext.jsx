import React, { createContext, useContext, useState, useCallback } from 'react';

const PhotoboothContext = createContext(null);

/**
 * Global state for the photobooth user flow.
 * Persisted in context so pages can navigate freely without losing state.
 */
export function PhotoboothProvider({ children }) {
  // Step 1: Layout
  const [photoCount, setPhotoCount] = useState(3);

  // Step 2: Template (from DB)
  const [selectedTemplate, setSelectedTemplate] = useState(null); // full Template object from API

  // Step 3: Session (from DB)
  const [session, setSession] = useState(null); // { session_id, id, ... }

  // Step 4: Captured images (base64 data URLs)
  const [capturedImages, setCapturedImages] = useState([]);

  const resetFlow = useCallback(() => {
    setPhotoCount(3);
    setSelectedTemplate(null);
    setSession(null);
    setCapturedImages([]);
  }, []);

  return (
    <PhotoboothContext.Provider
      value={{
        photoCount, setPhotoCount,
        selectedTemplate, setSelectedTemplate,
        session, setSession,
        capturedImages, setCapturedImages,
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
