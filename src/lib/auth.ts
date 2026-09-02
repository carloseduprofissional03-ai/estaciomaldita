import { supabase } from "@/integrations/supabase/client";

/*
 * Autenticação real (Enter Cloud) da Área da equipe.
 * O cadastro de moderadores exige o código de convite (validado na função
 * de backend register-admin) — não há cadastro público.
 */

export function subscribeAuth(cb: (userId: string | null) => void): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    cb(session?.user?.id ?? null);
  });
  return () => subscription.unsubscribe();
}

export async function getSessionUser(): Promise<{
  id: string | null;
  email: string | null;
}> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { id: user?.id ?? null, email: user?.email ?? null };
}

export async function isAdminUser(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  return data?.role === "admin";
}

export async function signIn(
  email: string,
  password: string,
): Promise<{ error?: string }> {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) {
    return { error: "E-mail ou senha incorretos." };
  }
  return {};
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function registerModerator(input: {
  full_name: string;
  email: string;
  password: string;
  invite_code: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.functions.invoke("register-admin", {
    body: input,
  });
  if (error) {
    return { ok: false, error: "Não foi possível contatar o servidor." };
  }
  const body = data as { ok?: boolean; error?: string };
  if (!body?.ok) {
    return { ok: false, error: body?.error ?? "Não foi possível registrar." };
  }
  return { ok: true };
}
