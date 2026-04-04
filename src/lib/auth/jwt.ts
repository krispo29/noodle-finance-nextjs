import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

const COOKIE_NAME = 'token';
const MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export interface JWTPayload {
  userId: string;
  shopName: string;
}

/**
 * Sign a JWT token with the given payload
 */
export async function signJwt(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT({
    userId: payload.userId,
    shopName: payload.shopName,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyJwt(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      shopName: payload.shopName as string,
    };
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Set JWT cookie (Server Action helper)
 */
export async function setJwtCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  });
}

/**
 * Get JWT cookie value
 */
export async function getJwtCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

/**
 * Clear JWT cookie
 */
export async function clearJwtCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Get current user from JWT cookie
 */
export async function getCurrentUser(): Promise<JWTPayload | null> {
  try {
    const token = await getJwtCookie();
    if (!token) return null;
    return await verifyJwt(token);
  } catch {
    return null;
  }
}
