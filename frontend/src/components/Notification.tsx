import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface NotificationProps {
  message: string
  type: NotificationType
  duration?: number
  onClose?: () => void
}

// Global notification state
type NotificationState = {
  open: boolean
  message: string
  type: NotificationType
  duration: number
  onClose?: () => void
}

let showNotificationFn: (props: NotificationProps) => void = () => {}

export const showNotification = (props: NotificationProps) => {
  showNotificationFn(props)
}

const NotificationComponent = () => {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    type: 'info',
    duration: 3000,
  })
  const [leaving, setLeaving] = useState(false)

  // Set the global function
  useEffect(() => {
    showNotificationFn = ({ message, type, duration = 3000, onClose }) => {
      setLeaving(false)
      setNotification({
        open: true,
        message,
        type,
        duration,
        onClose
      })
    }
  }, [])

  // Auto-close notification
  useEffect(() => {
    if (notification.open) {
      const timer = setTimeout(() => {
        handleClose()
      }, notification.duration)
      return () => clearTimeout(timer)
    }
  }, [notification.open, notification.duration])

  const handleClose = () => {
    setLeaving(true)
    setTimeout(() => {
      setNotification(prev => ({ ...prev, open: false }))
      if (notification.onClose) {
        notification.onClose()
      }
    }, 300) // Match transition duration
  }

  // Get background color based on type
  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-gradient-to-r from-emerald-500 to-green-500'
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-rose-500'
      case 'warning':
        return 'bg-gradient-to-r from-amber-500 to-yellow-500'
      case 'info':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500'
      default:
        return 'bg-gradient-to-r from-gray-700 to-gray-800'
    }
  }

  // Get icon based on type
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )
      case 'info':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return null
    }
  }

  if (!notification.open) return null

  return createPortal(
    <div className="fixed inset-x-0 top-0 z-50 flex items-start justify-center px-4 pt-4 sm:pt-6 pointer-events-none">
      <div
        className={`
          max-w-sm w-full shadow-lg rounded-lg pointer-events-auto 
          transform transition-all duration-300 ease-in-out
          ${leaving ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}
        `}
      >
        <div className={`${getBackgroundColor()} rounded-lg shadow-xl overflow-hidden border border-white/10`}>
          <div className="p-4 flex items-start">
            <div className="flex-shrink-0 text-white">
              {getIcon()}
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-white leading-5">
                {notification.message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="inline-flex text-white focus:outline-none focus:text-gray-100 hover:text-gray-200"
                onClick={handleClose}
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default NotificationComponent 