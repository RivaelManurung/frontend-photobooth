# Feedback Frontend PhotoboothAdmin

Tanggal analisa: 2026-05-13

## Ringkasan

Frontend `PhotoboothAdmin` adalah aplikasi React + Vite, bukan Next.js. Aplikasi sudah memiliki dua area besar:

- User-facing photobooth flow.
- Admin dashboard.

Build frontend berhasil dijalankan dengan:

```bash
npm run build
```

Namun integrasi dengan backend belum rapi. Ada beberapa endpoint di `src/lib/api.js` yang belum cocok dengan backend `/api/v1`, beberapa function dipakai halaman tetapi belum tersedia di API client, dan beberapa halaman masih memakai simulasi/fallback dummy data sehingga error backend bisa tidak terlihat saat UI dipakai.

## Yang Sudah Dibuat

### Struktur aplikasi

- Vite React app.
- Routing menggunakan `react-router-dom`.
- Admin route protection berdasarkan token dan `user.role`.
- Context photobooth flow di `src/context/PhotoboothContext.jsx`.
- API client terpusat di `src/lib/api.js`.
- Komponen UI reusable di `src/components/ui`.
- Layout admin dan user navbar sudah tersedia.

### Halaman user

Halaman user yang sudah ada:

- Landing
- Packages
- Checkout
- Layout selection
- Style selection
- Photo booth camera capture
- Result page
- Gallery
- Features
- About
- Contact
- Terms
- Privacy
- Profile
- Order history

### Halaman admin

Halaman admin yang sudah ada:

- Dashboard
- Users
- User details
- Photos
- Photo details
- Templates
- Template details
- Template create/edit
- Payments
- Payment details
- Promos
- Promo create/details
- Sessions
- Session details
- Reports
- Audit logs
- Health
- Settings

### API client

`src/lib/api.js` sudah menyediakan wrapper untuk:

- Auth
- Admin
- Photos
- Templates
- Promo
- Payment
- Sessions
- Search
- Audit

Token JWT sudah otomatis ditambahkan lewat Axios interceptor dari `localStorage.token`.

### Build status

Frontend berhasil build.

Catatan build:

- Bundle JS cukup besar: sekitar `952 kB`, gzip sekitar `264 kB`.
- Vite memberi warning chunk size lebih dari 500 kB.
- Belum blocking, tapi perlu code splitting untuk produksi.

## Yang Belum Terhubung / Salah Endpoint

### 1. Default API URL masih salah untuk Docker backend lokal

Di `src/lib/api.js`:

```js
const API_BASE_URL = VITE_API_URL || (isProd ? '/api/v1' : 'http://localhost:8080/api/v1');
```

Backend Docker sekarang berjalan di:

```text
http://localhost:8082/api/v1
```

File `.env.example` frontend juga masih:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

Sedangkan `.env` saat ini mengarah ke Railway:

```env
VITE_API_URL=https://backend-photobooth-production-e134.up.railway.app/api/v1
```

Akibatnya saat development lokal, frontend bisa tidak memanggil backend Docker lokal kecuali `.env` diganti manual.

Rekomendasi:

```env
VITE_API_URL=http://localhost:8082/api/v1
```

### 2. Endpoint export users salah

Frontend:

```js
exportUsers: () => api.get('/admin/export/users', { responseType: 'blob' })
```

Backend route aktif:

```text
GET /api/v1/admin/users/export
```

Harus diubah menjadi:

```js
exportUsers: () => api.get('/admin/users/export', { responseType: 'blob' })
```

### 3. Endpoint toggle template status salah method dan path

Frontend:

```js
toggleTemplateStatus: (id) => api.post(`/admin/templates/${id}/toggle-status`)
toggleTemplateFeatured: (id) => api.post(`/admin/templates/${id}/toggle-featured`)
```

Backend route aktif:

```text
PATCH /api/v1/admin/templates/:id/status
PATCH /api/v1/admin/templates/:id/featured
```

Harus disesuaikan menjadi:

```js
toggleTemplateStatus: (id) => api.patch(`/admin/templates/${id}/status`)
toggleTemplateFeatured: (id) => api.patch(`/admin/templates/${id}/featured`)
```

### 4. Endpoint audit logs salah

Frontend:

```js
getAuditLogs: (params) => api.get('/admin/audit-logs', { params })
```

Backend route aktif:

```text
GET /api/v1/admin/audit/logs
GET /api/v1/admin/audit/users/:user_id
GET /api/v1/admin/audit/resources/:resource_type/:resource_id
GET /api/v1/admin/audit/stats
GET /api/v1/admin/audit/export
```

Harus diubah menjadi:

```js
getAuditLogs: (params) => api.get('/admin/audit/logs', { params })
```

Respons backend juga memakai:

```json
{
  "logs": [],
  "total": 0,
  "page": 1,
  "limit": 50
}
```

Sedangkan `AuditLogs.jsx` membaca:

```js
setLogs(res.data?.data || [])
```

Harus membaca:

```js
setLogs(res.data?.logs || [])
```

### 5. Endpoint payments tidak ada di backend

Frontend:

```js
paymentAPI.getPayments: () => api.get('/payments')
paymentAPI.getPayment: (id) => api.get(`/payments/${id}`)
```

Backend route aktif untuk order/payment user adalah:

```text
GET /api/v1/orders
GET /api/v1/orders/:id
POST /api/v1/orders/subscription
POST /api/v1/orders/:id/cancel
POST /api/v1/payment/qris/create
GET /api/v1/payment/qris/:order_id
GET /api/v1/payment/qris/:order_id/status
POST /api/v1/payment/qris/:order_id/cancel
```

Tidak ada:

```text
/api/v1/payments
```

Akibatnya `OrderHistory.jsx` kemungkinan selalu fallback ke dummy data.

Rekomendasi:

- Rename `paymentAPI.getPayments` menjadi `orderAPI.getOrders`.
- Gunakan `/orders`.
- Tambahkan API client untuk QRIS:
  - create QRIS
  - get QRIS payment
  - check QRIS status
  - cancel QRIS payment

### 6. Admin order delete tidak ada di backend

Frontend:

```js
deleteOrder: (id) => api.delete(`/orders/${id}`)
```

Backend belum punya:

```text
DELETE /api/v1/orders/:id
```

Backend hanya punya:

```text
POST /api/v1/orders/:id/cancel
```

Halaman admin `Payments.jsx` dan `PaymentDetails.jsx` memakai `deleteOrder`, jadi aksi delete akan gagal.

Rekomendasi:

- Ubah UI menjadi cancel order, bukan delete.
- Atau tambahkan admin-only delete order di backend jika memang dibutuhkan.

### 7. Admin sessions belum benar-benar admin-wide

Frontend admin:

```js
getAllSessions: (params) => api.get('/sessions', { params })
```

Backend route `/sessions` protected mengambil user session biasa:

```text
GET /api/v1/sessions
```

Belum ada route admin khusus:

```text
GET /api/v1/admin/sessions
```

Akibatnya admin dashboard sessions kemungkinan hanya melihat session milik admin login, bukan semua session.

Rekomendasi:

- Tambah backend route admin sessions.
- Atau ubah label/fungsi frontend agar jelas hanya menampilkan session user login.

### 8. Function yang dipakai halaman admin belum ada di API client

Ada halaman yang memanggil function yang belum didefinisikan di `adminAPI`.

Contoh:

`SessionDetails.jsx`:

```js
adminAPI.getSession(id)
```

Tapi `adminAPI` tidak punya `getSession`.

`TemplateDetails.jsx`:

```js
adminAPI.getTemplate(id)
```

Tapi `adminAPI` tidak punya `getTemplate`.

Rekomendasi:

Tambahkan:

```js
getTemplate: (id) => api.get(`/admin/templates/${id}`)
getSession: (id) => api.get(`/sessions/${id}`)
```

Namun backend saat ini juga belum punya `GET /api/v1/admin/templates/:id`; yang ada admin template list dan public template detail. Pilih salah satu:

- Frontend pakai public `templatesAPI.getTemplate(id)`.
- Backend tambah admin template detail route.

### 9. Endpoint admin template categories dan upload asset belum ada

Frontend:

```js
getTemplateCategories: () => api.get('/admin/templates/categories')
uploadTemplateAsset: (data) => api.post('/admin/templates/upload-asset', data)
```

Backend route aktif:

```text
GET /api/v1/templates/categories
```

Belum ada:

```text
GET /api/v1/admin/templates/categories
POST /api/v1/admin/templates/upload-asset
```

Rekomendasi:

- Gunakan public `/templates/categories` untuk kategori.
- Hapus/disable `uploadTemplateAsset` jika belum dipakai.
- Atau aktifkan route backend admin upload asset jika memang dibutuhkan.

## Flow User yang Masih Simulasi / Belum Backend-Driven

### 1. Checkout masih simulasi payment

`Checkout.jsx` tidak membuat order ke backend. Payment hanya:

```js
setTimeout(...)
setPaymentVerified(true)
navigate('/layout')
```

Belum terhubung ke:

- `POST /api/v1/orders/subscription`
- `POST /api/v1/payment/qris/create`
- Manual QRIS flow
- GoPay QRIS status check
- WebSocket payment update

Akibatnya user bisa masuk flow photobooth hanya dari state localStorage, tanpa order/payment valid di backend.

### 2. PaidRoute hanya cek localStorage

`PaidRoute` membaca:

```js
paymentVerified
```

State ini disimpan di localStorage. Artinya user bisa bypass payment dengan mengubah localStorage.

Rekomendasi:

- Simpan `order_id` atau `session_id`.
- Validasi status order/session ke backend sebelum membuka `/layout`, `/style`, `/booth`, `/result`.

### 3. Photo capture masih local-first

`PhotoBooth.jsx` mengambil gambar dari kamera browser dan menyimpan base64 ke context/localStorage.

Backend upload/proses baru terjadi di `Result.jsx` melalui:

```js
photoAPI.uploadPublicStrip(...)
```

Ini memakai endpoint public strip, bukan pipeline upload protected:

```text
POST /api/v1/photos
```

Akibatnya:

- Tidak ada photo processing status `pending/processing/completed`.
- Worker Redis belum dimanfaatkan frontend.
- Tidak ada realtime update WebSocket.
- Session photo tracking belum kuat.

### 4. Session creation hanya kalau user login

`StyleSelection.jsx` hanya membuat session jika ada token:

```js
if (token) {
  sessionAPI.createSession(...)
}
```

Untuk user publik/non-login, booth tetap jalan offline tanpa session backend.

Jika produk photobooth butuh tracking event/session, sebaiknya backend menyediakan public session atau frontend wajib login/payment sebelum booth.

### 5. Result page memakai external QR generator

`Result.jsx` memakai:

```text
https://api.qrserver.com/v1/create-qr-code/
```

Ini external free service, tapi bukan bagian backend dan bukan controlled dependency.

Rekomendasi:

- Generate QR share/download dari frontend library lokal.
- Atau backend generate QR dan serve dari storage.

## Data Shape Mismatch

### 1. Audit log response

Frontend fallback object:

```js
{
  action,
  user: { name, email },
  ip,
  timestamp,
  details
}
```

Backend `AuditLog` kemungkinan mengirim:

```js
{
  actor_name,
  actor_email,
  ip_address,
  resource,
  resource_id,
  status,
  created_at
}
```

UI perlu mapping ulang agar tidak mengakses field yang tidak ada seperti `log.user.name`.

### 2. Order/payment response

Frontend banyak memakai istilah `payment`, tapi backend dominan memakai `order`.

Perlu diseragamkan:

- UI label boleh tetap "Payments".
- API layer sebaiknya jelas: `orderAPI`.
- Field yang dipakai harus mengikuti backend:
  - `order_number`
  - `total_amount`
  - `payment_method`
  - `payment_provider`
  - `status`
  - `created_at`

### 3. Template detail/edit

`TemplateCreate.jsx` untuk edit mengambil:

```js
adminAPI.getAllTemplates({ id })
```

Ini kurang ideal. Seharusnya ada endpoint detail:

```text
GET /api/v1/admin/templates/:id
```

atau pakai:

```text
GET /api/v1/templates/:id
```

## Fitur Backend yang Belum Dipakai Frontend

Backend sudah punya beberapa fitur yang belum terlihat terhubung di frontend:

- 2FA:
  - `/api/v1/2fa/setup`
  - `/api/v1/2fa/verify-enable`
  - `/api/v1/2fa/disable`
  - `/api/v1/2fa/verify`
  - `/api/v1/2fa/status`
  - `/api/v1/2fa/backup-codes/regenerate`
- QRIS payment:
  - create QRIS
  - check status
  - cancel QRIS
- WebSocket:
  - `/api/v1/ws?session_id=...`
- Audit stats/export.
- Admin WebSocket tools.
- Promo validate di checkout.
- Photo upload protected `/photos`.
- Async worker processing status.
- `/ready` dan `/metrics`.

## Fallback Dummy Data yang Perlu Dikurangi

Beberapa halaman menampilkan dummy data saat backend gagal:

- `AuditLogs.jsx`
- `OrderHistory.jsx`
- Dashboard payment list masih hardcoded.

Ini bagus untuk prototyping, tapi berbahaya untuk production karena bisa menutupi error koneksi backend.

Rekomendasi:

- Di development boleh pakai mock mode eksplisit:

```env
VITE_USE_MOCKS=true
```

- Default production harus menampilkan error state, bukan dummy data.

## Docker / Deployment Frontend

### Yang sudah ada

- Dockerfile multi-stage.
- Build Vite app.
- Serve static assets dengan Express.
- Mendukung `ARG VITE_API_URL`.

### Catatan

- Frontend belum punya `docker-compose.yml` sendiri.
- Belum terhubung ke compose backend.
- Jika frontend ingin jalan di Docker lokal, perlu service frontend atau compose root.
- Dockerfile memakai Node + Express untuk static serving. Ini jalan, tapi alternatif lebih ringan adalah Nginx/Caddy.

## Masalah Dokumentasi

`README.md` frontend terdeteksi sebagai binary oleh ripgrep karena ada byte `NUL`.

Efeknya:

- Search/grep dokumentasi jadi terganggu.
- Bisa menyulitkan review diff.

Rekomendasi:

- Bersihkan encoding README.
- Simpan sebagai UTF-8 text normal.

## Prioritas Perbaikan

### Prioritas 1 - Perbaiki koneksi lokal ke backend

1. Ubah `.env.example` frontend:

```env
VITE_API_URL=http://localhost:8082/api/v1
```

2. Ubah fallback dev di `src/lib/api.js` dari `8080` ke `8082`.
3. Pastikan `.env` lokal tidak terus menunjuk ke Railway jika sedang development Docker.

### Prioritas 2 - Sinkronkan API client dengan backend

Perbaiki endpoint berikut:

- `exportUsers`
- `toggleTemplateStatus`
- `toggleTemplateFeatured`
- `auditAPI.getAuditLogs`
- `paymentAPI.getPayments`
- `paymentAPI.getPayment`
- `deleteOrder`
- `getSession`
- `getTemplate`
- `getTemplateCategories`
- `uploadTemplateAsset`

### Prioritas 3 - Hubungkan payment flow ke backend

1. Checkout membuat order:

```text
POST /api/v1/orders/subscription
```

2. Checkout membuat QRIS/manual payment:

```text
POST /api/v1/payment/qris/create
```

atau manual QRIS provider jika backend endpoint-nya sudah diekspos.

3. UI polling/check status atau pakai WebSocket.
4. `PaidRoute` validasi status order/session dari backend.

### Prioritas 4 - Hubungkan photo processing async

1. Upload original photo/strip ke `/api/v1/photos`.
2. Tampilkan status `pending/processing/completed/failed`.
3. Hubungkan WebSocket session room untuk update realtime.
4. Hindari menyimpan base64 besar di localStorage.

### Prioritas 5 - Rapikan admin data model

1. Admin payments pakai order API yang benar.
2. Admin sessions perlu route admin backend atau UI diubah.
3. Audit logs mapping mengikuti response backend.
4. Template detail/edit pakai endpoint detail yang jelas.

### Prioritas 6 - Hardening frontend production

1. Kurangi dummy fallback data.
2. Tambah error boundary.
3. Tambah loading/empty/error state yang konsisten.
4. Tambah code splitting untuk route admin/user.
5. Jangan simpan data sensitif di localStorage jika nanti ada refresh token/session cookie.

## Kesimpulan

Frontend sudah cukup lengkap dari sisi UI dan flow, tetapi belum sepenuhnya menjadi client backend yang benar. Masalah paling besar ada di `src/lib/api.js`: beberapa endpoint tidak cocok dengan backend, beberapa API function hilang, dan payment/photo/session flow masih banyak local simulation.

Langkah terbaik berikutnya adalah sinkronisasi API client dulu, lalu sambungkan checkout ke order/payment backend, kemudian sambungkan photo result ke async processing dan WebSocket.
