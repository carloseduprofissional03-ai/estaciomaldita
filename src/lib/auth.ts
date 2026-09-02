import { DEMO_CREDENTIALS } from "./site";

const KEY = "nascfz-admin";

// Autenticação de DEMONSTRAÇÃO: nesta versão sem backend, o acesso da equipe
// é validado localmente. Na versão com Enter Cloud, este módulo é substituído
// pela autenticação real (e-mail/senha + código de convite).

export function getAdminSession(): boolean {
  return localStorage.getItem(KEY) === "1";
}

export function loginAdmin(email: string, password: string): boolean {
  const ok =
    email.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
    password === DEMO_CREDENTIALS.password;
  if (ok) localStorage.setItem(KEY, "1");
  return ok;
}

export function logoutAdmin(): void {
  localStorage.removeItem(KEY);
}
