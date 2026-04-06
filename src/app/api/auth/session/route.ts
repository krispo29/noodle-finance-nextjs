import { NextResponse } from 'next/server';
import { verifyJwt, getJwtCookie } from '@/lib/auth/jwt';

export async function GET() {
  try {
    const token = await getJwtCookie();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated', isAuthenticated: false },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const payload = await verifyJwt(token);
    
    return NextResponse.json(
      {
        userId: payload.userId,
        shopName: payload.shopName,
        expiresAt: payload.expiresAt,
        expiresIn: Math.max(
          0,
          Math.floor((new Date(payload.expiresAt).getTime() - Date.now()) / 1000)
        ),
        isAuthenticated: true,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: 'Invalid token', isAuthenticated: false },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
