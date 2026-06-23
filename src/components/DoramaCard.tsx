import { Link } from "@tanstack/react-router";
import type { Dorama } from "@/data/doramas";
import { Play, Star } from "lucide-react";

export function DoramaCard({ dorama }: { dorama: Dorama }) {
  return (
    <Link
      to="/dorama/$slug"
      params={{ slug: dorama.slug }}
      className="group relative block w-44 shrink-0 overflow-hidden rounded-xl bg-surface shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-glow sm:w-52 md:w-56"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={dorama.capa}
          alt={`Capa de ${dorama.titulo}`}
          loading="lazy"
          width={768}
          height={1152}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-90" />
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 text-[10px] font-semibold backdrop-blur">
          <Star className="h-3 w-3 fill-primary text-primary" />
          {dorama.rating.toFixed(1)}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="text-[10px] uppercase tracking-wider text-primary">{dorama.categoria}</div>
          <h3 className="mt-1 line-clamp-2 font-display text-base font-semibold leading-tight">
            {dorama.titulo}
          </h3>
          <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{dorama.descricao}</p>
        </div>
        <div className="absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/90 text-primary-foreground shadow-glow">
            <Play className="h-5 w-5 fill-current" />
          </div>
        </div>
      </div>
    </Link>
  );
}
