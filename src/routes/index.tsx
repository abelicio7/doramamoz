import { createFileRoute } from "@tanstack/react-router";
import { HeroBanner } from "@/components/HeroBanner";
import { DoramaCarousel } from "@/components/DoramaCarousel";
import { destaques, populares, novos, doramas } from "@/data/doramas";

export const Route = createFileRoute("/")({
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
  component: Home,
});

function Home() {
  const featured = destaques[0] ?? doramas[0];
  return (
    <>
      <HeroBanner dorama={featured} />
      <DoramaCarousel id="destaques" titulo="Em destaque" doramas={destaques} />
      <DoramaCarousel id="populares" titulo="Os mais populares" doramas={populares} />
      <DoramaCarousel id="novos" titulo="Novos lançamentos" doramas={novos} />
      <DoramaCarousel titulo="Romance" doramas={doramas.filter((d) => d.categoria === "Romance")} />
    </>
  );
}
