import { useState, useEffect, useCallback } from 'react';
import { Save, User, Lock, Settings2, Camera } from 'lucide-react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle,
  Button, Input, Tabs, TabsList, TabsTrigger, TabsContent,
  FormField, Textarea, Spinner, PageHeader 
} from '../../components/ui';

import { authAPI } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';

const Settings = () => {
  const { addToast } = useToast();

  // ── Profile state ────────────────────────────────────────────────────────
  const [profile, setProfile]           = useState({ name: '', email: '', bio: '' });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving]   = useState(false);

  // ── Password state ───────────────────────────────────────────────────────
  const [password, setPassword] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSaving, setPwSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      const res = await authAPI.getProfile();
      const u = res.data?.user || res.data || {};
      setProfile({ name: u.name || '', email: u.email || '', bio: u.bio || '' });
    } catch (err) {
      console.error('fetchProfile:', err);
      addToast({ title: 'Error', description: 'Gagal memuat profil', variant: 'error' });
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSaveProfile = async () => {
    if (!profile.name.trim()) {
      addToast({ title: 'Validasi', description: 'Nama tidak boleh kosong', variant: 'error' });
      return;
    }
    try {
      setProfileSaving(true);
      await authAPI.updateProfile({ name: profile.name, bio: profile.bio });
      // Update local storage user info
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, name: profile.name }));
      addToast({ title: 'Success', description: 'Profil berhasil disimpan', variant: 'success' });
    } catch (err) {
      addToast({ title: 'Error', description: err.response?.data?.error || 'Gagal menyimpan profil', variant: 'error' });
    } finally {
      setProfileSaving(false);
    }
  };

  const validatePassword = () => {
    const errors = {};
    if (!password.current_password) errors.current_password = 'Password saat ini wajib diisi';
    if (!password.new_password) errors.new_password = 'Password baru wajib diisi';
    else if (password.new_password.length < 8) errors.new_password = 'Minimal 8 karakter';
    if (password.new_password !== password.confirm_password) errors.confirm_password = 'Password tidak cocok';
    setPwErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;
    try {
      setPwSaving(true);
      await authAPI.changePassword({
        current_password: password.current_password,
        new_password: password.new_password,
      });
      setPassword({ current_password: '', new_password: '', confirm_password: '' });
      setPwErrors({});
      addToast({ title: 'Success', description: 'Password berhasil diubah', variant: 'success' });
    } catch (err) {
      addToast({ title: 'Error', description: err.response?.data?.error || 'Gagal mengubah password', variant: 'error' });
    } finally {
      setPwSaving(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Kelola pengaturan akun dan sistem" />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />Profile
          </TabsTrigger>
          <TabsTrigger value="password">
            <Lock className="mr-2 h-4 w-4" />Password
          </TabsTrigger>
          <TabsTrigger value="system">
            <Settings2 className="mr-2 h-4 w-4" />System
          </TabsTrigger>
        </TabsList>

        {/* ── Profile Tab ── */}
        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Informasi Profil</CardTitle>
              <CardDescription>Perbarui nama dan informasi akun Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Nama Lengkap" required>
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Nama lengkap"
                  />
                </FormField>
                <FormField label="Email">
                  <Input value={profile.email} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">Email tidak dapat diubah</p>
                </FormField>
              </div>
              <FormField label="Bio">
                <Textarea
                  value={profile.bio}
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                  placeholder="Deskripsi singkat tentang Anda..."
                  rows={3}
                />
              </FormField>
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={profileSaving}>
                  {profileSaving ? <><span className="animate-spin mr-2">⏳</span>Menyimpan...</> : <><Save className="mr-2 h-4 w-4" />Simpan Profil</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Password Tab ── */}
        <TabsContent value="password" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Ubah Password</CardTitle>
              <CardDescription>Pastikan password baru Anda kuat dan tidak mudah ditebak</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <FormField label="Password Saat Ini" required error={pwErrors.current_password}>
                <Input
                  type="password"
                  value={password.current_password}
                  onChange={(e) => setPassword((p) => ({ ...p, current_password: e.target.value }))}
                  placeholder="••••••••"
                />
              </FormField>
              <FormField label="Password Baru" required error={pwErrors.new_password}>
                <Input
                  type="password"
                  value={password.new_password}
                  onChange={(e) => setPassword((p) => ({ ...p, new_password: e.target.value }))}
                  placeholder="Minimal 8 karakter"
                />
              </FormField>
              <FormField label="Konfirmasi Password Baru" required error={pwErrors.confirm_password}>
                <Input
                  type="password"
                  value={password.confirm_password}
                  onChange={(e) => setPassword((p) => ({ ...p, confirm_password: e.target.value }))}
                  placeholder="Ulangi password baru"
                />
              </FormField>
              <div className="flex justify-end">
                <Button onClick={handleChangePassword} disabled={pwSaving}>
                  {pwSaving ? <><span className="animate-spin mr-2">⏳</span>Menyimpan...</> : <><Save className="mr-2 h-4 w-4" />Ubah Password</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── System Tab ── */}
        <TabsContent value="system" className="mt-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5" /> Photobooth Config</CardTitle>
                <CardDescription>Konfigurasi umum sistem photobooth</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label="Nama Aplikasi">
                    <Input defaultValue="Memoria PhotoBooth" />
                  </FormField>
                  <FormField label="Support Email">
                    <Input type="email" defaultValue="support@memoria.id" />
                  </FormField>
                </div>
                <div className="flex justify-end">
                  <Button><Save className="mr-2 h-4 w-4" />Simpan Konfigurasi</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Gateway</CardTitle>
                <CardDescription>Konfigurasi integrasi pembayaran GoPay QRIS</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label="GoPay Merchant ID">
                    <Input placeholder="Masukkan Merchant ID" type="password" />
                  </FormField>
                  <FormField label="GoPay Terminal ID">
                    <Input placeholder="Masukkan Terminal ID" type="password" />
                  </FormField>
                </div>
                <div className="flex justify-end">
                  <Button><Save className="mr-2 h-4 w-4" />Simpan</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
