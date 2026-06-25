import { supabase } from "@/integrations/supabase/client";
import { queryOptions } from "@tanstack/react-query";

export type Episode = {
  id: string;
  dorama_id: string;
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
  hero?: string | null;
  categoria: string;
  ano: number;
  episodios_count: number;
  rating: number;
  destaque: boolean;
  ordem: number;
  episodios: Episode[];
};

type DoramaRow = {
  id: string;
  slug: string;
  titulo: string;
  descricao: string;
  sinopse: string;
  capa: string;
  hero: string | null;
  categoria: string;
  ano: number;
  episodios_count: number;
  rating: number;
  destaque: boolean;
  ordem: number;
  episodes?: Episode[] | null;
};

function normalize(row: DoramaRow): Dorama {
  const eps = (row.episodes ?? []).slice().sort((a, b) => a.ordem - b.ordem);
  return {
    id: row.id,
    slug: row.slug,
    titulo: row.titulo,
    descricao: row.descricao,
    sinopse: row.sinopse,
    capa: row.capa,
    hero: row.hero,
    categoria: row.categoria,
    ano: row.ano,
    episodios_count: row.episodios_count,
    rating: Number(row.rating),
    destaque: row.destaque,
    ordem: row.ordem,
    episodios: eps,
  };
}

export async function fetchDoramas(): Promise<Dorama[]> {
  const { data, error } = await supabase
    .from("doramas")
    .select("*, episodes(*)")
    .order("ordem", { ascending: true });
  if (error) throw error;
  return (data as DoramaRow[]).map(normalize);
}

export async function fetchDoramaBySlug(slug: string): Promise<Dorama | null> {
  const { data, error } = await supabase
    .from("doramas")
    .select("*, episodes(*)")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? normalize(data as DoramaRow) : null;
}

export async function fetchEpisodeWithDorama(
  episodeId: string,
): Promise<{ dorama: Dorama; episode: Episode } | null> {
  const { data: ep, error } = await supabase
    .from("episodes")
    .select("*, dorama:doramas(*, episodes(*))")
    .eq("id", episodeId)
    .maybeSingle();
  if (error) throw error;
  if (!ep) return null;
  const doramaRow = (ep as unknown as { dorama: DoramaRow }).dorama;
  const episode: Episode = {
    id: ep.id,
    dorama_id: ep.dorama_id,
    ordem: ep.ordem,
    titulo: ep.titulo,
    duracao: ep.duracao,
    video_url: ep.video_url,
  };
  return { dorama: normalize(doramaRow), episode };
}

export const doramasQuery = queryOptions({
  queryKey: ["doramas"],
  queryFn: fetchDoramas,
  staleTime: 30_000,
});

export const doramaBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["dorama", slug],
    queryFn: () => fetchDoramaBySlug(slug),
    staleTime: 30_000,
  });

export const episodeQuery = (episodeId: string) =>
  queryOptions({
    queryKey: ["episode", episodeId],
    queryFn: () => fetchEpisodeWithDorama(episodeId),
    staleTime: 30_000,
  });
