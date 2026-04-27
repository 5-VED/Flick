import { useApp } from '../AppContext'

export default function Toast() {
  const { toast } = useApp()
  if (!toast) return null

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-surface border border-white/10',
  }

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl text-sm font-body font-medium text-white shadow-xl animate-slide-up ${colors[toast.type] || colors.info}`}>
      {toast.msg}
    </div>
  )
}
