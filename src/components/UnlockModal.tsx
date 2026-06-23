import { Link } from "@tanstack/react-router";
import { useUnlock } from "@/store/unlock";
import { useAuth } from "@/store/auth";
import { Crown, X, Check } from "lucide-react";
import { useEffect } from "react";

export function UnlockModal() {
  const open = useUnlock((s) => s.open);
  const hide = useUnlock((s) => s.hide);
  const user = useAuth((s) => s.user);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && hide();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, hide]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4">
      <button
        type="button"
        onClick={hide}
        aria-label="Fechar"
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-glow animate-in fade-in zoom-in-95 duration-300">
        <button
          type="button"
          onClick={hide}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-surface hover:text-foreground"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="bg-gradient-to-br from-primary/20 via-accent/10 to-transparent p-6 pb-0">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-glow">
            <Crown className="h-7 w-7 text-primary-foreground" />
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 text-center">
          <h3 className="font-display text-2xl font-bold">Desbloqueie todo o conteúdo</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Faça um pagamento único de apenas{" "}
            <span className="font-semibold text-foreground">60 MT</span> e tenha acesso completo a todos
            os doramas disponíveis.
          </p>

          <ul className="mt-5 space-y-2 text-left text-sm">
            {[
              "Acesso vitalício a todos os doramas",
              "Novos lançamentos sem custos extra",
              "Assista em qualquer dispositivo",
            ].map((b) => (
              <li key={b} className="flex items-center gap-2 text-muted-foreground">
                <Check className="h-4 w-4 shrink-0 text-success" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <Link
            to={user ? "/pagamento" : "/auth"}
            search={user ? undefined : { redirect: "/pagamento" }}
            onClick={hide}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
          >
            Desbloquear Agora · 60 MT
          </Link>
          {!user && (
            <p className="mt-3 text-xs text-muted-foreground">
              É necessário ter conta para concluir o pagamento.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
