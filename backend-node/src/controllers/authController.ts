import { Request, Response } from 'express';
import { supabase } from '../services/supabaseClient';
import logger from '../logger';
import { registerSchema, loginSchema, forgotSchema } from '../validators/authValidator';

export const register = async (req: Request, res: Response) => {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.errors });

    const { email, password } = result.data;

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      logger.error('Supabase signUp error', { error });
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({ user: data.user, message: 'Confirmation email sent if needed.' });
  } catch (err) {
    logger.error('Register error', { err });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.errors });

    const { email, password } = result.data;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      logger.warn('Supabase signIn error', { error });
      return res.status(401).json({ error: error.message });
    }

    return res.json({ session: data.session, user: data.user });
  } catch (err) {
    logger.error('Login error', { err });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const result = forgotSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.errors });

    const { email } = result.data;

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: process.env.SITE_URL });
    if (error) {
      logger.error('Supabase resetPassword error', { error });
      return res.status(400).json({ error: error.message });
    }

    return res.json({ message: 'Password reset email sent if account exists.' });
  } catch (err) {
    logger.error('Forgot password error', { err });
    return res.status(500).json({ error: 'Internal server error' });
  }
};
