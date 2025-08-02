import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// PUT - Update transaksi
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { amount, description, type, categoryId, date } = await request.json()
    const resolvedParams = await params
    const transactionId = resolvedParams.id

    // Cek apakah transaksi milik user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId: user.userId
      }
    })

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      )
    }

    // Verifikasi kategori jika diubah
    if (categoryId) {
      const category = await prisma.category.findFirst({
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

    const updateData: {
      amount?: number
      description?: string
      type?: 'INCOME' | 'EXPENSE' | 'SAVINGS'
      categoryId?: string
      date?: Date
    } = {}
    if (amount !== undefined) updateData.amount = parseFloat(amount)
    if (description !== undefined) updateData.description = description
    if (type !== undefined) updateData.type = type
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (date !== undefined) updateData.date = new Date(date)

    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: updateData,
      include: {
        category: true
      }
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// DELETE - Hapus transaksi
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const transactionId = resolvedParams.id

    // Cek apakah transaksi milik user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId: user.userId
      }
    })

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      )
    }

    await prisma.transaction.delete({
      where: { id: transactionId }
    })

    return NextResponse.json(
      { message: 'Transaksi berhasil dihapus' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}