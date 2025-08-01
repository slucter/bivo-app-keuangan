'use client'

import { useState } from 'react'

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
          const loginResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password
            })
          })
          
          if (loginResponse.ok) {
            const loginData = await loginResponse.json()
            onLogin(loginData.user)
          }
        }
      } else {
        setError(data.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      setError('Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
        
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                    NAMA LENGKAP
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={!isLogin}
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-yellow-200 border-3 border-black rounded-xl font-bold text-black placeholder-gray-600 focus:bg-yellow-300 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
              )}
            
              <div>
                <label htmlFor="email" className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                  📧 EMAIL
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-blue-200 border-3 border-black rounded-xl font-bold text-black placeholder-gray-600 focus:bg-blue-300 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200"
                  placeholder="Masukkan email"
                />
              </div>
            
              <div>
                <label htmlFor="password" className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                  🔒 PASSWORD
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-pink-200 border-3 border-black rounded-xl font-bold text-black placeholder-gray-600 focus:bg-pink-300 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200"
                  placeholder="Masukkan password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-400 border-3 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="font-black text-white uppercase tracking-wide text-center">
                  {error}
                </p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-400 border-3 border-black rounded-xl px-6 py-4 font-black text-black uppercase tracking-wide text-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    <span>MEMPROSES...</span>
                  </div>
                ) : (
                  <span>{isLogin ? 'MASUK SEKARANG' : 'DAFTAR SEKARANG'}</span>
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                  setFormData({ name: '', email: '', password: '' })
                }}
                className="bg-purple-300 border-3 border-black rounded-xl px-4 py-2 font-black text-black uppercase tracking-wide text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
              >
                {isLogin 
                  ? 'BELUM PUNYA AKUN? DAFTAR!' 
                  : 'SUDAH PUNYA AKUN? MASUK!'
                }
              </button>
            </div>
          </form>
         </div>
       </div>
       
       {/* Footer */}
       <div className="absolute bottom-4 left-0 right-0">
         <div className="text-center">
           <p className="text-sm font-bold text-black/70">
             © 2025 Made with ❤️ by <span className="font-black text-black">slucterCode</span>
           </p>
         </div>
       </div>
     </div>
   )
}