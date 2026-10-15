import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Droplets, Menu, ShieldCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Início" },
  { to: "/denuncias", label: "Denúncias" },
  { to: "/voluntariado", label: "Voluntariado" },
  { to: "/noticias", label: "Notícias e dados" },
];

const COLUNAS = [
  {
    titulo: "Navegue",
    links: [
      { to: "/", label: "Início" },
      { to: "/denuncias", label: "Denúncias e alertas" },
      { to: "/voluntariado", label: "Voluntariado" },
      { to: "/noticias", label: "Notícias e galeria" },
    ],
  },
  {
    titulo: "Participe",
    links: [
      { to: "/denuncias?aba=registrar", label: "Fazer uma denúncia" },
      { to: "/denuncias?aba=alertas", label: "Enviar um alerta" },
      { to: "/noticias?aba=galeria", label: "Enviar uma foto" },
      { to: "/voluntariado", label: "Propor um mutirão" },
    ],
  },
  {
    titulo: "Território",
    links: [
      { to: "/mapa", label: "Mapa em tela cheia" },
      { to: "/denuncias?aba=alertas", label: "Alertas ativos" },
      { to: "/impacto", label: "Impacto e relatórios" },
    ],
  },
];

export function PublicLayout() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="group flex min-w-0 items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-lagoon to-leaf text-white shadow-sm transition-transform group-hover:scale-105">
              <Droplets className="h-5 w-5" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-[17px] font-semibold tracking-tight text-primary">
                Da Nascente à Foz
              </span>
              <span className="mt-1 hidden text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:block">
                fiscalização ambiental comunitária
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-ocean-soft text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-primary",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="leaf" className="hidden md:inline-flex">
              <Link to="/denuncias?aba=registrar">Denunciar</Link>
            </Button>
            <button
              type="button"
              aria-label="Abrir menu"
              onClick={() => setOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-full text-primary transition hover:bg-secondary lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-border/60 bg-background lg:hidden">
            <nav className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "rounded-xl px-3 py-2.5 text-sm font-medium",
                      isActive
                        ? "bg-ocean-soft text-primary"
                        : "text-foreground/70 hover:bg-secondary",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <Button asChild variant="leaf" className="mt-2">
                <Link to="/denuncias?aba=registrar">Fazer uma denúncia</Link>
              </Button>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border/70 bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-lagoon to-leaf text-white">
                  <Droplets className="h-5 w-5" />
                </span>
                <span className="font-display text-lg font-bold tracking-tight text-primary">
                  {SITE.name}
                </span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Um projeto de extensão que nasce pequeno — numa comunidade numa
                ilha de mangue — e aponta para uma mudança maior: a preservação
                dos sistemas costeiros do Recife.
              </p>
              <p className="mt-4 text-xs font-medium text-muted-foreground">
                {SITE.pilot}
              </p>
            </div>

            {COLUNAS.map((coluna) => (
              <div key={coluna.titulo}>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {coluna.titulo}
                </p>
                <ul className="mt-4 space-y-2.5 text-sm text-foreground/75">
                  {coluna.links.map((l) => (
                    <li key={`${coluna.titulo}-${l.label}`}>
                      <Link className="transition hover:text-primary" to={l.to}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:flex-row">
            <p>
              © {new Date().getFullYear()} {SITE.name} — feito pela comunidade
              e para a comunidade.
            </p>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 rounded-full border border-input bg-card px-3.5 py-1.5 font-semibold text-primary transition hover:bg-ocean-soft"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Área da equipe
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
