import type { Dorama } from "@/data/doramas";
import { DoramaCard } from "./DoramaCard";

export function DoramaCarousel({
  titulo,
  doramas,
  id,
}: {
  titulo: string;
  doramas: Dorama[];
  id?: string;
}) {
  return (
    <section id={id} className="mt-12 sm:mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">{titulo}</h2>
      </div>
      <div className="scrollbar-hide mt-5 flex gap-4 overflow-x-auto px-4 pb-4 sm:gap-5 sm:px-6 [&>*:last-child]:mr-4">
        <div className="mx-auto flex max-w-7xl gap-4 sm:gap-5">
          {doramas.map((d) => (
            <DoramaCard key={d.id} dorama={d} />
          ))}
        </div>
      </div>
    </section>
  );
}
