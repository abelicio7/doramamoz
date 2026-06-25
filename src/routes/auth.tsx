import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/store/auth";
import { z } from "zod";

type Search = { redirect?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Entrar · DoramaMoz" },
      { name: "description", content: "Entre ou crie conta para assistir a doramas moçambicanos." },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "register" | "forgot";

function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useAuth((s) => s.login);
  const register = useAuth((s) => s.register);
  const loginWithGoogle = useAuth((s) => s.loginWithGoogle);
  const resetPassword = useAuth((s) => s.resetPassword);
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const emailSchema = z.string().trim().email("Email inválido").max(255);
    const passSchema = z.string().min(6, "Mínimo 6 caracteres").max(72);

    if (mode === "forgot") {
      const r = emailSchema.safeParse(email);
      if (!r.success) return setError(r.error.errors[0].message);
      setLoading(true);
      const { error: err } = await resetPassword(r.data);
      setLoading(false);
      if (err) return setError(err);
      setInfo("Se a conta existir, enviámos instruções para o seu email.");
      return;
    }

    const er = emailSchema.safeParse(email);
    if (!er.success) return setError(er.error.errors[0].message);
    const pr = passSchema.safeParse(password);
    if (!pr.success) return setError(pr.error.errors[0].message);

    setLoading(true);
    if (mode === "register") {
      const nr = z.string().trim().min(2, "Nome muito curto").max(80).safeParse(nome);
      if (!nr.success) {
        setLoading(false);
        return setError(nr.error.errors[0].message);
      }
      const { error: err } = await register(nr.data, er.data, pr.data);
      setLoading(false);
      if (err) return setError(err);
      setInfo("Conta criada! Verifique o seu email para confirmar (se necessário) e entre.");
      setMode("login");
      return;
    }
    const { error: err } = await login(er.data, pr.data);
    setLoading(false);
    if (err) return setError(err);
    navigate({ to: (redirect as "/pagamento") || "/" });
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    const { error: err } = await loginWithGoogle();
    setLoading(false);
    if (err) setError(err);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6 sm:py-16">
      <div className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-card sm:p-8">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold">
            {mode === "login" && "Entrar"}
            {mode === "register" && "Criar conta"}
            {mode === "forgot" && "Recuperar senha"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login" && "Acesso à sua conta DoramaMoz"}
            {mode === "register" && "Junte-se à comunidade DoramaMoz"}
            {mode === "forgot" && "Vamos enviar-lhe um link para repor a senha"}
          </p>
        </div>

        {mode !== "forgot" && (
          <>
            <div className="mt-6 grid grid-cols-2 gap-1 rounded-full bg-surface p-1 text-sm">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`rounded-full px-3 py-2 font-semibold transition ${
                  mode === "login" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`rounded-full px-3 py-2 font-semibold transition ${
                  mode === "register" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                Criar conta
              </button>
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-semibold transition hover:bg-surface-elevated disabled:opacity-60"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path fill="#EA4335" d="M12 10.2v3.84h5.32c-.23 1.4-1.66 4.1-5.32 4.1-3.2 0-5.82-2.65-5.82-5.92S8.8 6.3 12 6.3c1.83 0 3.05.78 3.75 1.45l2.55-2.47C16.7 3.78 14.55 2.8 12 2.8 6.95 2.8 2.85 6.9 2.85 12s4.1 9.2 9.15 9.2c5.28 0 8.78-3.7 8.78-8.92 0-.6-.06-1.05-.15-1.5H12z"/>
              </svg>
              Continuar com Google
            </button>

            <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" /> ou <div className="h-px flex-1 bg-border" />
            </div>
          </>
        )}

        <form onSubmit={submit} className="space-y-4">
          {mode === "register" && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Nome</span>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </label>
          )}
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </label>
          {mode !== "forgot" && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Senha</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </label>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          {info && (
            <div className="rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "A processar..." : (
              <>
                {mode === "login" && "Entrar"}
                {mode === "register" && "Criar conta"}
                {mode === "forgot" && "Enviar link"}
              </>
            )}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          {mode === "login" ? (
            <button type="button" onClick={() => setMode("forgot")} className="hover:text-foreground">
              Esqueceu a senha?
            </button>
          ) : (
            <button type="button" onClick={() => setMode("login")} className="hover:text-foreground">
              ← Voltar a entrar
            </button>
          )}
          <Link to="/" className="hover:text-foreground">Voltar ao início</Link>
        </div>
      </div>
    </div>
  );
}
