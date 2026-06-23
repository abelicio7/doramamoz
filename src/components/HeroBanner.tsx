import { Link } from "@tanstack/react-router";
import type { Dorama } from "@/data/doramas";
import { Play, Info, Star } from "lucide-react";

export function HeroBanner({ dorama }: { dorama: Dorama }) {
  return (
    <section className="relative h-[80vh] min-h-[520px] w-full overflow-hidden">
      <img
        src={dorama.hero ?? dorama.capa}
        alt={`Cena de ${dorama.titulo}`}
        width={1920}
        height={1088}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-fade" />
      <div className="absolute inset-0 bg-gradient-hero" />

      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Em destaque · {dorama.categoria}
          </div>
          <h1 className="font-display text-4xl font-bold text-balance leading-[1.05] sm:text-6xl md:text-7xl">
            {dorama.titulo}
          </h1>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              {dorama.rating.toFixed(1)}
            </span>
            <span>{dorama.ano}</span>
            <span>{dorama.episodios_count} episódios</span>
          </div>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {dorama.descricao}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/dorama/$slug"
              params={{ slug: dorama.slug }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
            >
              <Play className="h-4 w-4 fill-current" />
              Assistir Agora
            </Link>
            <Link
              to="/dorama/$slug"
              params={{ slug: dorama.slug }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-6 py-3 text-sm font-semibold backdrop-blur transition hover:bg-surface"
            >
              <Info className="h-4 w-4" />
              Mais informações
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
