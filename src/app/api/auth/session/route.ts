import { NextResponse } from 'next/server';
import { verifyJwt, getJwtCookie } from '@/lib/auth/jwt';

export async function GET() {
  try {
    const token = await getJwtCookie();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const payload = await verifyJwt(token);
    
    return NextResponse.json({
      userId: payload.userId,
      shopName: payload.shopName,
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}
