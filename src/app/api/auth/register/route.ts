import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Validasi input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Cek apakah user sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Buat user baru
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    })

    // Buat kategori default
    await prisma.category.createMany({
      data: [
        { name: 'Makanan', color: '#EF4444', userId: user.id },
        { name: 'Transportasi', color: '#F59E0B', userId: user.id },
        { name: 'Belanja', color: '#8B5CF6', userId: user.id },
        { name: 'Topup Ewallet', color: '#3B82F6', userId: user.id },
        { name: 'Gaji', color: '#10B981', userId: user.id },
        { name: 'Bonus', color: '#06B6D4', userId: user.id }
      ]
    })

    return NextResponse.json(
      { message: 'User berhasil dibuat', user },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}