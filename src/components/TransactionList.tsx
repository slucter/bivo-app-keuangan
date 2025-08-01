'use client'

import { useEffect, useState } from 'react'

interface Transaction {
  id: string
  amount: number
  description: string
  type: 'INCOME' | 'EXPENSE' | 'SAVINGS'
  date: string
  category: {
    id: string
    name: string
    color: string
  }
}

interface TransactionListProps {
  onUpdate: () => void
  onClose?: () => void
}

export default function TransactionList({ onUpdate, onClose }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: '',
    categoryId: '',
    startDate: '',
    endDate: ''
  })
  const [categories, setCategories] = useState<{ id: string; name: string; color: string }[]>([])

  useEffect(() => {
    fetchTransactions()
    fetchCategories()
  }, [filters])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      
      if (filters.type) queryParams.append('type', filters.type)
      if (filters.categoryId) queryParams.append('categoryId', filters.categoryId)
      if (filters.startDate) queryParams.append('startDate', filters.startDate)
      if (filters.endDate) queryParams.append('endDate', filters.endDate)
      
      const response = await fetch(`/api/transactions?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      try {
        const response = await fetch(`/api/transactions/${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          onUpdate()
          fetchTransactions()
        }
      } catch (error) {
        console.error('Error deleting transaction:', error)
      }
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
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    })
  }

  const clearFilters = () => {
    setFilters({
      type: '',
      categoryId: '',
      startDate: '',
      endDate: ''
    })
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent mr-4"></div>
            <span className="text-xl font-black text-black uppercase tracking-wide">📊 MEMUAT DATA...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 sm:p-6 bg-gradient-to-r from-yellow-300 to-orange-300 border-b-4 border-black">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-black uppercase tracking-wide">📊 SEMUA TRANSAKSI</h2>
          <button
            onClick={onClose}
            className="bg-red-400 border-3 border-black rounded-xl px-4 py-2 font-black text-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
          >
            ❌ TUTUP
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6 p-4 sm:p-6 bg-gradient-to-r from-green-200 to-blue-200 border-3 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">🏷️ TIPE</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 bg-yellow-200 border-3 border-black rounded-xl font-bold text-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200"
              >
                <option value="">SEMUA TIPE</option>
                <option value="INCOME">💰 PEMASUKAN</option>
                <option value="EXPENSE">💸 PENGELUARAN</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">📂 KATEGORI</label>
              <select
                name="categoryId"
                value={filters.categoryId}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 bg-green-200 border-3 border-black rounded-xl font-bold text-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200"
              >
                <option value="">SEMUA KATEGORI</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">📅 DARI TANGGAL</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 bg-blue-200 border-3 border-black rounded-xl font-bold text-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">📅 SAMPAI TANGGAL</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 bg-pink-200 border-3 border-black rounded-xl font-bold text-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-3 bg-purple-400 border-3 border-black rounded-xl font-black text-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
              >
                🔄 RESET
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[50vh] sm:max-h-[60vh] bg-white border-4 border-black rounded-xl">
            {transactions.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gradient-to-r from-orange-300 to-red-300 border-b-4 border-black sticky top-0">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-black text-black uppercase tracking-wider border-r-2 border-black">
                      📅 TANGGAL
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-black text-black uppercase tracking-wider border-r-2 border-black">
                      📝 DESKRIPSI
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-black text-black uppercase tracking-wider border-r-2 border-black">
                      📂 KATEGORI
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-black text-black uppercase tracking-wider border-r-2 border-black">
                      🏷️ TIPE
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-black text-black uppercase tracking-wider border-r-2 border-black">
                      💰 JUMLAH
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-black text-black uppercase tracking-wider">
                      ⚡ AKSI
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y-4 divide-black">
                  {transactions.map((transaction, index) => (
                    <tr key={transaction.id} className={`hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    }`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black border-r-2 border-black">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-black border-r-2 border-black">
                        <div className="max-w-xs truncate" title={transaction.description}>
                          {transaction.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black border-r-2 border-black">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            style={{ backgroundColor: transaction.category.color }}
                          ></div>
                          {transaction.category.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border-r-2 border-black">
                        <span className={`inline-flex px-3 py-2 text-xs font-black rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide ${
                          transaction.type === 'INCOME' 
                            ? 'bg-green-300 text-black' 
                            : transaction.type === 'EXPENSE'
                            ? 'bg-red-300 text-black'
                            : 'bg-blue-300 text-black'
                        }`}>
                          {transaction.type === 'INCOME' ? '💰 MASUK' : transaction.type === 'EXPENSE' ? '💸 KELUAR' : '🏦 TABUNGAN'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-black text-right border-r-2 border-black ${
                        transaction.type === 'INCOME' ? 'text-green-600' : transaction.type === 'EXPENSE' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        <span className="text-lg">
                          {transaction.type === 'INCOME' ? '+' : transaction.type === 'EXPENSE' ? '-' : '+'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="bg-red-400 border-2 border-black rounded-xl px-3 py-2 font-black text-black text-xs uppercase tracking-wide shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
                        >
                          🗑️ HAPUS
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-16 bg-gradient-to-r from-yellow-200 to-orange-200">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-2xl font-black text-black uppercase tracking-wide mb-2">
                  TIDAK ADA TRANSAKSI
                </h3>
                <p className="text-lg font-bold text-black/70">
                  Belum ada transaksi yang sesuai dengan filter yang dipilih.
                </p>
                <div className="mt-6">
                  <button
                    onClick={clearFilters}
                    className="bg-blue-400 border-3 border-black rounded-xl px-6 py-3 font-black text-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
                  >
                    🔄 RESET FILTER
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}