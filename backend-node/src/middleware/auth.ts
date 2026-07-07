import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY!;

declare global {
  namespace Express {
    interface Request {
      supabaseUser?: any;
    }
  }
}

export const supabaseAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing Authorization header' });
    const token = auth.split(' ')[1];

    const resp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_KEY
      }
    });

    if (!resp.ok) return res.status(401).json({ error: 'Invalid or expired token' });

    const data: any = await resp.json();
    req.supabaseUser = data.user || data;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Auth verification failed' });
  }
};
