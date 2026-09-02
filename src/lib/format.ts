const shortDate = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const fullDate = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const longDate = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export function fmtShort(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : shortDate.format(d);
}

export function fmtFull(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : fullDate.format(d);
}

export function fmtLong(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : longDate.format(d);
}

export function fmtEventDate(date: string): string {
  return fmtLong(`${date}T12:00:00`);
}

export function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, (m ?? 1) - 1, 1);
  return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" })
    .format(d)
    .replace(".", "");
}

export function isUpcoming(date: string): boolean {
  const day = new Date(`${date}T23:59:59`);
  return day.getTime() >= Date.now();
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** ISO com +1 hora para evitar o fuso do próprio navegador */
export function isoNow(): string {
  return new Date(Date.now() + 60 * 60 * 1000).toISOString();
}
