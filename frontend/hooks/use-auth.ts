'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { apiRequest } from '@/lib/api'

export function useAuth() {
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      if (user) {
        setLoading(false)
        return
      }

      try {
        const data = await apiRequest<{ user: any }>('/api/auth/me')
        if (data?.user) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, []) // Only run once on mount

  return { user, loading }
}
