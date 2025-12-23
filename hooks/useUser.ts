'use client'

import { useSession } from 'next-auth/react'

export interface SessionUser {
  id: string
  email: string
  name?: string
  role: 'user' | 'admin'
}

export function useUser() {
  const { data: session, status } = useSession()
  
  const user = session?.user as SessionUser | undefined
  const loading = status === 'loading'

  return { 
    user: user ? {
      id: user.id,
      email: user.email!,
      full_name: user.name,
      role: user.role || 'user',
    } : null,
    loading 
  }
}
