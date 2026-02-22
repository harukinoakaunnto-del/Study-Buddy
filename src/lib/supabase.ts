import { createClient } from '@supabase/supabase-js';

// .envファイルから設定を読み込む
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabaseと通信するためのクライアントを作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey);