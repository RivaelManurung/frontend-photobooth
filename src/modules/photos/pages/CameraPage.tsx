import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, AlertCircle, Loader2 } from 'lucide-react';
import { usePhotoboothStore } from '@/stores/usePhotoboothStore';
import { photoService } from '../photo.service';
import { toast } from 'sonner';

const CameraPage: React.FC = () => {
  const navigate = useNavigate();
  const { photoCount, sessionId } = usePhotoboothStore();

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedCount, setCapturedCount] = useState(0);
  const [flash, setFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1920, height: 1080, facingMode: 'user' },
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      setError('Cannot access camera. Please check permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const captureAndUpload = async () => {
    if (videoRef.current && canvasRef.current && sessionId) {
      setFlash(true);
      setTimeout(() => setFlash(false), 150);

      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Mirror for selfie
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      try {
        await photoService.uploadPhoto(dataUrl, sessionId);
        setCapturedCount((prev) => prev + 1);
      } catch (err) {
        toast.error('Failed to upload photo. Retrying...');
        // In production, you might want a retry queue
      }
    }
  };

  const startSession = async () => {
    setCapturing(true);
    for (let i = 0; i < photoCount; i++) {
      let count = 3;
      while (count > 0) {
        setCountdown(count);
        await new Promise((r) => setTimeout(r, 1000));
        count--;
      }
      setCountdown(null);
      await captureAndUpload();
      if (i < photoCount - 1) await new Promise((r) => setTimeout(r, 1500));
    }
    setCapturing(false);
    navigate('/result');
  };

  useEffect(() => {
    if (stream && !capturing && capturedCount === 0) {
      // Small delay before starting first countdown
      setTimeout(() => startSession(), 2000);
    }
  }, [stream]);

  if (error) {
    return (
      <div className="min-h-screen bg-neo-stone flex items-center justify-center p-6">
        <div className="bg-white border-8 border-black p-10 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] text-center max-w-md">
          <AlertCircle size={60} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-black uppercase">Camera Error</h2>
          <p className="mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="w-full bg-neo-cyan p-4 border-4 border-black font-black uppercase">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neo-stone flex flex-col items-center">
      {flash && <div className="fixed inset-0 bg-white z-[100]" />}
      
      <div className="w-full max-w-5xl p-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-black italic tracking-tighter">SNAP! BOOTH</h1>
          <div className="bg-neo-pink px-6 py-2 border-4 border-black font-black uppercase text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            PHOTO {capturedCount + 1} / {photoCount}
          </div>
        </div>

        <div className="relative border-[10px] border-black bg-black aspect-video shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
          <canvas ref={canvasRef} className="hidden" />

          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
              <span className="text-[15rem] font-black text-white drop-shadow-[12px_12px_0px_rgba(0,0,0,1)] animate-ping">
                {countdown}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-6">
          {[...Array(photoCount)].map((_, i) => (
            <div key={i} className="aspect-[3/4] border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
              {i < capturedCount ? (
                <Check className="text-neo-green" size={48} strokeWidth={4} />
              ) : i === capturedCount && capturing ? (
                <Loader2 className="animate-spin text-black/20" size={48} />
              ) : (
                <Camera size={48} className="text-black/10" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Check = ({ className, size, strokeWidth }: any) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default CameraPage;
