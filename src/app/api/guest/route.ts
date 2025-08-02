import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { guestId, name } = await request.json()
    
    // Cek apakah guest user sudah ada
    let guestUser = await prisma.user.findUnique({
      where: { id: guestId }
    })
    
    // Jika belum ada, buat guest user baru
    if (!guestUser) {
      guestUser = await prisma.user.create({
        data: {
          id: guestId,
          name: name,
          email: null,
          password: null,
          isGuest: true
        }
      })
      
      // Buat kategori default untuk guest
      await prisma.category.createMany({
        data: [
          { name: 'Makanan', color: '#EF4444', userId: guestId },
          { name: 'Transport', color: '#3B82F6', userId: guestId },
          { name: 'Belanja', color: '#10B981', userId: guestId },
          { name: 'Hiburan', color: '#F59E0B', userId: guestId },
          { name: 'Lainnya', color: '#6B7280', userId: guestId }
        ]
      })
    }
    
    return NextResponse.json({ user: guestUser })
  } catch (error) {
    console.error('Guest creation error:', error)
    return NextResponse.json(
      { error: 'Gagal membuat pengguna tamu' },
      { status: 500 }
    )
  }
}