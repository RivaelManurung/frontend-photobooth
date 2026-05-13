import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryProvider } from './QueryProvider';
import { SocketProvider } from './SocketProvider';
import { Toaster } from 'sonner';
import { ErrorBoundary } from 'react-error-boundary';

const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
    <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
    <pre className="mt-4 rounded bg-gray-100 p-4 text-sm">{error.message}</pre>
    <button
      onClick={resetErrorBoundary}
      className="mt-6 rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
    >
      Try again
    </button>
  </div>
);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryProvider>
        <SocketProvider>
          <BrowserRouter>
            {children}
            <Toaster position="top-center" richColors closeButton />
          </BrowserRouter>
        </SocketProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
};
