import { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY!;

export const getMe = async (req: Request, res: Response) => {
  const user = req.supabaseUser;
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ user });
};

export const updateMe = async (req: Request, res: Response) => {
  const user = req.supabaseUser;
  if (!user) return res.status(404).json({ error: 'User not found' });

  try {
    const uid = user.id;
    const body = req.body || {};

    // Build a payload to update user metadata. We avoid changing sensitive fields like email here.
    const newMeta = { ...(user.user_metadata || {}) };
    if (typeof body.name === 'string') newMeta.name = body.name;
    if (typeof body.full_name === 'string') newMeta.full_name = body.full_name;
    if (typeof body.language === 'string') newMeta.language = body.language;

    const payload: any = { user_metadata: newMeta };

    const resp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${uid}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${SUPABASE_KEY}`,
        apikey: SUPABASE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ error: 'Failed to update user', detail: text });
    }

    const data: any = await resp.json();
    return res.json({ user: data.user || data });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update user', detail: String(err) });
  }
};
