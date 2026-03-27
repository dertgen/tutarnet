import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Tarayıcı tarafı — anonim (public) anahtar ile oluşturulur
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Sunucu tarafı — servis anahtarı ile tam yetkili erişim
export function createServerSupabaseClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
