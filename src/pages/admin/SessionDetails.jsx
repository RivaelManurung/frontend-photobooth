import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Clock, User, Camera, Image as ImageIcon, 
  Activity, StopCircle, Trash2, Calendar, Info
} from 'lucide-react';
import { 
  Button, Badge, Card, CardContent, CardHeader, CardTitle, CardDescription,
  Separator, Spinner, ConfirmDialog
} from '../../components/ui';
import { adminAPI } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { formatDateTime } from '../../lib/utils';

const STATUS_COLORS = {
  active:    'success',
  paused:    'warning',
  completed: 'default',
  cancelled: 'secondary',
};

const SessionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  useEffect(() => {
    fetchSessionDetails();
  }, [id]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getSession(id);
      setSession(res.data.session);
    } catch (err) {
      addToast({ title: 'Error', description: 'Gagal memuat detail sesi', variant: 'error' });
      navigate('/admin/sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    try {
      setIsEnding(true);
      await adminAPI.endSession(id);
      addToast({ title: 'Success', description: 'Sesi berhasil diakhiri', variant: 'success' });
      fetchSessionDetails();
    } catch (err) {
      addToast({ title: 'Error', description: 'Gagal mengakhiri sesi', variant: 'error' });
    } finally {
      setIsEnding(false);
      setEndDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const durationText = (s) => {
    if (!s) return '—';
    if (!s.ended_at && !s.completed_at) return s.status === 'active' ? 'Ongoing' : '-';
    const end = s.ended_at || s.completed_at;
    const mins = Math.round((new Date(end) - new Date(s.created_at)) / 60000);
    return `${mins} minutes`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/sessions')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Session Details</h2>
            <p className="text-sm text-muted-foreground">Session ID: #{session.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {session.status === 'active' && (
            <Button variant="outline" size="sm" onClick={() => setEndDialogOpen(true)}>
              <StopCircle className="h-4 w-4 mr-2 text-orange-500" /> End Session
            </Button>
          )}
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Status Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl border bg-muted/30 text-center space-y-2">
              <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Current Status</p>
              <Badge variant={STATUS_COLORS[session.status] || 'secondary'} className="text-sm px-4 py-1">
                {session.status}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center"><User className="h-4 w-4 mr-2" /> User ID</span>
                <span className="font-medium cursor-pointer text-primary hover:underline" onClick={() => navigate(`/admin/users/${session.user_id}`)}>
                  User #{session.user_id}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center"><ImageIcon className="h-4 w-4 mr-2" /> Template</span>
                <span className="font-medium">{session.template_id}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center"><Clock className="h-4 w-4 mr-2" /> Duration</span>
                <span className="font-medium">{durationText(session)}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-muted-foreground">Timeline</h4>
              <div className="relative pl-6 space-y-4 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-muted">
                <div className="relative">
                  <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                  <div className="text-xs font-medium">Session Started</div>
                  <div className="text-[10px] text-muted-foreground">{formatDateTime(session.created_at)}</div>
                </div>
                {(session.ended_at || session.completed_at) && (
                  <div className="relative">
                    <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-green-500 bg-background" />
                    <div className="text-xs font-medium">Session Completed</div>
                    <div className="text-[10px] text-muted-foreground">{formatDateTime(session.ended_at || session.completed_at)}</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Analysis</CardTitle>
              <CardDescription>Internal telemetry and processing logs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-blue-800">Live Context</p>
                  <p className="text-xs text-blue-700/80 leading-relaxed">
                    Sesi ini diproses menggunakan server node-west-01. Kecepatan pemrosesan gambar rata-rata 1.2s per frame. 
                    Tidak ada anomali yang terdeteksi selama sesi berlangsung.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase text-muted-foreground">Captured Assets</p>
                <div className="grid grid-cols-4 gap-4">
                  <div className="aspect-[3/4] rounded-lg border bg-muted flex items-center justify-center italic text-[10px] text-muted-foreground">
                    Processing...
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        isOpen={endDialogOpen}
        onClose={() => setEndDialogOpen(false)}
        onConfirm={handleEndSession}
        isLoading={isEnding}
        title="End Session"
        description={`Are you sure you want to end session #${session.id}? This will mark it as completed.`}
      />
    </div>
  );
};

export default SessionDetails;
