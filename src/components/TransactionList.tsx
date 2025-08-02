'use client'

import { useEffect, useState, useCallback } from 'react'

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

  const fetchTransactions = useCallback(async () => {
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
  }, [filters])

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
    fetchCategories()
  }, [fetchTransactions, fetchCategories])

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
      <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
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
    <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50 p-1 sm:p-4">
      <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg sm:rounded-xl border-2 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-6xl h-[85vh] sm:h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-2 sm:p-6 bg-gradient-to-r from-yellow-300 to-orange-300 border-b-2 sm:border-b-4 border-black">
          <h2 className="text-sm sm:text-2xl lg:text-3xl font-black text-black uppercase tracking-wide">📊 SEMUA TRANSAKSI</h2>
          <button
            onClick={onClose}
            className="bg-red-400 border-2 sm:border-3 border-black rounded-lg sm:rounded-xl px-2 sm:px-4 py-1 sm:py-2 font-black text-black uppercase tracking-wide shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] sm:hover:translate-x-[2px] sm:hover:translate-y-[2px] transition-all duration-200 text-xs sm:text-base"
          >
            ❌ TUTUP
          </button>
        </div>

        <div className="p-2 sm:p-6 overflow-y-auto max-h-[calc(98vh-80px)] sm:max-h-[calc(90vh-120px)]">
          <div className="mb-3 sm:mb-6 p-3 sm:p-6 bg-gradient-to-r from-green-200 to-blue-200 border-2 sm:border-3 border-black rounded-lg sm:rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
              <div className="col-span-1">
                <label className="block text-xs sm:text-sm font-black text-black mb-1 sm:mb-2 uppercase tracking-wide">🏷️ TIPE</label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="w-full px-2 sm:px-3 py-2 sm:py-3 bg-yellow-200 border-2 sm:border-3 border-black rounded-lg sm:rounded-xl font-bold text-black focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] sm:focus:translate-x-[-2px] sm:focus:translate-y-[-2px] transition-all duration-200 text-xs sm:text-sm"
                >
                  <option value="">SEMUA TIPE</option>
                  <option value="INCOME">💰 PEMASUKAN</option>
                  <option value="EXPENSE">💸 PENGELUARAN</option>
                </select>
              </div>
              
              <div className="col-span-1">
                <label className="block text-xs sm:text-sm font-black text-black mb-1 sm:mb-2 uppercase tracking-wide">📂 KATEGORI</label>
                <select
                  name="categoryId"
                  value={filters.categoryId}
                  onChange={handleFilterChange}
                  className="w-full px-2 sm:px-3 py-2 sm:py-3 bg-green-200 border-2 sm:border-3 border-black rounded-lg sm:rounded-xl font-bold text-black focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] sm:focus:translate-x-[-2px] sm:focus:translate-y-[-2px] transition-all duration-200 text-xs sm:text-sm"
                >
                  <option value="">SEMUA KATEGORI</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                <label className="block text-xs sm:text-sm font-black text-black mb-1 sm:mb-2 uppercase tracking-wide">📅 DARI</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-2 sm:px-3 py-2 sm:py-3 bg-blue-200 border-2 sm:border-3 border-black rounded-lg sm:rounded-xl font-bold text-black focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] sm:focus:translate-x-[-2px] sm:focus:translate-y-[-2px] transition-all duration-200 text-xs sm:text-sm min-w-0"
                />
              </div>
              
              <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                <label className="block text-xs sm:text-sm font-black text-black mb-1 sm:mb-2 uppercase tracking-wide">📅 SAMPAI</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-2 sm:px-3 py-2 sm:py-3 bg-pink-200 border-2 sm:border-3 border-black rounded-lg sm:rounded-xl font-bold text-black focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] sm:focus:translate-x-[-2px] sm:focus:translate-y-[-2px] transition-all duration-200 text-xs sm:text-sm min-w-0"
                />
              </div>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-2 sm:px-4 py-2 sm:py-3 bg-purple-400 border-2 sm:border-3 border-black rounded-lg sm:rounded-xl font-black text-black uppercase tracking-wide shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transition-all duration-200 text-xs sm:text-base"
              >
                🔄 RESET
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[50vh] sm:max-h-[60vh] bg-white border-2 sm:border-4 border-black rounded-lg sm:rounded-xl">
            {transactions.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gradient-to-r from-orange-300 to-red-300 border-b-2 sm:border-b-4 border-black sticky top-0">
                  <tr>
                    <th className="px-2 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-black text-black uppercase tracking-wider border-r-1 sm:border-r-2 border-black">
                      📅 TANGGAL
                    </th>
                    <th className="px-2 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-black text-black uppercase tracking-wider border-r-1 sm:border-r-2 border-black">
                      📝 DESKRIPSI
                    </th>
                    <th className="px-2 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-black text-black uppercase tracking-wider border-r-1 sm:border-r-2 border-black hidden sm:table-cell">
                      📂 KATEGORI
                    </th>
                    <th className="px-2 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-black text-black uppercase tracking-wider border-r-1 sm:border-r-2 border-black hidden sm:table-cell">
                      🏷️ TIPE
                    </th>
                    <th className="px-2 sm:px-6 py-2 sm:py-4 text-right text-xs sm:text-sm font-black text-black uppercase tracking-wider border-r-1 sm:border-r-2 border-black">
                      💰 JUMLAH
                    </th>
                    <th className="px-2 sm:px-6 py-2 sm:py-4 text-center text-xs sm:text-sm font-black text-black uppercase tracking-wider">
                      ⚡ AKSI
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y-2 sm:divide-y-4 divide-black">
                  {transactions.map((transaction, index) => (
                    <tr key={transaction.id} className={`hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    }`}>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-bold text-black border-r-1 sm:border-r-2 border-black">
                        <div className="sm:hidden">{formatDate(transaction.date).split(' ').slice(0, 2).join(' ')}</div>
                        <div className="hidden sm:block">{formatDate(transaction.date)}</div>
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-bold text-black border-r-1 sm:border-r-2 border-black">
                        <div className="max-w-[100px] sm:max-w-xs truncate" title={transaction.description}>
                          {transaction.description}
                        </div>
                        <div className="sm:hidden text-xs text-gray-600 mt-1">
                          <div className="flex items-center">
                            <div 
                              className="w-2 h-2 rounded-full mr-1 border border-black"
                              style={{ backgroundColor: transaction.category.color }}
                            ></div>
                            {transaction.category.name}
                          </div>
                          <span className={`inline-flex px-1 py-0.5 text-xs font-black rounded border border-black mt-1 ${
                            transaction.type === 'INCOME' 
                              ? 'bg-green-300 text-black' 
                              : transaction.type === 'EXPENSE'
                              ? 'bg-red-300 text-black'
                              : 'bg-blue-300 text-black'
                          }`}>
                            {transaction.type === 'INCOME' ? '💰' : transaction.type === 'EXPENSE' ? '💸' : '🏦'}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-bold text-black border-r-1 sm:border-r-2 border-black hidden sm:table-cell">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            style={{ backgroundColor: transaction.category.color }}
                          ></div>
                          {transaction.category.name}
                        </div>
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap border-r-1 sm:border-r-2 border-black hidden sm:table-cell">
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
                      <td className={`px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-black text-right border-r-1 sm:border-r-2 border-black ${
                        transaction.type === 'INCOME' ? 'text-green-600' : transaction.type === 'EXPENSE' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        <span className="text-sm sm:text-lg">
                          {transaction.type === 'INCOME' ? '+' : transaction.type === 'EXPENSE' ? '-' : '+'}
                          <div className="sm:hidden">{formatCurrency(transaction.amount).replace('Rp', '').replace(',00', '').trim()}</div>
                          <div className="hidden sm:block">{formatCurrency(transaction.amount)}</div>
                        </span>
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="bg-red-400 border-1 sm:border-2 border-black rounded-lg sm:rounded-xl px-1 sm:px-3 py-1 sm:py-2 font-black text-black text-xs uppercase tracking-wide shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transition-all duration-200"
                        >
                          <span className="sm:hidden">🗑️</span>
                          <span className="hidden sm:inline">🗑️ HAPUS</span>
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