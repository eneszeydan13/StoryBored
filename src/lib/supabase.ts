import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aloutiobzcfimhflqnbk.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_pub_anon_fallback';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
