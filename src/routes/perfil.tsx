import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/store/auth";
import { doramas, getEpisode } from "@/data/doramas";
import { Crown, Mail, Calendar, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Perfil · DoramaMoz" }] }),
  component: PerfilPage,
});

function PerfilPage() {
  const user = useAuth((s) => s.user);
  const progress = useAuth((s) => s.progress);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate({ to: "/auth" });
  }, [user, navigate]);

  if (!user) return null;

  const continuar = Object.entries(progress)
    .filter(([, s]) => s > 5)
    .map(([epId]) => getEpisode(epId))
    .filter((x): x is NonNullable<ReturnType<typeof getEpisode>> => !!x)
    .slice(0, 6);

  const isPagante = user.status_pagamento === "pagante";

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface-elevated via-surface to-surface p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-5">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent font-display text-3xl font-bold text-primary-foreground shadow-glow">
            {user.nome.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl font-bold">{user.nome}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" />{user.email}</span>
              {user.data_pagamento && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  desde {new Date(user.data_pagamento).toLocaleDateString("pt-PT")}
                </span>
              )}
            </div>
          </div>
          <div
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
              isPagante
                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-glow"
                : "border border-border bg-surface text-muted-foreground"
            }`}
          >
            <Crown className="h-4 w-4" />
            {isPagante ? "Acesso vitalício" : "Não pagante"}
          </div>
        </div>

        {!isPagante && (
          <Link
            to="/pagamento"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            Desbloquear tudo por 60 MT
          </Link>
        )}

        {user.role === "admin" && (
          <Link
            to="/admin"
            className="ml-3 mt-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold"
          >
            <ShieldCheck className="h-4 w-4" /> Painel admin
          </Link>
        )}
      </div>

      {continuar.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold">Continuar a assistir</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {continuar.map(({ dorama, episode }) => (
              <Link
                key={episode.id}
                to="/assistir/$episodeId"
                params={{ episodeId: episode.id }}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition hover:border-primary/40"
              >
                <img src={dorama.capa} alt="" loading="lazy" className="h-16 w-12 rounded-lg object-cover" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{dorama.titulo}</div>
                  <div className="text-xs text-muted-foreground">EP {episode.ordem} · {episode.titulo}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold">Recomendados para si</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {doramas.slice(0, 4).map((d) => (
            <Link
              key={d.id}
              to="/dorama/$slug"
              params={{ slug: d.slug }}
              className="group overflow-hidden rounded-xl bg-surface"
            >
              <img
                src={d.capa}
                alt=""
                loading="lazy"
                className="aspect-[2/3] w-full object-cover transition group-hover:scale-105"
              />
              <div className="p-2 text-sm font-semibold">{d.titulo}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
