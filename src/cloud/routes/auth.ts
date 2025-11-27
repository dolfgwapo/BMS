// NEW FILE - Cloud authentication routes
import { Elysia, t } from 'elysia';
import { cloudDb } from '../config.js';
import { CloudAuth } from '../auth.js';
import { users } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

export const cloudAuth = new Elysia({ prefix: '/cloud' })
  .post('/auth/register', 
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 6 }),
        firstName: t.String({ minLength: 2 }),
        lastName: t.String({ minLength: 2 }),
        username: t.String({ minLength: 3 }),
        role: t.Union([t.Literal('admin'), t.Literal('officer'), t.Literal('client')])
      })
    },
    async ({ body }) => {
      const { email, password, firstName, lastName, username, role } = body;
      
      // Check if user exists in cloud
      const existingUser = await cloudDb
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      
      if (existingUser.length > 0) {
        throw new Error('User already exists in cloud');
      }
      
      const hashedPassword = await CloudAuth.hashPassword(password);
      
      const [user] = await cloudDb
        .insert(users)
        .values({
          email,
          password: hashedPassword,
          firstName,
          lastName,
          username,
          role,
        })
        .returning();
      
      const token = CloudAuth.generateToken({
        userId: user.id,
        role: user.role
      });
      
      return {
        message: 'User registered in cloud',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }
      };
    }
  )
  
  .post('/auth/login',
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String()
      })
    },
    async ({ body }) => {
      const { email, password } = body;
      
      const [user] = await cloudDb
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      const isValid = await CloudAuth.verifyPassword(password, user.password);
      if (!isValid) {
        throw new Error('Invalid credentials');
      }
      
      const token = CloudAuth.generateToken({
        userId: user.id,
        role: user.role
      });
      
      return {
        message: 'Login successful in cloud',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }
      };
    }
  );