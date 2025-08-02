'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

interface ProfileStats {
  totalTransactions: number
  totalIncome: number
  totalExpense: number
  categoriesUsed: number
}

interface ProfileProps {
  onClose: () => void
}

export default function Profile({ onClose }: ProfileProps) {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', email: '' })
  const [updateLoading, setUpdateLoading] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      // Fetch user data
      const userResponse = await fetch('/api/auth/me')
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData.user)
        setEditForm({ name: userData.user.name, email: userData.user.email })
      }

      // Fetch user stats
      const statsResponse = await fetch('/api/user/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdateLoading(true)

    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser.user)
        setIsEditing(false)
      } else {
        alert('Gagal mengupdate profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Terjadi kesalahan saat mengupdate profile')
    } finally {
      setUpdateLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-gradient-to-br from-yellow-400 to-pink-400 rounded-2xl p-8 max-w-md w-full border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 p-1 sm:p-4">
      <div className="bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 p-1 sm:p-2 rounded-lg sm:rounded-2xl border-2 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[98vh] sm:max-h-[90vh] overflow-y-auto transform hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transition-all duration-200">
        <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-3 sm:mb-6">
            <h2 className="text-sm sm:text-2xl font-black text-black uppercase tracking-wide flex items-center gap-1 sm:gap-2">
              👤 PROFILE SAYA
            </h2>
            <button
              onClick={onClose}
              className="bg-red-400 border-2 sm:border-3 border-black rounded-lg sm:rounded-xl px-2 sm:px-4 py-1 sm:py-2 font-black text-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transition-all duration-200 text-xs sm:text-base"
            >
              ✕
            </button>
          </div>

          {user && (
            <div className="space-y-3 sm:space-y-6">
              {/* User Info Section */}
              <div className="bg-cyan-300 border-2 sm:border-3 border-black rounded-lg sm:rounded-xl p-2 sm:p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-sm sm:text-lg font-black text-black mb-2 sm:mb-4 uppercase tracking-wide flex items-center gap-1 sm:gap-2">
                  📋 INFORMASI AKUN
                </h3>
                
                {!isEditing ? (
                  <div className="space-y-2 sm:space-y-4">
                    <div className="bg-white border-1 sm:border-2 border-black rounded-lg p-2 sm:p-4">
                      <label className="block text-xs sm:text-sm font-black text-gray-700 uppercase tracking-wide mb-1">
                        👤 NAMA
                      </label>
                      <p className="font-bold text-black text-sm sm:text-lg">{user.name}</p>
                    </div>
                    
                    <div className="bg-white border-1 sm:border-2 border-black rounded-lg p-2 sm:p-4">
                      <label className="block text-xs sm:text-sm font-black text-gray-700 uppercase tracking-wide mb-1">
                        📧 EMAIL
                      </label>
                      <p className="font-bold text-black text-sm sm:text-lg break-all">{user.email}</p>
                    </div>
                    
                    <div className="bg-white border-1 sm:border-2 border-black rounded-lg p-2 sm:p-4">
                      <label className="block text-xs sm:text-sm font-black text-gray-700 uppercase tracking-wide mb-1">
                        📅 BERGABUNG SEJAK
                      </label>
                      <p className="font-bold text-black text-sm sm:text-lg">{formatDate(user.createdAt)}</p>
                    </div>
                    
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-yellow-400 border-2 sm:border-3 border-black rounded-lg sm:rounded-xl px-3 sm:px-6 py-2 sm:py-3 font-black text-black uppercase tracking-wide shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transition-all duration-200 w-full text-xs sm:text-base"
                    >
                      ✏️ EDIT PROFILE
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="space-y-2 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-black text-black uppercase tracking-wide mb-1 sm:mb-2">
                        👤 NAMA
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-2 sm:px-4 py-2 sm:py-3 bg-white border-2 sm:border-3 border-black rounded-lg sm:rounded-xl font-bold text-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] sm:focus:translate-x-[-2px] sm:focus:translate-y-[-2px] transition-all duration-200 text-sm sm:text-base"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs sm:text-sm font-black text-black uppercase tracking-wide mb-1 sm:mb-2">
                        📧 EMAIL
                      </label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-2 sm:px-4 py-2 sm:py-3 bg-white border-2 sm:border-3 border-black rounded-lg sm:rounded-xl font-bold text-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] sm:focus:translate-x-[-2px] sm:focus:translate-y-[-2px] transition-all duration-200 text-sm sm:text-base"
                        required
                      />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button
                        type="submit"
                        disabled={updateLoading}
                        className="flex-1 bg-green-400 border-2 sm:border-3 border-black rounded-lg sm:rounded-xl px-3 sm:px-6 py-2 sm:py-3 font-black text-black uppercase tracking-wide shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transition-all duration-200 disabled:opacity-50 text-xs sm:text-base"
                      >
                        {updateLoading ? '⏳ MENYIMPAN...' : '💾 SIMPAN'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false)
                          setEditForm({ name: user.name, email: user.email })
                        }}
                        className="flex-1 bg-gray-400 border-2 sm:border-3 border-black rounded-lg sm:rounded-xl px-3 sm:px-6 py-2 sm:py-3 font-black text-black uppercase tracking-wide shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transition-all duration-200 text-xs sm:text-base"
                      >
                        ❌ BATAL
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Stats Section */}
              {stats && (
                <div className="bg-lime-300 border-2 sm:border-3 border-black rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="text-sm sm:text-lg font-black text-black mb-3 sm:mb-4 uppercase tracking-wide flex items-center gap-2">
                    📊 STATISTIK KEUANGAN
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    <div className="bg-white border-2 border-black rounded-lg p-2 sm:p-4 text-center">
                      <div className="text-lg sm:text-2xl mb-1 sm:mb-2">📝</div>
                      <div className="font-black text-black text-base sm:text-xl">{stats.totalTransactions}</div>
                      <div className="text-xs sm:text-sm font-bold text-gray-700 uppercase">Total Transaksi</div>
                    </div>
                    
                    <div className="bg-white border-2 border-black rounded-lg p-2 sm:p-4 text-center">
                      <div className="text-lg sm:text-2xl mb-1 sm:mb-2">🏷️</div>
                      <div className="font-black text-black text-base sm:text-xl">{stats.categoriesUsed}</div>
                      <div className="text-xs sm:text-sm font-bold text-gray-700 uppercase">Kategori Digunakan</div>
                    </div>
                    
                    <div className="bg-white border-2 border-black rounded-lg p-2 sm:p-4 text-center">
                      <div className="text-lg sm:text-2xl mb-1 sm:mb-2">💰</div>
                      <div className="font-black text-green-700 text-xs sm:text-lg">{formatCurrency(stats.totalIncome)}</div>
                      <div className="text-xs sm:text-sm font-bold text-gray-700 uppercase">Total Pemasukan</div>
                    </div>
                    
                    <div className="bg-white border-2 border-black rounded-lg p-2 sm:p-4 text-center">
                      <div className="text-lg sm:text-2xl mb-1 sm:mb-2">💸</div>
                      <div className="font-black text-red-700 text-xs sm:text-lg">{formatCurrency(stats.totalExpense)}</div>
                      <div className="text-xs sm:text-sm font-bold text-gray-700 uppercase">Total Pengeluaran</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}