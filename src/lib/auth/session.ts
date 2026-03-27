import { supabase } from "@/lib/db/supabase";

export type AuthSession = {
  userId: string;
  email: string;
  role: "user" | "partner" | "admin";
};

export async function getSession(): Promise<AuthSession | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  return {
    userId: session.user.id,
    email: session.user.email ?? "",
    role: (session.user.user_metadata?.role as AuthSession["role"]) ?? "user",
  };
}

export async function requireSession(): Promise<AuthSession> {
  const session = await getSession();
  if (!session) throw new Error("Kimlik doğrulama gereklidir");
  return session;
}

export async function requireAdminSession(): Promise<AuthSession> {
  const session = await requireSession();
  if (session.role !== "admin") throw new Error("Yönetici yetkisi gereklidir");
  return session;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
