import { useToast as useToastPrimitive } from "../ui/toast"

export function useToast() {
  const { toast } = useToastPrimitive()
  return toast
}