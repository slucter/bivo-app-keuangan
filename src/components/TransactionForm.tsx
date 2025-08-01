'use client'

import { useEffect, useState } from 'react'

interface Category {
  id: string
  name: string
  color: string
}

interface TransactionFormProps {
  onClose: () => void
  onSuccess: () => void
  currentBalance?: number
}

export default function TransactionForm({ onClose, onSuccess, currentBalance = 0 }: TransactionFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE' | 'SAVINGS',
    categoryId: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showBalanceWarning, setShowBalanceWarning] = useState(false)
  const [proceedWithNegative, setProceedWithNegative] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: data[0].id }))
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Cek warning saldo untuk pengeluaran
    if (checkBalanceWarning()) {
      return // Stop submit jika ada warning
    }
    
    // Jika tidak ada warning atau sudah dikonfirmasi, lanjut submit
    await submitTransaction()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Reset warning jika user mengubah input
    if (showBalanceWarning) {
      setShowBalanceWarning(false)
      setProceedWithNegative(false)
    }
  }

  const checkBalanceWarning = () => {
    if (formData.type === 'EXPENSE' && formData.amount) {
      const expenseAmount = parseFloat(formData.amount)
      if (expenseAmount > currentBalance && !proceedWithNegative) {
        setShowBalanceWarning(true)
        return true
      }
    }
    return false
  }

  const handleProceedWithNegative = () => {
    setProceedWithNegative(true)
    setShowBalanceWarning(false)
    // Submit form setelah user konfirmasi
    submitTransaction()
  }

  const submitTransaction = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
      } else {
        setError(data.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      setError('Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-gradient-to-r from-green-300 to-blue-300 border-4 border-black rounded-xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        <div className="p-4 sm:p-6 border-b-4 border-black bg-white">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-black uppercase tracking-wide">
              💰 TAMBAH TRANSAKSI
            </h2>
            <button
              onClick={onClose}
              className="bg-red-400 border-3 border-black rounded-xl px-3 py-2 font-black text-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
            >
              ❌
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-white overflow-y-auto max-h-[70vh]">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-black text-black mb-3 uppercase tracking-wide">
                🏷️ TIPE TRANSAKSI
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'INCOME' })}
                  className={`p-4 rounded-xl border-3 border-black font-black text-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 ${
                    formData.type === 'INCOME'
                      ? 'bg-green-400'
                      : 'bg-gray-200'
                  }`}
                >
                  MASUK
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
                  className={`p-4 rounded-xl border-3 border-black font-black text-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 ${
                    formData.type === 'EXPENSE'
                      ? 'bg-red-400'
                      : 'bg-gray-200'
                  }`}
                >
                  KELUAR
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'SAVINGS' })}
                  className={`p-4 rounded-xl border-3 border-black font-black text-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 ${
                    formData.type === 'SAVINGS'
                      ? 'bg-blue-400'
                      : 'bg-gray-200'
                  }`}
                >
                  TABUNGAN
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-black text-black mb-3 uppercase tracking-wide">
                💰 JUMLAH (RP)
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={handleInputChange}
                className="w-full px-4 py-4 bg-yellow-200 border-3 border-black rounded-xl font-bold text-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200"
                placeholder="MASUKKAN JUMLAH"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-black text-black mb-3 uppercase tracking-wide">
                📝 DESKRIPSI
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-4 bg-blue-200 border-3 border-black rounded-xl font-bold text-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200 resize-none"
                placeholder="MASUKKAN DESKRIPSI TRANSAKSI"
              />
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-black text-black mb-3 uppercase tracking-wide">
                📂 KATEGORI
              </label>
              <select
                id="categoryId"
                name="categoryId"
                required
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full px-4 py-4 bg-green-200 border-3 border-black rounded-xl font-bold text-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200"
              >
                <option value="" className="text-black">PILIH KATEGORI</option>
                {formData.type === 'SAVINGS' ? (
                  <>
                    <option value="tabungan-darurat" className="text-black">🚨 TABUNGAN DARURAT</option>
                    <option value="tabungan-liburan" className="text-black">🏖️ TABUNGAN LIBURAN</option>
                    <option value="tabungan-pendidikan" className="text-black">🎓 TABUNGAN PENDIDIKAN</option>
                    <option value="tabungan-rumah" className="text-black">🏠 TABUNGAN RUMAH</option>
                    <option value="tabungan-kendaraan" className="text-black">🚗 TABUNGAN KENDARAAN</option>
                    <option value="tabungan-investasi" className="text-black">💎 TABUNGAN INVESTASI</option>
                    <option value="tabungan-lainnya" className="text-black">🏦 LAINNYA</option>
                  </>
                ) : (
                  categories.map((category) => (
                    <option key={category.id} value={category.id} className="text-black">
                      {category.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-black text-black mb-3 uppercase tracking-wide">
                📅 TANGGAL
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-4 bg-purple-200 border-3 border-black rounded-xl font-bold text-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200"
              />
            </div>

            {error && (
              <div className="bg-red-300 border-3 border-black rounded-xl px-6 py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">❌</span>
                  <span className="font-black text-black uppercase tracking-wide">{error}</span>
                </div>
              </div>
            )}

            {showBalanceWarning && (
              <div className="bg-orange-300 border-3 border-black rounded-xl px-6 py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">⚠️</span>
                  <span className="font-black text-black uppercase tracking-wide">Saldo tidak cukup!</span>
                </div>
                <p className="text-sm font-bold text-black mb-4">
                  Pengeluaran Rp {parseFloat(formData.amount || '0').toLocaleString('id-ID')} melebihi saldo saat ini Rp {currentBalance.toLocaleString('id-ID')}
                </p>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowBalanceWarning(false)}
                    className="flex-1 px-4 py-3 bg-gray-300 border-3 border-black rounded-xl font-black text-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
                  >
                    ❌ BATAL
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedWithNegative}
                    className="flex-1 px-4 py-3 bg-orange-400 border-3 border-black rounded-xl font-black text-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
                  >
                    ✅ LANJUT SAJA
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 px-6 py-4 bg-gray-300 border-3 border-black rounded-xl font-black text-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
              >
                ❌ BATAL
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 px-6 py-4 bg-green-400 border-3 border-black rounded-xl font-black text-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:hover:translate-x-0 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-3 border-black border-t-transparent mr-3"></div>
                    💾 MENYIMPAN...
                  </div>
                ) : (
                  '💾 SIMPAN'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}