/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import './Toast.css'

interface ToastAction {
  label: string
  onClick?: () => void
  closeOnClick?: boolean
  variant?: string
}

interface ToastState {
  show: boolean
  message: string
  type: string
  actions: ToastAction[]
  duration: number
}

type ShowToast = (message: string, type?: string, options?: { actions?: ToastAction[]; duration?: number }) => void

const ToastContext = createContext<ShowToast | undefined>(undefined)

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: '',
    actions: [],
    duration: 3000,
  })
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const closeToast = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setToast({ show: false, message: '', type: '', actions: [], duration: 3000 })
  }

  const showToast: ShowToast = (message, type = 'success', options = {}) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    const actions = options.actions ?? []
    const duration = options.duration ?? (actions.length > 0 ? 5000 : 3000)
    setToast({ show: true, message, type, actions, duration })
    timeoutRef.current = setTimeout(() => {
      closeToast()
    }, duration)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast.show && (
        <div
          className={`toast-container ${toast.type}`}
          style={{ animationDuration: `${toast.duration}ms` }}
        >
          <p className="toast-message">{toast.message}</p>
          {toast.actions.length > 0 && (
            <div className="toast-actions">
              {toast.actions.map((action, index) => (
                <button
                  key={`${action.label}-${index}`}
                  type="button"
                  className={`toast-action-button ${action.variant ?? ''}`.trim()}
                  onClick={() => {
                    action.onClick?.()
                    if (action.closeOnClick !== false) closeToast()
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context
}