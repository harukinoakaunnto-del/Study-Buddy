import { createClient } from '@supabase/supabase-js';

// Cloudflareの環境変数を直接、あるいはViteの変数から確実に取得する
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || (globalThis as any).process?.env?.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || (globalThis as any).process?.env?.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Environment variables are missing!', { url: !!supabaseUrl, key: !!supabaseAnonKey });
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
