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
    const streamRef = useRef(null); // Ref for stable stream access

    // SENIOR-FRONTEND: Separated camera logic from UI state to prevent flickering
    const startCamera = useCallback(async () => {
        if (streamRef.current) return; // Already running

        setError(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    facingMode: 'user',
                    frameRate: { ideal: 30 }
                },
            });
            
            streamRef.current = mediaStream;
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
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
            setStream(null);
        }
    }, []);

    // Handle Camera Lifecycle
    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, [startCamera, stopCamera]);

    // Handle Prep Countdown & Auto Start
    useEffect(() => {
        if (!preparing) return;

        const timer = setInterval(() => {
            setPrepCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setPreparing(false);
                    // Auto trigger session after get ready
                    setTimeout(() => startSession(), 500);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [preparing]);

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

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            context.save();
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            context.restore();

            const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
            setCapturedPhotos((prev) => [...prev, imageUrl]);
            return imageUrl;
        }
        return null;
    };

    const startSession = async () => {
        if (capturing) return; // Prevent double start
        
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

            if (i < photoCount - 1) {
                await new Promise((r) => setTimeout(r, 1500));
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#fdfbf7] p-4 font-['Lexend'] relative overflow-hidden">
            {/* Background Dots */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}></div>
            
            {flash && <div className="fixed inset-0 bg-white z-[100] animate-in fade-in duration-75" />}

            <div className="relative z-10 w-full max-w-4xl">
                {/* Header Area */}
                <div className="flex justify-between items-center mb-8">
                    <div className="bg-white border-[3px] border-black px-6 py-2 rotate-[-1deg] neo-shadow-sm">
                        <h2 className="text-2xl font-black uppercase tracking-tighter italic">Strike a Pose!</h2>
                    </div>
                    <div className="bg-[var(--neo-pink)] border-[3px] border-black px-4 py-2 rotate-[1deg] neo-shadow-sm">
                        <span className="text-sm font-black uppercase">Photos: {capturedPhotos.length} / {photoCount}</span>
                    </div>
                </div>

                {/* Camera Container */}
                <div className="relative border-[4px] border-black bg-white neo-shadow-lg overflow-hidden aspect-video">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                        style={{ transform: 'scaleX(-1)' }}
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Countdown Overlay */}
                    {countdown !== null && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-40">
                            <span className="text-[12rem] font-black text-white drop-shadow-[10px_10px_0px_rgba(0,0,0,1)] animate-bounce">
                                {countdown}
                            </span>
                        </div>
                    )}

                    {/* Prep Overlay */}
                    {preparing && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md">
                            <div className="bg-[var(--neo-yellow)] border-[4px] border-black p-8 text-center neo-shadow rotate-[-2deg]">
                                <h2 className="text-5xl font-black text-black mb-2 uppercase tracking-tighter">GET READY!</h2>
                                <p className="text-black font-bold mb-8 uppercase">Siapkan gaya terbaikmu...</p>
                                <div className="text-9xl font-black text-black">
                                    {prepCountdown}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Capture Status Overlay */}
                    {capturing && !countdown && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
                            <div className="bg-[var(--neo-cyan)] border-[3px] border-black px-8 py-3 neo-shadow font-black uppercase text-xl animate-pulse">
                                Pose! Foto {capturedPhotos.length + 1}
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls Area */}
                <div className="mt-10 flex justify-center items-center gap-8">
                    {!capturing && !preparing ? (
                        <>
                            <button
                                onClick={() => navigate('/style')}
                                className="bg-white border-[3px] border-black p-4 neo-shadow hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                            >
                                <X className="w-8 h-8" />
                            </button>

                            <button
                                onClick={startSession}
                                className="bg-[var(--neo-green)] border-[4px] border-black px-12 py-5 font-black text-2xl uppercase tracking-widest neo-shadow-lg hover:translate-x-[-4px] hover:translate-y-[-4px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-3"
                            >
                                <Camera className="w-8 h-8" />
                                Capture
                            </button>

                            <button
                                onClick={startCamera}
                                className="bg-white border-[3px] border-black p-4 neo-shadow hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                            >
                                <RotateCcw className="w-8 h-8" />
                            </button>
                        </>
                    ) : (
                        <div className="bg-[var(--neo-pink)] border-[4px] border-black px-12 py-5 font-black text-2xl uppercase tracking-widest neo-shadow flex items-center gap-3 animate-pulse">
                            <Camera className="w-8 h-8" />
                            Session in Progress
                        </div>
                    )}
                </div>

                {/* Thumbnail Strip */}
                <div className="mt-12 grid grid-cols-4 gap-4">
                    {[...Array(photoCount)].map((_, idx) => (
                        <div key={idx} className="aspect-[3/4] border-[3px] border-black bg-white neo-shadow-sm relative overflow-hidden">
                            {capturedPhotos[idx] ? (
                                <img src={capturedPhotos[idx]} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center opacity-10">
                                    <Camera className="w-12 h-12" />
                                </div>
                            )}
                            <div className="absolute top-2 left-2 bg-black text-white text-[10px] font-black px-2 py-0.5 border border-white uppercase">
                                Snap #{idx + 1}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
