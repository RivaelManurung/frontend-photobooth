import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePhotoboothStore } from '@/stores/usePhotoboothStore';
import { photoService } from '../photo.service';
import { useSocket } from '@/providers/SocketProvider';
import { Button, Card, Progress } from '@/components/ui';
import { Download, RefreshCw, Check, Loader2, Share2, Home } from 'lucide-react';
import { toast } from 'sonner';

const ResultPage: React.FC = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const { sessionId, selectedTemplateId, resetFlow } = usePhotoboothStore();
  
  const [status, setStatus] = useState<'uploading' | 'processing' | 'completed' | 'failed'>('processing');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
      return;
    }

    // Start processing on backend if not already started
    const startProcessing = async () => {
      try {
        const res = await photoService.generateResult(sessionId, selectedTemplateId || 'default');
        // If result comes back immediately (unlikely in async flow but possible)
        if (res.resultUrl) {
          setResultUrl(res.resultUrl);
          setStatus('completed');
          setProgress(100);
        }
      } catch (err) {
        toast.error('Failed to start processing');
        setStatus('failed');
      }
    };

    startProcessing();

    // Listen for progress updates
    socket.on(`processing_progress_${sessionId}`, (data: { progress: number }) => {
      setProgress(data.progress);
    });

    // Listen for completion
    socket.on(`processing_complete_${sessionId}`, (data: { url: string }) => {
      setResultUrl(data.url);
      setStatus('completed');
      setProgress(100);
    });

    return () => {
      socket.off(`processing_progress_${sessionId}`);
      socket.off(`processing_complete_${sessionId}`);
    };
  }, [sessionId, selectedTemplateId, socket, navigate]);

  const handleDownload = () => {
    if (resultUrl) {
      const a = document.createElement('a');
      a.href = resultUrl;
      a.download = `snap-${sessionId}.png`;
      a.click();
    }
  };

  const handleFinish = () => {
    resetFlow();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-neo-stone flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl border-8 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] bg-white p-10">
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            {status === 'completed' ? 'YOUR SNAPS ARE READY!' : 'PROCESSING YOUR SNAPS...'}
          </h1>

          {status !== 'completed' ? (
            <div className="space-y-6 py-10">
              <div className="relative h-20 w-20 mx-auto">
                <Loader2 size={80} className="animate-spin text-black" />
              </div>
              <div className="space-y-2">
                <Progress value={progress} className="h-6 border-4 border-black bg-stone-100" />
                <p className="font-bold text-sm uppercase">{progress}% COMPLETED</p>
              </div>
              <p className="font-medium text-black/60 italic">Applying filters and assembling your strip...</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in zoom-in duration-500">
              <div className="border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden bg-stone-100">
                <img src={resultUrl!} alt="Result" className="w-full h-auto" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <Button 
                  onClick={handleDownload}
                  className="h-16 text-lg font-black uppercase bg-neo-cyan border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  <Download className="mr-2" /> Download Strip
                </Button>
                <Button 
                  onClick={handleFinish}
                  className="h-16 text-lg font-black uppercase bg-neo-yellow border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  <Home className="mr-2" /> Finish Session
                </Button>
              </div>

              <div className="flex justify-center gap-8 pt-4">
                <div className="text-center">
                  <div className="p-3 bg-white border-4 border-black mb-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(resultUrl!)}`} 
                      alt="QR" 
                      className="w-32 h-32"
                    />
                  </div>
                  <p className="text-[10px] font-black uppercase">Scan to share</p>
                </div>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="space-y-6">
              <p className="text-red-500 font-bold uppercase">Something went wrong during processing.</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                <RefreshCw className="mr-2" /> Retry
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ResultPage;
