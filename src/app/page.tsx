'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Dashboard from '@/components/Dashboard'
import AuthForm from '@/components/AuthForm'
import Profile from '@/components/Profile'
import { getGuestFromStorage } from '@/lib/auth'

interface User {
  id: string
  name: string
  email: string
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showProfile, setShowProfile] = useState(false)
  const [isNavVisible, setIsNavVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsNavVisible(false)
      } else {
        // Scrolling up
        setIsNavVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const checkAuth = async () => {
    try {
      // Cek auth biasa dulu
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setLoading(false)
        return
      }
      
      // Jika tidak ada auth, cek guest
      const guestUser = getGuestFromStorage()
      if (guestUser) {
        // Sync guest user ke database
        const guestResponse = await fetch('/api/guest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guestId: guestUser.id,
            name: guestUser.name
          })
        })
        
        if (guestResponse.ok) {
          setUser(guestUser as any)
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (userData: User) => {
    setUser(userData)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="space-y-8 p-4">
          {/* Header Skeleton */}
          <div className="bg-gray-300 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-pulse">
            <div className="bg-white p-6 rounded-xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <div className="h-8 bg-gray-300 rounded w-64 mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-48"></div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="h-16 bg-gray-300 rounded-xl w-32"></div>
                  <div className="h-16 bg-gray-300 rounded-xl w-32"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Summary Cards Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-300 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 animate-pulse">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-4 bg-gray-400 rounded w-20"></div>
                    <div className="hidden sm:block h-8 w-8 bg-gray-400 rounded"></div>
                  </div>
                  <div className="h-6 sm:h-8 bg-gray-400 rounded w-full mt-auto"></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Charts Section Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-300 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 animate-pulse">
              <div className="h-6 bg-gray-400 rounded w-48 mb-4"></div>
              <div className="h-64 bg-gray-400 rounded"></div>
            </div>
            <div className="bg-gray-300 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 animate-pulse">
              <div className="h-6 bg-gray-400 rounded w-48 mb-4"></div>
              <div className="h-64 bg-gray-400 rounded"></div>
            </div>
          </div>
          
          {/* Recent Transactions Skeleton */}
          <div className="bg-gray-300 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 animate-pulse">
            <div className="h-6 bg-gray-400 rounded w-48 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-400 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-500 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-500 rounded w-32 mb-1"></div>
                      <div className="h-3 bg-gray-500 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-500 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <nav className={`fixed top-0 left-0 right-0 z-40 bg-blue-500 border-b-4 border-black shadow-[0_8px_0px_0px_rgba(0,0,0,1)] transition-transform duration-300 ease-in-out ${
          isNavVisible ? 'translate-y-0' : '-translate-y-full'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 md:h-20">
            <div className="flex items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider drop-shadow-lg">
                  BIVO
                </h1>
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-3">
              <span className="text-white font-bold text-lg drop-shadow-lg">
                Halo, {user.name}! 👋
              </span>
              <button
                onClick={() => setShowProfile(true)}
                className="bg-yellow-400 border-3 border-black rounded-xl px-4 py-2 font-black text-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
              >
                👤 PROFILE
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-400 border-3 border-black rounded-xl px-4 py-2 font-black text-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
              >
                🚪 LOGOUT
              </button>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="bg-white border-3 border-black rounded-xl p-2 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
              >
                <div className="w-6 h-6 flex flex-col justify-center items-center">
                  <span className={`block w-5 h-0.5 bg-black transform transition duration-300 ease-in-out ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                  }`}></span>
                  <span className={`block w-5 h-0.5 bg-black transform transition duration-300 ease-in-out mt-1 ${
                    isMobileMenuOpen ? 'opacity-0' : ''
                  }`}></span>
                  <span className={`block w-5 h-0.5 bg-black transform transition duration-300 ease-in-out mt-1 ${
                    isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                  }`}></span>
                </div>
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="py-4 space-y-3 border-t-2 border-black/20">
              <div className="text-center">
                <span className="text-white font-bold text-lg drop-shadow-lg block mb-3">
                  Halo, {user.name}! 👋
                </span>
              </div>
              <div className="flex flex-col space-y-2 px-4">
                <button
                  onClick={() => {
                    setShowProfile(true)
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full bg-yellow-400 border-3 border-black rounded-xl px-4 py-3 font-black text-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
                >
                  👤 PROFILE
                </button>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full bg-red-400 border-3 border-black rounded-xl px-4 py-3 font-black text-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
                >
                  🚪 LOGOUT
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard />
      </main>
      
      {showProfile && (
        <Profile onClose={() => setShowProfile(false)} />
      )}
    </div>
  )
}
