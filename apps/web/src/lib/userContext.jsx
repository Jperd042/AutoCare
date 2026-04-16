'use client'

import { createContext, useContext, useMemo } from 'react'

const UserContext = createContext(null)

export function UserProvider({ user, updateUser, children }) {
  const value = useMemo(() => ({ user, updateUser }), [user, updateUser])
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) return null
  return ctx.user
}

export function useUserContext() {
  return useContext(UserContext)
}
