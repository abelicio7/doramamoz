import coverAmorMaputo from "@/assets/cover-amor-maputo.jpg";
import coverCoracaoBeira from "@/assets/cover-coracao-beira.jpg";
import coverUniversitarios from "@/assets/cover-universitarios.jpg";
import coverSegredosCapital from "@/assets/cover-segredos-capital.jpg";
import coverHerancas from "@/assets/cover-herancas.jpg";
import coverSaborAmor from "@/assets/cover-sabor-amor.jpg";
import coverOndasTofo from "@/assets/cover-ondas-tofo.jpg";
import heroAmorMaputo from "@/assets/hero-amor-maputo.jpg";

export type Episode = {
  id: string;
  ordem: number;
  titulo: string;
  duracao: string;
  video_url: string;
};

export type Dorama = {
  id: string;
  slug: string;
  titulo: string;
  descricao: string;
  sinopse: string;
  capa: string;
  hero?: string;
  categoria: string;
  ano: number;
  episodios_count: number;
  rating: number;
  destaque?: boolean;
  episodios: Episode[];
};

// Vídeo demo público (Big Buck Bunny) — placeholder até integração real
const DEMO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const mkEps = (prefix: string, n: number): Episode[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `${prefix}-ep${i + 1}`,
    ordem: i + 1,
    titulo: `Episódio ${i + 1}`,
    duracao: `${38 + ((i * 3) % 12)} min`,
    video_url: DEMO,
  }));

export const doramas: Dorama[] = [
  {
    id: "1",
    slug: "amor-em-maputo",
    titulo: "Amor em Maputo",
    descricao: "Uma história de amor proibido entre dois jovens de mundos opostos na capital moçambicana.",
    sinopse:
      "Lara, filha de um empresário poderoso de Maputo, apaixona-se por Mateus, um jovem músico vindo da Mafalala. Entre festas da elite, segredos de família e a música que os une, eles descobrem que o amor verdadeiro custa caro — e nem sempre o preço se paga em dinheiro.",
    capa: coverAmorMaputo,
    hero: heroAmorMaputo,
    categoria: "Romance",
    ano: 2025,
    episodios_count: 12,
    rating: 9.2,
    destaque: true,
    episodios: mkEps("amor-maputo", 12),
  },
  {
    id: "2",
    slug: "coracao-da-beira",
    titulo: "Coração da Beira",
    descricao: "Reencontro inesperado muda a vida de dois antigos amantes numa Beira tomada pela chuva.",
    sinopse:
      "Sete anos depois de uma separação dolorosa, Inês regressa à Beira para enterrar o pai. Lá reencontra Bento — o homem que prometeu nunca mais voltar a ver. Numa cidade castigada pelo ciclone, antigos sentimentos voltam à superfície.",
    capa: coverCoracaoBeira,
    categoria: "Romance",
    ano: 2024,
    episodios_count: 10,
    rating: 8.7,
    episodios: mkEps("coracao-beira", 10),
  },
  {
    id: "3",
    slug: "universitarios",
    titulo: "Universitários",
    descricao: "Quatro amigos enfrentam amores, ambições e segredos no último ano da universidade.",
    sinopse:
      "Na Universidade Eduardo Mondlane, quatro amigos inseparáveis vivem o último ano de curso. Entre paixões, traições, sonhos profissionais e a pressão das famílias, descobrem que crescer também é aprender a dizer adeus.",
    capa: coverUniversitarios,
    categoria: "Drama Jovem",
    ano: 2025,
    episodios_count: 16,
    rating: 9.0,
    destaque: true,
    episodios: mkEps("universitarios", 16),
  },
  {
    id: "4",
    slug: "segredos-da-capital",
    titulo: "Segredos da Capital",
    descricao: "Uma jornalista descobre uma trama de corrupção que ameaça a sua vida.",
    sinopse:
      "Quando Andrea, jornalista de investigação, recebe um envelope anónimo com documentos comprometedores, mergulha numa rede de corrupção que liga políticos, empresários e o crime organizado. Cada pista a aproxima da verdade — e do perigo.",
    capa: coverSegredosCapital,
    categoria: "Thriller",
    ano: 2024,
    episodios_count: 8,
    rating: 8.9,
    episodios: mkEps("segredos-capital", 8),
  },
  {
    id: "5",
    slug: "herancas",
    titulo: "Heranças",
    descricao: "Três gerações de uma família de Inhambane enfrentam o peso do passado.",
    sinopse:
      "A morte da matriarca obriga a família Macuácua a regressar à casa ancestral em Inhambane. Velhas mágoas, segredos guardados durante décadas e uma herança disputada põem à prova os laços que parecem inquebráveis.",
    capa: coverHerancas,
    categoria: "Drama Familiar",
    ano: 2023,
    episodios_count: 14,
    rating: 8.5,
    episodios: mkEps("herancas", 14),
  },
  {
    id: "6",
    slug: "sabor-de-amor",
    titulo: "Sabor de Amor",
    descricao: "Um chef tenta reconquistar a ex-noiva através da comida que partilhavam.",
    sinopse:
      "Daniel abre um restaurante em Maputo com um único objectivo: reconquistar Tânia, a mulher que perdeu por colocar a carreira em primeiro lugar. Cada prato no menu é uma memória — e cada serviço, uma segunda oportunidade.",
    capa: coverSaborAmor,
    categoria: "Romance",
    ano: 2025,
    episodios_count: 10,
    rating: 8.8,
    episodios: mkEps("sabor-amor", 10),
  },
  {
    id: "7",
    slug: "ondas-de-tofo",
    titulo: "Ondas de Tofo",
    descricao: "Duas melhores amigas passam um Verão em Tofo que muda tudo para sempre.",
    sinopse:
      "Joana e Mércia decidem passar o último Verão antes da vida adulta na praia de Tofo. O que começa como férias transforma-se numa viagem de auto-descoberta, primeiros amores e revelações que vão redefinir a amizade delas.",
    capa: coverOndasTofo,
    categoria: "Drama Jovem",
    ano: 2024,
    episodios_count: 8,
    rating: 8.6,
    episodios: mkEps("ondas-tofo", 8),
  },
];

export const getDoramaBySlug = (slug: string) => doramas.find((d) => d.slug === slug);
export const getDoramaById = (id: string) => doramas.find((d) => d.id === id);
export const getEpisode = (episodeId: string) => {
  for (const d of doramas) {
    const ep = d.episodios.find((e) => e.id === episodeId);
    if (ep) return { dorama: d, episode: ep };
  }
  return null;
};
export const destaques = doramas.filter((d) => d.destaque);
export const populares = [...doramas].sort((a, b) => b.rating - a.rating);
export const novos = [...doramas].sort((a, b) => b.ano - a.ano);
