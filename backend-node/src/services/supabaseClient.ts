import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
// Prefer service role key on the server for privileged operations (storage, RLS management)
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_KEY/SUPABASE_SERVICE_ROLE_KEY in environment');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false
  },
  realtime: {
    transport: ws as any
  }
});

export const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'uploads';
