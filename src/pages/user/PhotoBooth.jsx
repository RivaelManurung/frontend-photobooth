import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, RotateCcw, AlertCircle } from 'lucide-react';
import { usePhotobooth } from '../../context/PhotoboothContext';
import '../../styles/PhotoBooth.css';

const COUNTDOWN_TIME = 3;

export default function PhotoBooth() {
    const navigate = useNavigate();
    const { photoCount, setCapturedImages } = usePhotobooth();

    const [stream, setStream] = useState(null);
    const [capturing, setCapturing] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const [capturedPhotos, setCapturedPhotos] = useState([]);
    const [flash, setFlash] = useState(false);
    const [error, setError] = useState(null);
    const [preparing, setPreparing] = useState(true);
    const [prepCountdown, setPrepCountdown] = useState(3);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const startCamera = useCallback(async () => {
        setError(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    facingMode: 'user',
                },
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            setError('Gagal mengakses kamera. Pastikan izin sudah diberikan.');
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
    }, [stream]);

    useEffect(() => {
        startCamera();
        
        // Initial Preparation Countdown
        const timer = setInterval(() => {
            setPrepCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setPreparing(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            stopCamera();
            clearInterval(timer);
        };
    }, [startCamera, stopCamera]);

    const triggerFlash = () => {
        setFlash(true);
        setTimeout(() => setFlash(false), 150);
    };

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            triggerFlash();
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            // High-quality capture dimensions
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Mirror & Draw
            context.save();
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            context.restore();

            // SENIOR-FRONTEND OPTIMIZATION: 
            // Use JPEG instead of PNG for better memory management in browser
            const imageUrl = canvas.toDataURL('image/jpeg', 0.85);
            setCapturedPhotos((prev) => [...prev, imageUrl]);
            return imageUrl;
        }
        return null;
    };

    const startSession = async () => {
        setCapturing(true);
        const newPhotos = [];

        for (let i = 0; i < photoCount; i++) {
            // Countdown phase
            await new Promise((resolve) => {
                let count = COUNTDOWN_TIME;
                setCountdown(count);
                const timer = setInterval(() => {
                    count--;
                    if (count > 0) {
                        setCountdown(count);
                    } else {
                        clearInterval(timer);
                        setCountdown(null);
                        const img = captureImage();
                        if (img) newPhotos.push(img);
                        resolve();
                    }
                }, 1000);
            });

            // Pause between shots
            if (i < photoCount - 1) {
                await new Promise((r) => setTimeout(r, 1200));
            }
        }

        setCapturing(false);
        setCapturedImages(newPhotos);
        navigate('/result');
    };

    if (error) {
        return (
            <div className="booth-container flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="text-destructive mb-4" size={64} />
                <h2 className="text-2xl font-bold mb-2">Ops! Ada Masalah</h2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <button 
                    className="btn-premium px-6 py-3 bg-primary text-primary-foreground rounded-full flex items-center gap-2"
                    onClick={startCamera}
                >
                    <RotateCcw size={20} /> Coba Lagi
                </button>
            </div>
        );
    }

    return (
        <div className="booth-container">
            {flash && <div className="flash-overlay animate-in fade-in duration-75" />}

            {/* Photo counter dots - Premium UI */}
            <div className="photo-counter glass px-4 py-2 rounded-full">
                {[...Array(photoCount)].map((_, i) => (
                    <div
                        key={i}
                        className={`counter-dot transition-all duration-500 ${
                            i < capturedPhotos.length ? 'bg-primary scale-110 shadow-lg' : 'bg-white/30'
                        }`}
                    />
                ))}
            </div>

            <div className="camera-frame shadow-2xl overflow-hidden rounded-3xl border-4 border-white/10">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="camera-feed"
                    style={{ transform: 'scaleX(-1)' }}
                />
                <canvas ref={canvasRef} className="hidden" />

                {countdown !== null && (
                    <div className="countdown-overlay bg-black/20 backdrop-blur-sm">
                        <span className="countdown-number animate-bounce text-8xl font-black text-white drop-shadow-2xl">
                            {countdown}
                        </span>
                    </div>
                )}

                {preparing && (
                    <div className="prep-overlay fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md">
                        <div className="prep-box text-center animate-in zoom-in duration-500">
                            <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">GET READY!</h2>
                            <p className="text-white/60 mb-8">Siapkan gaya terbaikmu...</p>
                            <div className="prep-number text-9xl font-black text-primary drop-shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)]">
                                {prepCountdown}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="controls mt-8 flex items-center justify-center gap-8">
                {!capturing ? (
                    <>
                        <button 
                            className="control-btn cancel glass hover:bg-destructive/20 hover:text-destructive" 
                            onClick={() => navigate('/style')}
                        >
                            <X size={24} />
                        </button>
                        
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all duration-500 animate-pulse" />
                            <button className="shutter-btn btn-premium bg-primary text-white p-6 rounded-full shadow-2xl relative z-10" onClick={startSession}>
                                <Camera size={40} />
                            </button>
                        </div>

                        <button 
                            className="control-btn switch glass hover:bg-primary/20 hover:text-primary" 
                            onClick={startCamera}
                        >
                            <RotateCcw size={24} />
                        </button>
                    </>
                ) : (
                    <div className="glass px-8 py-4 rounded-2xl border-primary/30 animate-pulse">
                        <p className="status-text text-xl font-medium">
                            Pose! Foto {capturedPhotos.length + 1} dari {photoCount} 📸
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
