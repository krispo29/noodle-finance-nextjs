'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { signJwt, setJwtCookie, clearJwtCookie, getCurrentUser } from '@/lib/auth/jwt';
import { loginSchema, registerSchema } from '@/lib/validations/transaction';

export interface LoginResult {
  success: boolean;
  error?: string;
}

/**
 * Login action
 */
export async function loginAction(
  prevState: any,
  formData: FormData
): Promise<LoginResult> {
  console.log('--- loginAction DEBUG START ---');
  try {
    const emailStr = formData.get('email')?.toString().trim();
    const passwordStr = formData.get('password')?.toString().trim();
    
    console.log('Email received:', emailStr);
    console.log('Password received (exists):', !!passwordStr);

    // Validate input
    const validated = loginSchema.safeParse({
      email: emailStr,
      password: passwordStr,
    });

    if (!validated.success) {
      console.log('Validation failed:', validated.error.format());
      return {
        success: false,
        error: validated.error.errors[0]?.message || 'ข้อมูลไม่ถูกต้อง',
      };
    }

    const { email, password } = validated.data;
    console.log('Validation successful, querying database for:', email);

    // Find user by email
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResult.length === 0) {
      console.log('User not found in database');
      return {
        success: false,
        error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
      };
    }

    const user = userResult[0];
    console.log('User found:', user.email);

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    console.log('Password verification result:', isValidPassword);

    if (!isValidPassword) {
      return {
        success: false,
        error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
      };
    }

    // Create JWT token
    console.log('Signing JWT...');
    const token = await signJwt({
      userId: user.id,
      shopName: user.shopName,
    });

    // Set cookie
    console.log('Setting cookie...');
    await setJwtCookie(token);

    console.log('Login successful! Returning success: true');
    return { success: true };
  } catch (error) {
    console.error('Login error detail:', error);
    return {
      success: false,
      error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
    };
  } finally {
    console.log('--- loginAction DEBUG END ---');
  }
}

/**
 * Logout action
 */
export async function logoutAction(
  prevState: any,
  formData: FormData
) {
  await clearJwtCookie();
  redirect('/login');
}

/**
 * Register action
 */
export async function registerAction(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate input
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

    // Check if email already exists
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

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        shopName,
        ownerName,
        email,
        passwordHash,
      })
      .returning();

    // Create JWT token
    const token = await signJwt({
      userId: newUser[0].id,
      shopName: newUser[0].shopName,
    });

    // Set cookie
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

/**
 * Get current user session
 */
export async function getSessionAction() {
  const user = await getCurrentUser();
  
  if (!user) {
    return { success: false, user: null };
  }

  return { success: true, user };
}
