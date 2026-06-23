import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getDoramaBySlug } from "@/data/doramas";
import { EpisodeList } from "@/components/EpisodeList";
import { useAuth } from "@/store/auth";
import { useUnlock } from "@/store/unlock";
import { Play, Star, Calendar, Film, Lock } from "lucide-react";

export const Route = createFileRoute("/dorama/$slug")({
  loader: ({ params }) => {
    const dorama = getDoramaBySlug(params.slug);
    if (!dorama) throw notFound();
    return { dorama };
  },
  head: ({ loaderData }) => {
    const d = loaderData?.dorama;
    if (!d) return { meta: [{ title: "Dorama não encontrado · DoramaMoz" }] };
    return {
      meta: [
        { title: `${d.titulo} · DoramaMoz` },
        { name: "description", content: d.descricao },
        { property: "og:title", content: `${d.titulo} · DoramaMoz` },
        { property: "og:description", content: d.descricao },
        { property: "og:image", content: d.capa },
        { name: "twitter:image", content: d.capa },
      ],
    };
  },
  errorComponent: () => <div className="p-12 text-center">Erro ao carregar</div>,
  notFoundComponent: () => (
    <div className="p-12 text-center">
      <h1 className="font-display text-3xl">Dorama não encontrado</h1>
      <Link to="/" className="mt-4 inline-block text-primary underline">Voltar ao catálogo</Link>
    </div>
  ),
  component: DoramaPage,
});

function DoramaPage() {
  const { dorama } = Route.useLoaderData();
  const user = useAuth((s) => s.user);
  const showUnlock = useUnlock((s) => s.show);
  const isPagante = user?.status_pagamento === "pagante";
  const firstEp = dorama.episodios[0];

  const handleWatch = () => {
    if (!isPagante) showUnlock();
  };

  return (
    <article>
      {/* Hero cover */}
      <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
        <img
          src={dorama.hero ?? dorama.capa}
          alt=""
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-gradient-fade" />

        <div className="relative mx-auto grid h-full max-w-7xl items-end gap-6 px-4 pb-10 sm:grid-cols-[200px_1fr] sm:px-6 sm:pb-14 md:grid-cols-[240px_1fr] md:gap-8">
          <img
            src={dorama.capa}
            alt={`Capa de ${dorama.titulo}`}
            width={480}
            height={720}
            className="hidden aspect-[2/3] w-full max-w-[240px] rounded-2xl object-cover shadow-card sm:block"
          />
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              {dorama.categoria}
            </div>
            <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl md:text-6xl text-balance">
              {dorama.titulo}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-primary text-primary" />
                {dorama.rating.toFixed(1)}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> {dorama.ano}
              </span>
              <span className="flex items-center gap-1.5">
                <Film className="h-4 w-4" /> {dorama.episodios_count} episódios
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {isPagante && firstEp ? (
                <Link
                  to="/assistir/$episodeId"
                  params={{ episodeId: firstEp.id }}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
                >
                  <Play className="h-4 w-4 fill-current" /> Assistir Agora
                </Link>
              ) : (
                <>
                  <Link
                    to="/pagamento"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
                  >
                    Assistir Completo por Apenas 60 MT
                  </Link>
                  <button
                    type="button"
                    onClick={handleWatch}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-6 py-3 text-sm font-semibold backdrop-blur transition hover:bg-surface"
                  >
                    <Lock className="h-4 w-4" /> Ver trailer
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1fr_360px]">
        <div>
          <h2 className="font-display text-2xl font-bold">Sinopse</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">{dorama.sinopse}</p>

          <h2 className="mt-10 font-display text-2xl font-bold">Episódios</h2>
          <div className="mt-5">
            <EpisodeList dorama={dorama} />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Acesso</div>
            <div className="mt-1 font-display text-3xl font-bold">
              60 <span className="text-base text-muted-foreground">MT</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Pagamento único. Acesso vitalício a este e a todos os outros doramas da plataforma.
            </p>
            {!isPagante && (
              <Link
                to="/pagamento"
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
              >
                Desbloquear Agora
              </Link>
            )}
          </div>
        </aside>
      </div>
    </article>
  );
}
