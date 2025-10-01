import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Toast from './Toast'

const ToastContainer = () => {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handleToast = (event) => {
      const { message, type, duration = 5000 } = event.detail
      const id = Date.now() + Math.random()

      setToasts(prev => [...prev, { id, message, type, duration }])

      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
      }, duration)
    }

    window.addEventListener('showToast', handleToast)

    return () => {
      window.removeEventListener('showToast', handleToast)
    }
  }, [])

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

export default ToastContainer
