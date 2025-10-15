import { useEffect } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'warning' | 'error' | 'info'
  visible: boolean
  onComplete?: () => void
}

const Toast = ({ message, type, visible, onComplete }: ToastProps) => {
  useEffect(() => {
    if (visible && onComplete) {
      const timer = setTimeout(onComplete, 3000)
      return () => clearTimeout(timer)
    }
  }, [visible, onComplete])

  if (!visible) return null

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/30 text-green-300'
      case 'warning':
        return 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400/30 text-amber-300'
      case 'error':
        return 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-400/30 text-red-300'
      case 'info':
        return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400/30 text-blue-300'
      default:
        return 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/30 text-green-300'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✨'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      case 'info':
        return 'ℹ️'
      default:
        return '✨'
    }
  }

  return (
    <div className={`
      fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4
      backdrop-blur-md border-2 rounded-xl shadow-2xl
      transform transition-all duration-500 ease-out
      animate-slide-in-right
      ${getToastStyles()}
    `}>
      <span className="text-2xl animate-pulse">{getIcon()}</span>
      <span className="font-medium text-white">{message}</span>
      <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-b-xl animate-pulse" />
    </div>
  )
}

export default Toast