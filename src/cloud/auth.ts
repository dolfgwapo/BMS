// NEW FILE - Cloud authentication utilities
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export interface CloudUserPayload {
  userId: string;
  role: string;
}

export class CloudAuth {
  static generateToken(payload: CloudUserPayload): string {
    return jwt.sign(payload, process.env.CLOUD_JWT_SECRET!, { expiresIn: '7d' });
  }

  static verifyToken(token: string): CloudUserPayload {
    return jwt.verify(token, process.env.CLOUD_JWT_SECRET!) as CloudUserPayload;
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}