import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get total transactions count
    const totalTransactions = await prisma.transaction.count({
      where: { userId: user.userId }
    })

    // Get total income
    const incomeResult = await prisma.transaction.aggregate({
      where: {
        userId: user.userId,
        type: 'INCOME'
      },
      _sum: {
        amount: true
      }
    })

    // Get total expense
    const expenseResult = await prisma.transaction.aggregate({
      where: {
        userId: user.userId,
        type: 'EXPENSE'
      },
      _sum: {
        amount: true
      }
    })

    // Get unique categories used
    const categoriesUsed = await prisma.transaction.findMany({
      where: { userId: user.userId },
      select: { categoryId: true },
      distinct: ['categoryId']
    })

    const stats = {
      totalTransactions,
      totalIncome: incomeResult._sum.amount || 0,
      totalExpense: expenseResult._sum.amount || 0,
      categoriesUsed: categoriesUsed.length
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error getting user stats:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}