import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tvafpxwsocvnsptpbdhu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2YWZweHdzb2N2bnNwdHBiZGh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxOTc1NTcsImV4cCI6MjEwNDc3MzU1N30.F638Dcu4SHUwn_psirpZUWl6PWrIXnB1c3iUWZQnACQ';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
