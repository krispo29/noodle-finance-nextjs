import { NextResponse } from 'next/server';
import { clearJwtCookie } from '@/lib/auth/jwt';

export async function POST() {
  await clearJwtCookie();

  return NextResponse.json(
    { success: true },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
