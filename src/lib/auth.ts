/*
 * Acesso da equipe na versão SEM nuvem.
 * A conta é fixa (demonstração) e a sessão fica no navegador — o suficiente
 * para a equipe demonstrar o fluxo de moderação. Quando a ferramenta completa
 * (com servidor) estiver ativa, este módulo é trocado pela autenticação real.
 */

const AUTH_KEY = "nascfz-team-session";
const AUTH_EVENT = "nascfz-auth-change";

export const TEAM_CREDENTIALS = {
  email: "equipe@nascfz.org.br",
  password: "ilhadeus2026",
};

const DEMO_ADMIN_ID = "demo-admin";

function readSession(): { id: string; email: string } | null {
  try {
    return localStorage.getItem(AUTH_KEY) === "1"
      ? { id: DEMO_ADMIN_ID, email: TEAM_CREDENTIALS.email }
      : null;
  } catch {
    return null;
  }
}

function notify() {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function subscribeAuth(cb: (userId: string | null) => void): () => void {
  cb(readSession()?.id ?? null);
  const handler = () => cb(readSession()?.id ?? null);
  window.addEventListener(AUTH_EVENT, handler);
  return () => window.removeEventListener(AUTH_EVENT, handler);
}

export async function getSessionUser(): Promise<{
  id: string | null;
  email: string | null;
}> {
  const session = readSession();
  return { id: session?.id ?? null, email: session?.email ?? null };
}

export async function isAdminUser(userId: string): Promise<boolean> {
  return userId === DEMO_ADMIN_ID;
}

export async function signIn(
  email: string,
  password: string,
): Promise<{ error?: string }> {
  const ok =
    email.trim().toLowerCase() === TEAM_CREDENTIALS.email &&
    password === TEAM_CREDENTIALS.password;
  if (!ok) return { error: "E-mail ou senha incorretos." };
  try {
    localStorage.setItem(AUTH_KEY, "1");
  } catch {
    // ignora
  }
  notify();
  return {};
}

export async function signOut(): Promise<void> {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch {
    // ignora
  }
  notify();
}

export async function registerModerator(): Promise<{
  ok: boolean;
  error?: string;
}> {
  return {
    ok: false,
    error:
      "O cadastro de moderadores com código de convite depende da ferramenta completa (com servidor). Nesta versão, entre com a conta da equipe.",
  };
}
