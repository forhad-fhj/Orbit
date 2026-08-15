import { cookies } from 'next/headers'

export interface User {
  id: string
  username: string
  email: string
  gender: 'MALE' | 'FEMALE'
  avatarUrl?: string | null
  bio?: string | null
  createdAt: string
}

export async function getServerSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')
    
    if (!token) {
      return null
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      headers: {
        Cookie: `token=${token.value}`,
      },
      credentials: 'include',
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.user
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

