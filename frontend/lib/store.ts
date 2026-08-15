import { create } from 'zustand'

export interface User {
  id: string
  username: string
  email: string
  gender: 'MALE' | 'FEMALE'
  avatarUrl?: string | null
  bio?: string | null
  createdAt: string
}

interface AuthStore {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}))

