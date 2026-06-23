import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/store/auth";
import { Check, Crown, Smartphone } from "lucide-react";

export const Route = createFileRoute("/pagamento")({
  head: () => ({
    meta: [
      { title: "Pagamento · DoramaMoz" },
      { name: "description", content: "Desbloqueie acesso vitalício a todos os doramas por apenas 60 MT." },
    ],
  }),
  component: PagamentoPage,
});

function PagamentoPage() {
  const user = useAuth((s) => s.user);
  const confirmPayment = useAuth((s) => s.confirmPayment);
  const navigate = useNavigate();
  const [metodo, setMetodo] = useState<"mpesa" | "emola">("mpesa");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-3xl font-bold">Entre para continuar</h1>
        <p className="mt-3 text-muted-foreground">
          Precisa de uma conta para concluir o pagamento.
        </p>
        <Link
          to="/auth"
          search={{ redirect: "/pagamento" }}
          className="mt-6 inline-flex rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
        >
          Entrar / Criar conta
        </Link>
      </div>
    );
  }

  if (user.status_pagamento === "pagante" && !success) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
        <Crown className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 font-display text-3xl font-bold">Já tem acesso vitalício</h1>
        <p className="mt-3 text-muted-foreground">
          Pode assistir a todos os doramas sem limites.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
        >
          Explorar catálogo
        </Link>
      </div>
    );
  }

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      confirmPayment(metodo);
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate({ to: "/" }), 1800);
    }, 1500);
  };

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/20">
          <Check className="h-8 w-8 text-success" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-bold">Pagamento confirmado!</h1>
        <p className="mt-3 text-muted-foreground">
          Acesso desbloqueado. A redirecionar para o catálogo…
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.1fr_1fr]">
      {/* Benefícios */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
          Pagamento único · 60 MT
        </div>
        <h1 className="mt-4 font-display text-4xl font-bold text-balance sm:text-5xl">
          Acesso vitalício a todos os doramas
        </h1>
        <p className="mt-4 text-muted-foreground">
          Um único pagamento. Sem mensalidades, sem renovações. Veja sempre que quiser, em qualquer
          dispositivo.
        </p>

        <ul className="mt-6 space-y-3 text-sm">
          {[
            "Catálogo completo de doramas moçambicanos",
            "Todos os novos lançamentos incluídos para sempre",
            "Assista no telemóvel, tablet ou computador",
            "Continue de onde parou em qualquer dispositivo",
            "Sem anúncios",
          ].map((b) => (
            <li key={b} className="flex items-start gap-3">
              <div className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success/20">
                <Check className="h-3 w-3 text-success" />
              </div>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Checkout */}
      <form
        onSubmit={handlePay}
        className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-card"
      >
        <div className="flex items-baseline justify-between">
          <div className="text-sm text-muted-foreground">Total a pagar</div>
          <div className="font-display text-4xl font-bold">
            60 <span className="text-base text-muted-foreground">MT</span>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 text-sm font-semibold">Método de pagamento</div>
          <div className="grid grid-cols-2 gap-2">
            {([
              { v: "mpesa", label: "M-Pesa" },
              { v: "emola", label: "E-Mola" },
            ] as const).map((m) => (
              <button
                key={m.v}
                type="button"
                onClick={() => setMetodo(m.v)}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition ${
                  metodo === m.v
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-surface text-muted-foreground hover:text-foreground"
                }`}
              >
                <Smartphone className="h-4 w-4" />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-sm font-semibold">Número de telemóvel</span>
          <input
            type="tel"
            required
            placeholder="84 123 4567"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "A processar..." : `Pagar 60 MT com ${metodo === "mpesa" ? "M-Pesa" : "E-Mola"}`}
        </button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Vai receber uma confirmação no seu telemóvel. Pagamento processado em segurança.
        </p>
      </form>
    </div>
  );
}
