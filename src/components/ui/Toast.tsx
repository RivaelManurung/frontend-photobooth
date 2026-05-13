import * as React from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "../../lib/utils"

const ToastContext = React.createContext({})

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React.useState([])

  const addToast = React.useCallback((toast) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
    
    // Auto remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, toast.duration || 5000)
  }, [])

  const removeToast = React.useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

const Toast = ({ id, title, description, variant = "default", onClose }) => {
  const variants = {
    default: {
      bg: "bg-background border-border",
      icon: Info,
      iconColor: "text-blue-600"
    },
    success: {
      bg: "bg-green-50 border-green-200",
      icon: CheckCircle,
      iconColor: "text-green-600"
    },
    error: {
      bg: "bg-red-50 border-red-200",
      icon: AlertCircle,
      iconColor: "text-red-600"
    },
    warning: {
      bg: "bg-yellow-50 border-yellow-200",
      icon: AlertTriangle,
      iconColor: "text-yellow-600"
    }
  }

  const config = variants[variant] || variants.default
  const Icon = config.icon

  return (
    <div
      className={cn(
        "pointer-events-auto w-full rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-top-5",
        config.bg
      )}
    >
      <div className="flex gap-3">
        <Icon className={cn("h-5 w-5 flex-shrink-0", config.iconColor)} />
        <div className="flex-1">
          {title && (
            <div className="font-semibold text-sm">{title}</div>
          )}
          {description && (
            <div className="text-sm text-muted-foreground mt-1">{description}</div>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 rounded-md p-1 hover:bg-black/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default Toast
