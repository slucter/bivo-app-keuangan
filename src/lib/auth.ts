import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export interface JWTPayload {
  userId: string
  email: string
  iat: number
  exp: number
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret'
    ) as JWTPayload
    return decoded
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return null
  }
}

export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  const token = request.cookies.get('token')?.value
  
  if (!token) {
    return null
  }

  return verifyToken(token)
}

export interface GuestUser {
  id: string
  name: string
  isGuest: true
}

export function createGuestId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function getGuestFromStorage(): GuestUser | null {
  if (typeof window === 'undefined') return null
  
  const guestId = localStorage.getItem('guestUserId')
  const guestName = localStorage.getItem('guestUserName')
  
  if (guestId && guestName) {
    return {
      id: guestId,
      name: guestName,
      isGuest: true
    }
  }
  
  return null
}

export function setGuestToStorage(guestUser: GuestUser): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('guestUserId', guestUser.id)
  localStorage.setItem('guestUserName', guestUser.name)
}

export function clearGuestFromStorage(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('guestUserId')
  localStorage.removeItem('guestUserName')
}