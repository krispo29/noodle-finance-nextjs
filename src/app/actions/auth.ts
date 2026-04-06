'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import {
  AUTH_MAX_AGE_SECONDS,
  clearJwtCookie,
  getCurrentUser,
  setJwtCookie,
  signJwt,
} from '@/lib/auth/jwt';
import { loginSchema, registerSchema } from '@/lib/validations/transaction';

export interface LoginResult {
  success: boolean;
  error?: string;
}

function getExpiresAtIso() {
  return new Date(Date.now() + AUTH_MAX_AGE_SECONDS * 1000).toISOString();
}

export async function loginAction(
  prevState: unknown,
  formData: FormData
): Promise<LoginResult> {
  try {
    const validated = loginSchema.safeParse({
      email: formData.get('email')?.toString().trim(),
      password: formData.get('password')?.toString().trim(),
    });

    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || 'ข้อมูลไม่ถูกต้อง',
      };
    }

    const { email, password } = validated.data;

    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResult.length === 0) {
      return {
        success: false,
        error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
      };
    }

    const user = userResult[0];
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return {
        success: false,
        error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
      };
    }

    const token = await signJwt({
      userId: user.id,
      shopName: user.shopName,
      expiresAt: getExpiresAtIso(),
    });

    await setJwtCookie(token);

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
    };
  }
}

export async function logoutAction(prevState: unknown, formData: FormData) {
  await clearJwtCookie();
  redirect('/login');
}

export async function registerAction(
  prevState: unknown,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = registerSchema.safeParse({
      shopName: formData.get('shopName'),
      ownerName: formData.get('ownerName'),
      email: formData.get('email'),
      password: formData.get('password'),
    });

    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || 'ข้อมูลไม่ถูกต้อง',
      };
    }

    const { shopName, ownerName, email, password } = validated.data;

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return {
        success: false,
        error: 'อีเมลนี้ถูกใช้งานแล้ว',
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await db
      .insert(users)
      .values({
        shopName,
        ownerName,
        email,
        passwordHash,
      })
      .returning();

    const token = await signJwt({
      userId: newUser[0].id,
      shopName: newUser[0].shopName,
      expiresAt: getExpiresAtIso(),
    });

    await setJwtCookie(token);

    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
    };
  }
}

export async function getSessionAction() {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, user: null };
  }

  return { success: true, user };
}
