'use client'

import { useState } from 'react'
import { createGuestId, setGuestToStorage, GuestUser } from '@/lib/auth'

interface User {
  id: string
  name: string
  email: string
}

interface AuthFormProps {
  onLogin: (user: User) => void
}

export default function AuthForm({ onLogin }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (response.ok) {
        if (isLogin) {
          onLogin(data.user)
        } else {
          // Setelah registrasi, otomatis login
          onLogin(data.user)
        }
      } else {
        setError(data.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      console.error('Auth error:', error)
      setError('Terjadi kesalahan koneksi')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleGuestLogin = () => {
    const guestId = createGuestId()
    const guestUser: GuestUser = {
      id: guestId,
      name: 'Pengguna Tamu',
      isGuest: true
    }
    
    setGuestToStorage(guestUser)
    onLogin(guestUser as any) // Type assertion untuk compatibility
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-300 via-pink-300 to-blue-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white border-4 border-black rounded-2xl p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200">
          <div className="text-center mb-8">
            <div className="mb-4">
              <h2 className="text-5xl font-black text-black uppercase tracking-wider mb-2">
                BIVO
              </h2>
              <p className="text-lg font-bold text-gray-700 uppercase tracking-wide">
                Budget In View Organizer
              </p>
            </div>
            <div className="bg-gradient-to-r from-purple-400 to-pink-400 border-3 border-black rounded-xl p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-lg font-black text-white uppercase tracking-wide">
                {isLogin ? 'MASUK AKUN' : 'BUAT AKUN BARU'}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 rounded-lg">
              <p className="text-red-700 font-bold text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-black text-gray-700 uppercase tracking-wide mb-2">
                  Nama Lengkap
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required={!isLogin}
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-3 border-black rounded-lg focus:outline-none focus:ring-0 focus:border-purple-500 font-bold text-gray-900 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-black text-gray-700 uppercase tracking-wide mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border-3 border-black rounded-lg focus:outline-none focus:ring-0 focus:border-purple-500 font-bold text-gray-900 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                placeholder="nama@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-black text-gray-700 uppercase tracking-wide mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border-3 border-black rounded-lg focus:outline-none focus:ring-0 focus:border-purple-500 font-bold text-gray-900 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                placeholder="Masukkan password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black py-3 px-4 rounded-lg border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'MEMPROSES...' : (isLogin ? 'MASUK' : 'DAFTAR')}
            </button>
          </form>

          {/* Tombol Guest Mode */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleGuestLogin}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-200"
            >
              🚀 Masuk sebagai Tamu
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Data akan disimpan di perangkat ini
            </p>
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-600 hover:text-purple-800 font-bold text-sm uppercase tracking-wide transition-colors duration-200"
            >
              {isLogin ? 'Belum punya akun? Daftar di sini' : 'Sudah punya akun? Masuk di sini'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}