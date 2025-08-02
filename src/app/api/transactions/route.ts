import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// GET - Ambil semua transaksi user
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
    const type = searchParams.get('type')
    const categoryId = searchParams.get('categoryId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: {
      userId: string
      type?: 'INCOME' | 'EXPENSE' | 'SAVINGS'
      categoryId?: string
      date?: {
        gte?: Date
        lte?: Date
      }
    } = {
      userId: user.userId
    }

    if (type && (type === 'INCOME' || type === 'EXPENSE' || type === 'SAVINGS')) {
      where.type = type
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// POST - Buat transaksi baru
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { amount, description, type, categoryId, date } = await request.json()

    // Validasi input
    if (!amount || !description || !type || !categoryId) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    if (type !== 'INCOME' && type !== 'EXPENSE' && type !== 'SAVINGS') {
      return NextResponse.json(
        { error: 'Tipe transaksi tidak valid' },
        { status: 400 }
      )
    }

    // Verifikasi kategori milik user (kecuali untuk tabungan yang menggunakan kategori khusus)
    let category = null
    if (type !== 'SAVINGS') {
      category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          userId: user.userId
        }
      })

      if (!category) {
        return NextResponse.json(
          { error: 'Kategori tidak ditemukan' },
          { status: 404 }
        )
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        description,
        type,
        categoryId: type === 'SAVINGS' ? categoryId : categoryId, // Untuk tabungan, categoryId berisi nama kategori tabungan
        userId: user.userId,
        date: date ? new Date(date) : new Date()
      },
      include: {
        category: type !== 'SAVINGS' ? true : undefined
      }
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}