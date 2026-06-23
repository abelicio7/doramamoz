import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/store/auth";
import { Crown, LogOut, Search, User as UserIcon } from "lucide-react";

export function Header() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="font-display text-2xl font-bold tracking-tight">
            Dorama<span className="text-primary">Moz</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link to="/" className="transition hover:text-foreground" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground" }}>
            Início
          </Link>
          <Link to="/" hash="populares" className="transition hover:text-foreground">
            Populares
          </Link>
          <Link to="/" hash="novos" className="transition hover:text-foreground">
            Novos
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-surface hover:text-foreground"
            aria-label="Pesquisar"
          >
            <Search className="h-4 w-4" />
          </button>

          {user?.status_pagamento !== "pagante" && (
            <Link
              to="/pagamento"
              className="hidden rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow transition hover:opacity-90 sm:inline-flex"
            >
              Desbloquear 60 MT
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/perfil"
                className="flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-sm transition hover:bg-surface-elevated"
              >
                <div className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-[10px] font-bold text-primary-foreground">
                  {user.nome.charAt(0).toUpperCase()}
                </div>
                <span className="hidden max-w-24 truncate sm:inline">{user.nome}</span>
                {user.status_pagamento === "pagante" && (
                  <Crown className="hidden h-3.5 w-3.5 text-primary sm:inline" />
                )}
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate({ to: "/" });
                }}
                className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-surface hover:text-foreground"
                aria-label="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-sm font-medium transition hover:bg-surface-elevated"
            >
              <UserIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Entrar</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
