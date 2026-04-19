'use client'

import { useState, useEffect, useCallback } from 'react'
import Sidebar from './Sidebar'
import Topbar  from './Topbar'
import Login   from '@/screens/Login'
import Register from '@/screens/Register'
import { UserProvider } from '@/lib/userContext.jsx'
import { ToastProvider } from '@/components/Toast.jsx'

const SESSION_KEY = 'cc_admin_session'

export default function AppShell({ children }) {
  const [collapsed,  setCollapsed]  = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user,       setUser]       = useState(null)
  const [authReady,  setAuthReady]  = useState(false)
  const [authView,   setAuthView]   = useState('login') // 'login' | 'register'

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY)
      if (saved) setUser(JSON.parse(saved))
    } catch { /* ignore */ }
    setAuthReady(true)
  }, [])

  function handleLogin(adminUser) {
    setUser(adminUser)
    localStorage.setItem(SESSION_KEY, JSON.stringify(adminUser))
  }

  function handleRegister(newUser) {
    setUser(newUser)
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser))
  }

  function handleLogout() {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
    setAuthView('login')
  }

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const next = { ...prev, ...updates }
      localStorage.setItem(SESSION_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  if (!authReady) return null

  if (!user) {
    if (authView === 'register') {
      return (
        <Register
          onRegister={handleRegister}
          onGoToLogin={() => setAuthView('login')}
        />
      )
    }
    return (
      <Login
        onLogin={handleLogin}
        onGoToRegister={() => setAuthView('register')}
      />
    )
  }

  const sidebarW = collapsed ? 'md:pl-[72px]' : 'md:pl-[272px]'

  return (
    <ToastProvider>
      {/* Root: full viewport, no overflow — only <main> scrolls */}
      <div className="h-screen overflow-hidden bg-surface-bg flex flex-col">

        {/* Mobile overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setMobileOpen(false)} />
        )}

        {/* Sidebar — fixed to left edge, full height */}
        <div className={`${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200`}>
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
        </div>

        {/* Right column: topbar + scrollable content */}
        <div className={`flex flex-col flex-1 min-h-0 overflow-hidden transition-all duration-200 ${sidebarW}`}>
          <Topbar user={user} onMenuToggle={() => setMobileOpen(v => !v)} onLogout={handleLogout} />
          <main className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 xl:p-8 cc-scrollbar">
            <UserProvider user={user} updateUser={updateUser}>
              <div className="animate-fade-in max-w-[1600px] mx-auto">
                {children}
              </div>
            </UserProvider>
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
