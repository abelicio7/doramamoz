import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { HeroBanner } from "@/components/HeroBanner";
import { DoramaCarousel } from "@/components/DoramaCarousel";
import { doramasQuery } from "@/data/doramas";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(doramasQuery),
  head: () => ({
    meta: [
      { title: "DoramaMoz · Doramas moçambicanos por 60 MT" },
      {
        name: "description",
        content:
          "Assista aos melhores doramas moçambicanos. Pagamento único de 60 MT para acesso vitalício a todo o catálogo.",
      },
      { property: "og:title", content: "DoramaMoz · Doramas moçambicanos" },
      {
        property: "og:description",
        content: "Acesso vitalício a todos os doramas moçambicanos por apenas 60 MT.",
      },
    ],
  }),
  errorComponent: () => (
    <div className="p-12 text-center text-muted-foreground">Erro ao carregar o catálogo.</div>
  ),
  component: Home,
});

function Home() {
  const { data: doramas } = useSuspenseQuery(doramasQuery);
  const destaques = doramas.filter((d) => d.destaque);
  const populares = [...doramas].sort((a, b) => b.rating - a.rating);
  const novos = [...doramas].sort((a, b) => b.ano - a.ano);
  const featured = destaques[0] ?? doramas[0];

  if (!featured) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Catálogo em breve</h1>
        <p className="mt-3 text-muted-foreground">
          Ainda não há doramas publicados. Volte mais tarde.
        </p>
      </div>
    );
  }

  return (
    <>
      <HeroBanner dorama={featured} />
      {destaques.length > 0 && (
        <DoramaCarousel id="destaques" titulo="Em destaque" doramas={destaques} />
      )}
      <DoramaCarousel id="populares" titulo="Os mais populares" doramas={populares} />
      <DoramaCarousel id="novos" titulo="Novos lançamentos" doramas={novos} />
      <DoramaCarousel
        titulo="Romance"
        doramas={doramas.filter((d) => d.categoria.toLowerCase().includes("romance"))}
      />
    </>
  );
}
