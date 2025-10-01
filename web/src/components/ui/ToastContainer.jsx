import { useAppStore } from '../../stores/useAppStore'
import Toast from './Toast'

const ToastContainer = () => {
  const { toasts, removeToast } = useAppStore()

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>
  )
}

export default ToastContainer