# Photobooth SaaS Enterprise Architecture

## Overview
This frontend is built with React 19, Vite, and TypeScript, following a domain-driven architecture designed for scalability, security, and observability.

## Directory Structure
- `src/app`: Application entry point and global routing.
- `src/modules`: Domain-specific logic (auth, payments, photos, etc.).
- `src/components`: Shared UI components and layouts.
- `src/services`: Low-level services (HTTP, Websocket, Storage).
- `src/stores`: Client-side state management (Zustand).
- `src/providers`: React context providers (Query, Socket, Auth).

## Core Technologies
- **State Management**: Zustand for UI/Client state, TanStack Query for Server state.
- **Form Handling**: React Hook Form with Zod validation.
- **API Layer**: Axios with centralized interceptors for Auth and Error normalization.
- **Realtime**: Socket.IO client for payment and processing updates.
- **Styling**: TailwindCSS with shadcn/ui.
- **Animations**: Framer Motion.

## Payment Flow (QRIS)
1. User selects package.
2. `orderService.createOrder` is called.
3. `paymentService.createQRIS` generates the QR code.
4. Websocket listens for `payment_success_{orderId}`.
5. Backend verifies payment and returns a `sessionId`.

## Photo Processing Flow
1. Camera captures photos and uploads them immediately to `POST /photos/upload`.
2. Photos are stored on the backend, not in the browser.
3. User navigates to Result page.
4. `photoService.generateResult` triggers async processing.
5. Websocket listens for `processing_complete_{sessionId}`.
6. Final image is fetched from the backend URL.

## Security
- JWT stored in localStorage, handled via Axios interceptors.
- Role-based route protection (`ProtectedRoute`).
- Backend-driven session validation.
- No sensitive or large binary data in localStorage.

## Deployment
- Multi-stage Docker build using Nginx.
- SPA fallback routing.
- Gzip compression enabled.
- Cache-control for static assets.
