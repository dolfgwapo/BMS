// NEW FILE - Cloud-specific report routes
import { Elysia, t } from 'elysia';
import { cloudDb } from '../config.js';
import { CloudAuth } from '../auth.js';
import { reports, users } from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';

export const cloudReports = new Elysia({ prefix: '/cloud' })
  .derive(async ({ headers }) => {
    const authHeader = headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('Unauthorized');
    }
    
    const token = authHeader.substring(7);
    const payload = CloudAuth.verifyToken(token);
    
    return { cloudUser: payload };
  })
  
  // Get reports with cloud filtering
  .get('/reports', async ({ cloudUser, query }) => {
    const { role, userId } = cloudUser;
    
    let reportsQuery = cloudDb
      .select()
      .from(reports)
      .orderBy(desc(reports.createdAt));
    
    // Role-based filtering
    if (role === 'client') {
      reportsQuery = reportsQuery.where(eq(reports.clientId, userId));
    } else if (role === 'officer') {
      // Officer sees assigned reports
      reportsQuery = reportsQuery.where(eq(reports.assignedOfficerId, userId));
    }
    // Admin sees all reports
    
    const cloudReports = await reportsQuery;
    return { source: 'cloud', data: cloudReports };
  })
  
  // Create report in cloud
  .post('/reports', 
    { 
      body: t.Object({
        title: t.String(),
        description: t.String(),
        priority: t.Optional(t.Union([t.Literal('low'), t.Literal('medium'), t.Literal('high')]))
      })
    },
    async ({ cloudUser, body }) => {
      if (cloudUser.role !== 'client') {
        throw new Error('Only clients can create reports');
      }
      
      const [newReport] = await cloudDb
        .insert(reports)
        .values({
          ...body,
          clientId: cloudUser.userId,
          status: 'pending'
        })
        .returning();
      
      return { message: 'Report created in cloud', report: newReport };
    }
  );