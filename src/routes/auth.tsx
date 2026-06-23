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

  const login = useAuth((s) => s.login);
  const register = useAuth((s) => s.register);
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const emailSchema = z.string().trim().email("Email inválido").max(255);
    const passSchema = z.string().min(6, "Mínimo 6 caracteres").max(72);

    if (mode === "forgot") {
      const r = emailSchema.safeParse(email);
      if (!r.success) return setError(r.error.errors[0].message);
      setInfo("Se a conta existir, enviámos instruções para o seu email.");
      return;
    }

    const er = emailSchema.safeParse(email);
    if (!er.success) return setError(er.error.errors[0].message);
    const pr = passSchema.safeParse(password);
    if (!pr.success) return setError(pr.error.errors[0].message);

    if (mode === "register") {
      const nr = z.string().trim().min(2, "Nome muito curto").max(80).safeParse(nome);
      if (!nr.success) return setError(nr.error.errors[0].message);
      register(nr.data, er.data, pr.data);
    } else {
      login(er.data, pr.data);
    }
    navigate({ to: (redirect as "/pagamento") || "/" });
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
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
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
            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
          >
            {mode === "login" && "Entrar"}
            {mode === "register" && "Criar conta"}
            {mode === "forgot" && "Enviar link"}
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

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Dica: para testar o painel admin, registe-se com email começado por <code className="rounded bg-surface px-1.5 py-0.5">admin@</code>
      </p>
    </div>
  );
}
