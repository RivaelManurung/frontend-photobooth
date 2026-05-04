import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, RotateCcw } from 'lucide-react';
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

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user',
                },
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
    };

    const captureImage = () => {
        triggerFlash();
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Mirror the image (selfie mode)
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageUrl = canvas.toDataURL('image/png');
            setCapturedPhotos((prev) => [...prev, imageUrl]);
            return imageUrl;
        }
        return null;
    };

    const startSession = async () => {
        setCapturing(true);
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
                        if (img) newPhotos.push(img);
                        resolve();
                    }
                }, 1000);
            });

            // Small pause between shots
            if (i < photoCount - 1) {
                await new Promise((r) => setTimeout(r, 1000));
            }
        }

        setCapturing(false);
        // Store captured images in global context → Result page reads from context
        setCapturedImages(newPhotos);
        navigate('/result');
    };

    const triggerFlash = () => {
        setFlash(true);
        setTimeout(() => setFlash(false), 150);
    };

    return (
        <div className="booth-container">
            {flash && <div className="flash-overlay" />}

            {/* Photo counter */}
            <div className="photo-counter">
                {[...Array(photoCount)].map((_, i) => (
                    <div
                        key={i}
                        className={`counter-dot ${i < capturedPhotos.length ? 'filled' : ''}`}
                    />
                ))}
            </div>

            <div className="camera-frame">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="camera-feed"
                    style={{ transform: 'scaleX(-1)' }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {countdown !== null && (
                    <div className="countdown-overlay">
                        <span className="countdown-number">{countdown}</span>
                    </div>
                )}
            </div>

            <div className="controls">
                {!capturing && (
                    <>
                        <button className="control-btn cancel" onClick={() => navigate('/style')}>
                            <X size={24} />
                        </button>
                        <button className="shutter-btn" onClick={startSession}>
                            <Camera size={40} />
                        </button>
                        <button className="control-btn switch" onClick={startCamera}>
                            <RotateCcw size={24} />
                        </button>
                    </>
                )}
                {capturing && (
                    <p className="status-text">
                        Foto {capturedPhotos.length + 1} dari {photoCount} — Pose! 📸
                    </p>
                )}
            </div>
        </div>
    );
}
