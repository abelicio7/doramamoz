import { Link, useNavigate } from "@tanstack/react-router";
import type { Dorama } from "@/data/doramas";
import { useAuth } from "@/store/auth";
import { useUnlock } from "@/store/unlock";
import { Lock, Play, Check } from "lucide-react";

export function EpisodeList({ dorama }: { dorama: Dorama }) {
  const user = useAuth((s) => s.user);
  const progress = useAuth((s) => s.progress);
  const showUnlock = useUnlock((s) => s.show);
  const navigate = useNavigate();
  const isPagante = user?.status_pagamento === "pagante";

  const handleClick = (episodeId: string) => {
    if (!isPagante) {
      showUnlock();
      return;
    }
    navigate({ to: "/assistir/$episodeId", params: { episodeId } });
  };

  return (
    <div className="space-y-2">
      {dorama.episodios.map((ep) => {
        const watched = (progress[ep.id] ?? 0) > 0;
        return (
          <button
            key={ep.id}
            type="button"
            onClick={() => handleClick(ep.id)}
            className="group flex w-full items-center gap-4 rounded-xl border border-border bg-surface p-3 text-left transition hover:border-primary/50 hover:bg-surface-elevated"
          >
            <div className="relative grid h-14 w-24 shrink-0 place-items-center overflow-hidden rounded-lg bg-background sm:h-16 sm:w-28">
              <img
                src={dorama.capa}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-50 transition group-hover:opacity-70"
              />
              <div className="relative grid h-10 w-10 place-items-center rounded-full bg-background/80 backdrop-blur">
                {isPagante ? (
                  <Play className="h-4 w-4 fill-primary text-primary" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>EP {String(ep.ordem).padStart(2, "0")}</span>
                <span>·</span>
                <span>{ep.duracao}</span>
                {watched && isPagante && (
                  <span className="ml-1 inline-flex items-center gap-1 text-success">
                    <Check className="h-3 w-3" /> visto
                  </span>
                )}
              </div>
              <div className="mt-0.5 truncate font-semibold">{ep.titulo}</div>
            </div>
          </button>
        );
      })}

      {!isPagante && (
        <Link
          to="/pagamento"
          className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 p-4 text-sm font-semibold text-primary transition hover:bg-primary/15"
        >
          <Lock className="h-4 w-4" />
          Desbloquear todos os {dorama.episodios.length} episódios por 60 MT
        </Link>
      )}
    </div>
  );
}
