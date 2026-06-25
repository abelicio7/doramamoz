
CREATE TABLE public.doramas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  titulo text NOT NULL,
  descricao text NOT NULL DEFAULT '',
  sinopse text NOT NULL DEFAULT '',
  capa text NOT NULL,
  hero text,
  categoria text NOT NULL DEFAULT 'Romance',
  ano integer NOT NULL DEFAULT 2025,
  episodios_count integer NOT NULL DEFAULT 0,
  rating numeric(3,1) NOT NULL DEFAULT 8.0,
  destaque boolean NOT NULL DEFAULT false,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.doramas TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.doramas TO authenticated;
GRANT ALL ON public.doramas TO service_role;
ALTER TABLE public.doramas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doramas public read"
  ON public.doramas FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage doramas"
  ON public.doramas FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER doramas_touch BEFORE UPDATE ON public.doramas
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dorama_id uuid NOT NULL REFERENCES public.doramas(id) ON DELETE CASCADE,
  ordem integer NOT NULL,
  titulo text NOT NULL,
  duracao text NOT NULL DEFAULT '40 min',
  video_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dorama_id, ordem)
);
GRANT SELECT ON public.episodes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.episodes TO authenticated;
GRANT ALL ON public.episodes TO service_role;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "episodes public read"
  ON public.episodes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage episodes"
  ON public.episodes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_episodes_dorama ON public.episodes(dorama_id, ordem);

-- Seed data
DO $$
DECLARE
  demo_video text := 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  d_id uuid;
  i integer;
  seed record;
BEGIN
  FOR seed IN
    SELECT * FROM (VALUES
      (
        'fortuna-revelada',
        'Fortuna Revelada: Meu Marido é de Estouro',
        'Um casamento arranjado revela segredos de uma família poderosa.',
        'Quando Ana descobre que o seu marido aparentemente humilde é, na verdade, herdeiro de uma fortuna escondida, a vida pacata em Maputo transforma-se numa teia de tradições, ambições e um amor que ninguém esperava.',
        '/__l5e/assets-v1/3f6a4fdb-fc86-4115-a0b4-94c93fad4b2a/fortuna-revelada.jpg',
        'Romance', 2025, 12, 9.4, true, 1
      ),
      (
        'casamento-obrigatorio',
        'Casamento Obrigatório? Me Viro com Três Damas Perdidas!',
        'Um jovem tradicionalista vê-se obrigado a viver com três mulheres muito diferentes.',
        'Por imposição da família, Tomás é forçado a um casamento múltiplo numa vila tradicional. Entre orgulho, paixão e equívocos, descobre que cada uma das três damas guarda um segredo que pode mudar o seu destino para sempre.',
        '/__l5e/assets-v1/531d402e-9349-4a2e-8897-d5ab086f8197/casamento-obrigatorio.jpg',
        'Comédia Romântica', 2025, 16, 9.0, true, 2
      ),
      (
        'rainha-nao-ama',
        'A Rainha Não Ama, Só Conquista',
        'Uma executiva determinada coloca o poder à frente do coração — até que o passado bate à porta.',
        'Vera é a CEO mais temida de Maputo. Não acredita em amor, só em resultados. Mas quando o primeiro amor da sua juventude reaparece como novo investidor da empresa, ela é obrigada a escolher entre o império que construiu e o coração que jurou nunca mais ouvir.',
        '/__l5e/assets-v1/c2c5a2d0-7ca8-47ac-95f1-dbf3aaa48010/rainha-conquista.jpg',
        'Drama', 2025, 14, 9.1, true, 3
      ),
      (
        'segredos-da-capital',
        'Segredos da Capital',
        'Uma jornalista descobre uma trama de corrupção que ameaça a sua vida.',
        'Quando Andrea, jornalista de investigação, recebe um envelope anónimo com documentos comprometedores, mergulha numa rede de corrupção que liga políticos, empresários e o crime organizado. Cada pista a aproxima da verdade — e do perigo.',
        '/__l5e/assets-v1/28750e89-a988-4ee4-9ff1-66b480292f26/dorama-extra.avif',
        'Thriller', 2024, 8, 8.9, false, 4
      ),
      (
        'amor-em-maputo',
        'Amor em Maputo',
        'Uma história de amor proibido entre dois jovens de mundos opostos na capital moçambicana.',
        'Lara, filha de um empresário poderoso, apaixona-se por Mateus, um jovem músico vindo da Mafalala. Entre festas da elite, segredos de família e a música que os une, descobrem que o amor verdadeiro custa caro.',
        '/__l5e/assets-v1/3f6a4fdb-fc86-4115-a0b4-94c93fad4b2a/fortuna-revelada.jpg',
        'Romance', 2024, 10, 8.7, false, 5
      ),
      (
        'herancas',
        'Heranças',
        'Três gerações de uma família de Inhambane enfrentam o peso do passado.',
        'A morte da matriarca obriga a família Macuácua a regressar à casa ancestral em Inhambane. Velhas mágoas, segredos guardados durante décadas e uma herança disputada põem à prova os laços que parecem inquebráveis.',
        '/__l5e/assets-v1/531d402e-9349-4a2e-8897-d5ab086f8197/casamento-obrigatorio.jpg',
        'Drama Familiar', 2023, 14, 8.5, false, 6
      ),
      (
        'ondas-de-tofo',
        'Ondas de Tofo',
        'Duas melhores amigas passam um Verão em Tofo que muda tudo para sempre.',
        'Joana e Mércia decidem passar o último Verão antes da vida adulta na praia de Tofo. O que começa como férias transforma-se numa viagem de auto-descoberta, primeiros amores e revelações.',
        '/__l5e/assets-v1/c2c5a2d0-7ca8-47ac-95f1-dbf3aaa48010/rainha-conquista.jpg',
        'Drama Jovem', 2024, 8, 8.6, false, 7
      )
    ) AS t(slug, titulo, descricao, sinopse, capa, categoria, ano, episodios_count, rating, destaque, ordem)
  LOOP
    INSERT INTO public.doramas (slug, titulo, descricao, sinopse, capa, hero, categoria, ano, episodios_count, rating, destaque, ordem)
    VALUES (seed.slug, seed.titulo, seed.descricao, seed.sinopse, seed.capa, seed.capa, seed.categoria, seed.ano, seed.episodios_count, seed.rating, seed.destaque, seed.ordem)
    RETURNING id INTO d_id;

    FOR i IN 1..seed.episodios_count LOOP
      INSERT INTO public.episodes (dorama_id, ordem, titulo, duracao, video_url)
      VALUES (d_id, i, 'Episódio ' || i, (38 + ((i * 3) % 12))::text || ' min', demo_video);
    END LOOP;
  END LOOP;
END $$;
