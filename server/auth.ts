import bcrypt from 'bcryptjs';
import { storage } from './storage';
import { type InsertUser } from '@shared/schema';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function registerUser(username: string, password: string) {
  // Validate input
  if (!username || typeof username !== 'string' || username.length < 3 || username.length > 50) {
    throw new Error('INVALID_USERNAME');
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    throw new Error('INVALID_USERNAME');
  }
  if (!password || typeof password !== 'string' || password.length < 8 || password.length > 128) {
    throw new Error('INVALID_PASSWORD');
  }

  // Check if user exists
  const existingUser = await storage.getUserByUsername(username.toLowerCase());
  if (existingUser) {
    throw new Error('AUTH_FAILED');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await storage.createUser({
    username,
    password: hashedPassword,
  });

  // Create user profile
  await storage.createUserProfile({
    userId: user.id,
  });

  return user;
}

export async function loginUser(username: string, password: string) {
  if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
    throw new Error('AUTH_FAILED');
  }

  const user = await storage.getUserByUsername(username.toLowerCase());
  if (!user) {
    throw new Error('AUTH_FAILED');
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    throw new Error('AUTH_FAILED');
  }

  // Don't return password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
