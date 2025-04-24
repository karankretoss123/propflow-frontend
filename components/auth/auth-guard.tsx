"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-context"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    if (hasMounted && !loading && !user?.isAuthenticated) {
      router.push("/login")
    }
  }, [hasMounted, user, loading, router])

  // ⛔ Avoid hydration mismatch
  if (!hasMounted || loading) return null

  if (!user?.isAuthenticated) return null

  return <>{children}</>
}
