import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { getEpisode } from "@/data/doramas";
import { useAuth } from "@/store/auth";
import { ChevronLeft, Lock } from "lucide-react";

export const Route = createFileRoute("/assistir/$episodeId")({
  loader: ({ params }): NonNullable<ReturnType<typeof getEpisode>> => {
    const found = getEpisode(params.episodeId);
    if (!found) throw notFound();
    return found;
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.dorama.titulo} · ${loaderData.episode.titulo}` : "Assistir";
    return { meta: [{ title: `${t} · DoramaMoz` }] };
  },
  errorComponent: () => <div className="p-12 text-center">Erro</div>,
  notFoundComponent: () => <div className="p-12 text-center">Episódio não encontrado</div>,
  component: WatchPage,
});

function WatchPage() {
  const { dorama, episode } = Route.useLoaderData();
  const user = useAuth((s) => s.user);
  const progress = useAuth((s) => s.progress);
  const setProgress = useAuth((s) => s.setProgress);
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const isPagante = user?.status_pagamento === "pagante";

  useEffect(() => {
    if (!isPagante) return;
    const v = videoRef.current;
    if (!v) return;
    const saved = progress[episode.id] ?? 0;
    if (saved > 0) v.currentTime = saved;
    const onTime = () => setProgress(episode.id, v.currentTime);
    v.addEventListener("timeupdate", onTime);
    return () => v.removeEventListener("timeupdate", onTime);
  }, [episode.id, isPagante, progress, setProgress]);

  if (!isPagante) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-glow">
          <Lock className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-bold">Conteúdo bloqueado</h1>
        <p className="mt-3 text-muted-foreground">
          Faça o pagamento único de 60 MT para desbloquear este e todos os outros episódios.
        </p>
        <Link
          to="/pagamento"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
        >
          Desbloquear Agora · 60 MT
        </Link>
      </div>
    );
  }

  const idx = dorama.episodios.findIndex((e) => e.id === episode.id);
  const next = dorama.episodios[idx + 1];

  return (
    <div>
      <div className="bg-black">
        <div className="mx-auto max-w-6xl">
          <video
            ref={videoRef}
            src={episode.video_url}
            controls
            autoPlay
            className="aspect-video w-full bg-black"
          />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <button
          type="button"
          onClick={() => navigate({ to: "/dorama/$slug", params: { slug: dorama.slug } })}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Voltar a {dorama.titulo}
        </button>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-primary">{dorama.titulo}</div>
            <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
              EP {String(episode.ordem).padStart(2, "0")} · {episode.titulo}
            </h1>
          </div>
          {next && (
            <Link
              to="/assistir/$episodeId"
              params={{ episodeId: next.id }}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Próximo episódio →
            </Link>
          )}
        </div>

        <h2 className="mt-10 font-display text-xl font-bold">Lista de episódios</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {dorama.episodios.map((ep) => (
            <Link
              key={ep.id}
              to="/assistir/$episodeId"
              params={{ episodeId: ep.id }}
              className={`rounded-xl border p-3 transition ${
                ep.id === episode.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-surface hover:border-primary/40"
              }`}
            >
              <div className="text-xs text-muted-foreground">EP {String(ep.ordem).padStart(2, "0")} · {ep.duracao}</div>
              <div className="mt-0.5 font-semibold">{ep.titulo}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
