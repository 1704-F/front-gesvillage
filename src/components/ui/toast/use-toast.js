import { useState, useEffect, useCallback } from "react"

const TOAST_TIMEOUT = 5000

const useToast = () => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(
    ({ title, description, variant = "default", action }) => {
      const id = Math.random().toString(36).substr(2, 9)
      setToasts((prev) => [...prev, { id, title, description, variant, action }])

      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
      }, TOAST_TIMEOUT)
    },
    []
  )

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return {
    toasts,
    toast: addToast,
    dismissToast,
  }
}

export { useToast }