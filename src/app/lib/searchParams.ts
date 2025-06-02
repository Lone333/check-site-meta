import { useRouter, useSearchParams } from "next/navigation";

export function useAppNavigation() {
  const sp = useSearchParams()
  const router = useRouter()

  function getNewSetQuery(key: string, value: string | undefined) {
    const newSp = new URLSearchParams(sp)
    if (value === undefined) newSp.delete(key)
    else newSp.set(key, value)
    return newSp
  }

  function softNavigate(key: string, value: string | undefined, mode: "replace" = "replace") {
    const newSp = getNewSetQuery(key, value)
    window.history.pushState({}, '', '/?' + newSp)
  }

  function navigate(key: string, value: string | undefined) {
    const newSp = getNewSetQuery(key, value)
    router.push('/?' + newSp)
  }
  function get(key: string) {
    return sp.get(key)
  }
  function getAll() {
    return Array.from(sp.entries())
  }

  return {
    navigate,
    softNavigate,
    sp,
    get,
    getAll,
  }
}