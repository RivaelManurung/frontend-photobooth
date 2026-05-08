import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, RotateCcw, AlertCircle, ArrowUpRight } from 'lucide-react';
import { usePhotobooth } from '../../context/PhotoboothContext';
import '../../styles/LandingPage.css';

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
    const streamRef = useRef(null);
    const sessionStartedRef = useRef(false);

    const startCamera = useCallback(async () => {
        if (streamRef.current) return;
        setError(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    facingMode: 'user',
                },
            });
            streamRef.current = mediaStream;
            setStream(mediaStream);
            if (videoRef.current) videoRef.current.srcObject = mediaStream;
        } catch (err) {
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

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, [startCamera, stopCamera]);

    useEffect(() => {
        if (!preparing) return;
        const timer = setInterval(() => {
            setPrepCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setPreparing(false);
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
            return canvas.toDataURL('image/jpeg', 0.9);
        }
        return null;
    };

    const startSession = async () => {
        if (capturing || sessionStartedRef.current) return;
        sessionStartedRef.current = true;
        setCapturing(true);
        setCapturedPhotos([]);
        const newPhotos = [];

        for (let i = 0; i < photoCount; i++) {
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
                        if (img) {
                            newPhotos.push(img);
                            setCapturedPhotos(prev => [...prev, img]);
                        }
                        resolve();
                    }
                }, 1000);
            });
            if (i < photoCount - 1) await new Promise((r) => setTimeout(r, 1500));
        }

        setCapturing(false);
        setCapturedImages(newPhotos);
        navigate('/result');
    };

    if (error) {
        return (
            <div className="landing-container min-h-screen flex flex-col items-center justify-center p-6 text-center bg-neo-stone">
                <div className="bg-white border-8 border-black p-12 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] max-w-md">
                    <AlertCircle size={80} className="text-neo-red mx-auto mb-6" />
                    <h2 className="text-3xl font-black uppercase mb-4">CAMERA ERROR</h2>
                    <p className="font-bold text-black/60 mb-8 uppercase text-xs">{error}</p>
                    <button 
                        className="w-full h-16 bg-neo-cyan border-4 border-black font-black uppercase text-xl hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
                        onClick={() => window.location.reload()}
                    >
                        RELOAD PAGE
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="landing-container bg-neo-stone">
            {flash && <div className="fixed inset-0 bg-white z-[100]" />}
            
            <header className="brutal-nav">
                <div className="nav-brand bg-neo-yellow" onClick={() => navigate('/')}>
                    <h1 className="logo-text">SNAP!</h1>
                </div>
                <div className="nav-links-center">
                    <div className="font-black uppercase text-xl italic tracking-tighter">
                        CAPTURING PHOTO {capturedPhotos.length + 1} OF {photoCount}
                    </div>
                </div>
                <div className="nav-cta bg-neo-pink">
                    <span>LIVE VIEW</span>
                </div>
            </header>

            <main className="brutal-main flex flex-col items-center">
                <div className="w-full max-w-5xl mt-8">
                    {/* Main Camera Frame */}
                    <div className="relative border-[10px] border-black bg-white shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] overflow-hidden aspect-video">
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
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm z-40">
                                <span className="text-[15rem] font-black text-white drop-shadow-[12px_12px_0px_rgba(0,0,0,1)] animate-ping">
                                    {countdown}
                                </span>
                            </div>
                        )}

                        {/* Prep Overlay */}
                        {preparing && (
                            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md">
                                <div className="bg-neo-yellow border-8 border-black p-12 text-center shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] rotate-[-2deg]">
                                    <h2 className="text-6xl font-black text-black mb-4 uppercase">GET READY!</h2>
                                    <div className="h-4 w-40 bg-black mx-auto mb-8"></div>
                                    <div className="text-[10rem] font-black text-black leading-none">
                                        {prepCountdown}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Strip Preview */}
                    <div className="mt-16 grid grid-cols-4 gap-6">
                        {[...Array(photoCount)].map((_, idx) => (
                            <div key={idx} className="aspect-[3/4] border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                                {capturedPhotos[idx] ? (
                                    <img src={capturedPhotos[idx]} alt="Captured" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-10">
                                        <Camera size={48} />
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-black text-white text-[10px] font-black py-1 px-2 uppercase text-center">
                                    SNAP #{idx + 1}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Exit */}
                    {!capturing && !preparing && (
                        <div className="mt-12 flex justify-center">
                            <button 
                                onClick={() => navigate('/style')}
                                className="h-16 px-10 border-4 border-black font-black uppercase hover:bg-neo-pink transition-colors flex items-center gap-2"
                            >
                                <X size={24} /> CANCEL SESSION
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <footer className="mt-20 py-12 border-t-4 border-black bg-black text-white text-center">
                <div className="font-black uppercase tracking-[0.3em] text-xs">SNAP! PHOTOBOOTH / SESSION_ACTIVE_001</div>
            </footer>
        </div>
    );
}
