'use client'

import { useEffect, useState, useCallback } from 'react'
import TransactionForm from './TransactionForm'
import TransactionList from './TransactionList'

interface DashboardData {
  summary: {
    totalIncome: number
    totalExpense: number
    totalSavings: number
    balance: number
    month: number
    year: number
  }
  expensesByCategory: Array<{
    category: string
    color: string
    amount: number
    count: number
  }>
  recentTransactions: Array<{
    id: string
    amount: number
    description: string
    type: 'INCOME' | 'EXPENSE' | 'SAVINGS'
    date: string
    category: {
      name: string
      color: string
    }
  }>
  monthlyTrend: Array<{
    month: string
    income: number
    expense: number
    savings: number
  }>
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [showAllTransactions, setShowAllTransactions] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<DashboardData['recentTransactions'][0] | null>(null)
  const [showTransactionDetail, setShowTransactionDetail] = useState(false)



  // Filter state
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      }
      const response = await fetch(`/api/dashboard?year=${selectedYear}&month=${selectedMonth}`)
      if (response.ok) {
        const dashboardData = await response.json()
        setData(dashboardData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [selectedYear, selectedMonth])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

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
      month: 'short',
      year: 'numeric'
    })
  }

  const truncateText = (text: string, maxLength: number = 30) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const handleTransactionClick = (transaction: DashboardData['recentTransactions'][0]) => {
    setSelectedTransaction(transaction)
    setShowTransactionDetail(true)
  }

  const closeTransactionDetail = () => {
    setSelectedTransaction(null)
    setShowTransactionDetail(false)
  }

  // Generate year options (current year ± 5 years)
  const generateYearOptions = () => {
    const years = []
    const currentYear = new Date().getFullYear()
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i)
    }
    return years
  }

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  if (loading) {
    return (
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
    )
  }

  if (!data) {
    return (
      <div className="text-center text-gray-500">
        Gagal memuat data dashboard
      </div>
    )
  }

  return (
    <div className="space-y-8 p-4">
      {/* Neobrutalism Header with Period Filter */}
      <div className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 p-1 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black">
        <div className="bg-white p-6 rounded-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-black mb-2 tracking-tight">
                💰 DASHBOARD KEUANGAN
              </h1>
              <p className="text-lg font-bold text-gray-700">
                Periode: {monthNames[selectedMonth - 1]} {selectedYear}
              </p>
            </div>
            
            {/* Period Selector */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Year Selector */}
              <div className="relative">
                <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                  📅 TAHUN
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-yellow-300 border-4 border-black rounded-xl font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200 cursor-pointer"
                >
                  {generateYearOptions().map(year => (
                    <option key={year} value={year} className="font-black">
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Month Selector */}
              <div className="relative">
                <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                  📆 BULAN
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-pink-300 border-4 border-black rounded-xl font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200 cursor-pointer"
                >
                  {monthNames.map((month, index) => (
                    <option key={index + 1} value={index + 1} className="font-black">
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Neobrutalism Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {refreshing ? (
          // Loading placeholders
          <>
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
          </>
        ) : (
          <>
            {/* Income Card */}
            <div className="bg-green-400 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-200 p-4 sm:p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs sm:text-sm font-black text-black uppercase tracking-wide flex items-center gap-2">
                    <span className="hidden sm:inline text-lg">💰</span>
                    PEMASUKAN
                  </p>
                  <div className="hidden sm:block text-2xl lg:text-3xl">📈</div>
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-black text-black break-all mt-auto">
                  {formatCurrency(data.summary.totalIncome)}
                </p>
              </div>
            </div>

            {/* Expense Card */}
            <div className="bg-red-400 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-200 p-4 sm:p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs sm:text-sm font-black text-black uppercase tracking-wide flex items-center gap-2">
                    <span className="hidden sm:inline text-lg">💸</span>
                    PENGELUARAN
                  </p>
                  <div className="hidden sm:block text-2xl lg:text-3xl">📉</div>
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-black text-black break-all mt-auto">
                  {formatCurrency(data.summary.totalExpense)}
                </p>
              </div>
            </div>

            {/* Savings Card */}
            <div className="bg-blue-400 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-200 p-4 sm:p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs sm:text-sm font-black text-black uppercase tracking-wide flex items-center gap-2">
                    <span className="hidden sm:inline text-lg">🏦</span>
                    TABUNGAN
                  </p>
                  <div className="hidden sm:block text-2xl lg:text-3xl">💎</div>
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-black text-black break-all mt-auto">
                  {formatCurrency(data.summary.totalSavings)}
                </p>
              </div>
            </div>

            {/* Balance Card */}
            <div className={`border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-200 p-4 sm:p-6 ${
              data.summary.balance >= 0 ? 'bg-yellow-400' : 'bg-orange-400'
            }`}>
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs sm:text-sm font-black text-black uppercase tracking-wide flex items-center gap-2">
                    <span className="hidden sm:inline text-lg">💳</span>
                    SALDO
                  </p>
                  <div className="hidden sm:block text-2xl lg:text-3xl">
                    {data.summary.balance >= 0 ? '🎯' : '⚠️'}
                  </div>
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-black text-black break-all mt-auto">
                  {formatCurrency(data.summary.balance)}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Neobrutalism Action Buttons */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <button
          onClick={() => setShowTransactionForm(true)}
          className="bg-cyan-400 border-4 border-black rounded-2xl px-4 sm:px-6 py-3 sm:py-4 font-black text-black text-sm sm:text-base uppercase tracking-wide shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 flex items-center justify-center gap-2"
        >
          <span className="text-lg sm:text-2xl">➕</span>
          TAMBAH TRANSAKSI
        </button>
        <button
          onClick={() => setShowAllTransactions(!showAllTransactions)}
          className="bg-purple-400 border-4 border-black rounded-2xl px-4 sm:px-6 py-3 sm:py-4 font-black text-black text-sm sm:text-base uppercase tracking-wide shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 flex items-center justify-center gap-2"
        >
          <span className="text-lg sm:text-2xl">{showAllTransactions ? '👁️‍🗨️' : '👀'}</span>
          {showAllTransactions ? 'SEMBUNYIKAN' : 'LIHAT SEMUA'} TRANSAKSI
        </button>
      </div>

      {/* Neobrutalism Charts and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Expenses by Category */}
        <div className="bg-orange-300 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 md:p-6">
          <h3 className="text-xl font-black text-black mb-6 uppercase tracking-wide flex items-center gap-2">
            📊 PENGELUARAN PER KATEGORI
          </h3>
          {data.expensesByCategory.length > 0 ? (
            <div className="space-y-4">
              {data.expensesByCategory.map((item, index) => (
                <div key={index} className="bg-white border-3 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-6 h-6 rounded-full mr-3 border-2 border-black"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="font-bold text-black">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-black">
                        {formatCurrency(item.amount)}
                      </div>
                      <div className="text-sm font-bold text-gray-700">
                        {item.count} transaksi
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border-3 border-black rounded-xl p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-4xl mb-2">😴</div>
              <p className="font-bold text-black">
                Belum ada pengeluaran bulan ini
              </p>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-lime-300 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 md:p-6">
          <h3 className="text-xl font-black text-black mb-6 uppercase tracking-wide flex items-center gap-2">
            🕒 TRANSAKSI TERBARU
          </h3>
          {data.recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {data.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="bg-white border-3 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-3 border-2 border-black"
                        style={{ backgroundColor: transaction.category.color }}
                      ></div>
                      <div className="flex-1">
                        <div 
                          className="font-bold text-black cursor-pointer hover:text-blue-600 transition-colors duration-200"
                          onClick={() => handleTransactionClick(transaction)}
                          title={transaction.description}
                        >
                          {truncateText(transaction.description)}
                        </div>
                        <div className="text-sm font-bold text-gray-700">
                          {transaction.category.name} • {formatDate(transaction.date)}
                        </div>
                      </div>
                    </div>
                    <div className={`font-black ${
                      transaction.type === 'INCOME' ? 'text-green-700' : transaction.type === 'EXPENSE' ? 'text-red-700' : 'text-blue-700'
                    }`}>
                      <span className="text-lg">
                        {transaction.type === 'INCOME' ? '💰+' : transaction.type === 'EXPENSE' ? '💸-' : '🏦+'}
                      </span>
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border-3 border-black rounded-xl p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-4xl mb-2">📝</div>
              <p className="font-bold text-black">
                Belum ada transaksi
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Neobrutalism Monthly Trend */}
      <div className="bg-pink-300 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 md:p-6">
        <h3 className="text-xl font-black text-black mb-6 uppercase tracking-wide flex items-center gap-2">
          📈 TREND 6 BULAN TERAKHIR
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
          {data.monthlyTrend.map((month, index) => (
            <div key={index} className="bg-white border-3 border-black rounded-xl p-3 sm:p-4 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200">
              <div className="font-black text-black mb-3 text-xs sm:text-sm uppercase border-b-2 border-black pb-2">{month.month}</div>
              <div className="space-y-2">
                <div className="bg-green-100 border-2 border-green-600 rounded-lg p-2">
                  <div className="text-xs font-black text-green-800 uppercase tracking-wide mb-1">PEMASUKAN</div>
                  <div className="text-xs sm:text-sm font-bold text-green-700">
                    +{formatCurrency(month.income)}
                  </div>
                </div>
                <div className="bg-red-100 border-2 border-red-600 rounded-lg p-2">
                  <div className="text-xs font-black text-red-800 uppercase tracking-wide mb-1">PENGELUARAN</div>
                  <div className="text-xs sm:text-sm font-bold text-red-700">
                    -{formatCurrency(month.expense)}
                  </div>
                </div>
                <div className="bg-blue-100 border-2 border-blue-600 rounded-lg p-2">
                  <div className="text-xs font-black text-blue-800 uppercase tracking-wide mb-1">TABUNGAN</div>
                  <div className="text-xs sm:text-sm font-bold text-blue-700">
                    +{formatCurrency(month.savings)}
                  </div>
                </div>
                <div className={`border-2 border-black rounded-lg py-2 px-1 ${
                  (month.income - month.expense - month.savings) >= 0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  <div className="text-xs font-black uppercase tracking-wide mb-1">
                    {(month.income - month.expense - month.savings) >= 0 ? 'SURPLUS' : 'DEFISIT'}
                  </div>
                  <div className="text-xs sm:text-sm font-black">
                    {formatCurrency(Math.abs(month.income - month.expense - month.savings))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <TransactionForm
          onClose={() => setShowTransactionForm(false)}
          onSuccess={() => {
            setShowTransactionForm(false)
            fetchDashboardData(true)
          }}
          currentBalance={data.summary.balance}
        />
      )}

      {/* All Transactions */}
      {showAllTransactions && (
        <TransactionList 
          onUpdate={fetchDashboardData} 
          onClose={() => setShowAllTransactions(false)}
        />
      )}

      {/* Transaction Detail Modal */}
      {showTransactionDetail && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border-4 border-black rounded-2xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-md">
            <div className="p-6 border-b-4 border-black bg-gradient-to-r from-yellow-300 to-orange-300">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-black uppercase tracking-wide">
                  📋 DETAIL TRANSAKSI
                </h2>
                <button
                  onClick={closeTransactionDetail}
                  className="bg-red-400 border-3 border-black rounded-xl px-3 py-2 font-black text-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
                >
                  ❌
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                  📝 DESKRIPSI
                </label>
                <p className="bg-gray-100 border-2 border-black rounded-lg p-3 font-bold text-black break-words">
                  {selectedTransaction.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                    💰 JUMLAH
                  </label>
                  <p className={`font-black text-lg ${
                    selectedTransaction.type === 'INCOME' ? 'text-green-600' : selectedTransaction.type === 'EXPENSE' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {selectedTransaction.type === 'INCOME' ? '+' : selectedTransaction.type === 'EXPENSE' ? '-' : '+'}
                    {formatCurrency(selectedTransaction.amount)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                    🏷️ TIPE
                  </label>
                  <span className={`inline-flex px-3 py-2 text-xs font-black rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide ${
                    selectedTransaction.type === 'INCOME' 
                      ? 'bg-green-300 text-black' 
                      : selectedTransaction.type === 'EXPENSE'
                      ? 'bg-red-300 text-black'
                      : 'bg-blue-300 text-black'
                  }`}>
                    {selectedTransaction.type === 'INCOME' ? 'MASUK' : selectedTransaction.type === 'EXPENSE' ? 'KELUAR' : 'TABUNGAN'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                  📂 KATEGORI
                </label>
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    style={{ backgroundColor: selectedTransaction.category.color }}
                  ></div>
                  <span className="font-bold text-black">{selectedTransaction.category.name}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                  📅 TANGGAL
                </label>
                <p className="font-bold text-black">
                  {formatDate(selectedTransaction.date)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Neobrutalism Footer */}
      <footer className="mt-8 sm:mt-12 flex justify-center">
        <div className="bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 max-w-2xl w-full">
          <div className="text-center">
            <p className="text-sm sm:text-base font-black text-black uppercase tracking-wide mb-2">
              © 2024 KEUANGAN APP
            </p>
            <p className="text-xs sm:text-sm font-bold text-black">
              Made with ❤️ & AI by <span className="font-black">slucterCode</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}