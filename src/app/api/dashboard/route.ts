import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// GET - Ambil data dashboard
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    // Default ke bulan dan tahun saat ini
    const currentDate = new Date()
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1
    const targetYear = year ? parseInt(year) : currentDate.getFullYear()

    // Tanggal awal dan akhir bulan
    const startDate = new Date(targetYear, targetMonth - 1, 1)
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59)

    // Total pemasukan bulan ini
    const totalIncome = await prisma.transaction.aggregate({
      where: {
        userId: user.userId,
        type: 'INCOME',
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true
      }
    })

    // Total pengeluaran bulan ini
    const totalExpense = await prisma.transaction.aggregate({
      where: {
        userId: user.userId,
        type: 'EXPENSE',
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true
      }
    })

    // Total tabungan bulan ini
    const totalSavings = await prisma.transaction.aggregate({
      where: {
        userId: user.userId,
        type: 'SAVINGS',
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true
      }
    })

    // Saldo (pemasukan - pengeluaran - tabungan)
    const balance = (totalIncome._sum.amount || 0) - (totalExpense._sum.amount || 0) - (totalSavings._sum.amount || 0)

    // Transaksi per kategori bulan ini
    const expensesByCategory = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId: user.userId,
        type: 'EXPENSE',
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    })

    // Ambil detail kategori
    const categoryIds = expensesByCategory.map(item => item.categoryId)
    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds
        }
      }
    })

    const expensesWithCategories = expensesByCategory.map(expense => {
      const category = categories.find(cat => cat.id === expense.categoryId)
      return {
        category: category?.name || 'Unknown',
        color: category?.color || '#6B7280',
        amount: expense._sum.amount || 0,
        count: expense._count.id
      }
    })

    // Transaksi terbaru (5 terakhir)
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        userId: user.userId
      },
      include: {
        category: true
      },
      orderBy: {
        date: 'desc'
      },
      take: 5
    })

    // Trend 6 bulan terakhir
    const monthlyTrend = []
    for (let i = 5; i >= 0; i--) {
      const trendDate = new Date(targetYear, targetMonth - 1 - i, 1)
      const trendEndDate = new Date(targetYear, targetMonth - i, 0, 23, 59, 59)
      
      const monthIncome = await prisma.transaction.aggregate({
        where: {
          userId: user.userId,
          type: 'INCOME',
          date: {
            gte: trendDate,
            lte: trendEndDate
          }
        },
        _sum: {
          amount: true
        }
      })

      const monthExpense = await prisma.transaction.aggregate({
        where: {
          userId: user.userId,
          type: 'EXPENSE',
          date: {
            gte: trendDate,
            lte: trendEndDate
          }
        },
        _sum: {
          amount: true
        }
      })

      const monthSavings = await prisma.transaction.aggregate({
        where: {
          userId: user.userId,
          type: 'SAVINGS',
          date: {
            gte: trendDate,
            lte: trendEndDate
          }
        },
        _sum: {
          amount: true
        }
      })

      monthlyTrend.push({
        month: trendDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
        income: monthIncome._sum.amount || 0,
        expense: monthExpense._sum.amount || 0,
        savings: monthSavings._sum.amount || 0
      })
    }

    return NextResponse.json({
      summary: {
        totalIncome: totalIncome._sum.amount || 0,
        totalExpense: totalExpense._sum.amount || 0,
        totalSavings: totalSavings._sum.amount || 0,
        balance,
        month: targetMonth,
        year: targetYear
      },
      expensesByCategory: expensesWithCategories,
      recentTransactions,
      monthlyTrend
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}