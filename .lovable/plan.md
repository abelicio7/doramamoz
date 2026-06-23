## DoramaMoz — Plataforma de streaming de doramas moçambicanos

Vou construir em fases. Esta primeira entrega foca no **frontend completo + fluxo de conversão**, com dados mock realistas. O backend (Lovable Cloud: auth, base de dados, pagamentos M-Pesa/E-Mola) entra numa segunda fase, depois de validares o visual e os fluxos.

### Fase 1 — Frontend + UX (esta entrega)

**Design**
- Tema escuro premium (preto profundo + acento quente moçambicano, ex.: âmbar/coral), inspirado em Netflix/Viki mas com identidade local.
- Tipografia display marcante + sans-serif legível.
- Totalmente responsivo (mobile-first), com hero cinematográfico, carrosséis, hover states e micro-interações.

**Rotas**
```
/                       Home — hero, "Em destaque", "Populares", "Novos"
/dorama/$slug           Página do dorama — capa grande, sinopse, trailer, lista de episódios, CTA "Assistir por 60 MT"
/assistir/$episodeId    Player (gated: só pagantes)
/pagamento              Página de checkout — 60 MT, benefícios, métodos M-Pesa / E-Mola (UI preparada)
/auth                   Login / Cadastro / Recuperar senha (abas)
/perfil                 Perfil do utilizador + estado de pagamento + continuar a assistir
/admin                  Painel admin (gated por role)
```

**Fluxos chave**
- Visitante vindo de anúncio (`/dorama/amor-em-maputo`) → vê trailer + info + CTA "Assistir Completo por Apenas 60 MT" → login/cadastro → pagamento → desbloqueio imediato.
- Não-pagante clica em episódio → **modal "Desbloqueie todo o conteúdo"** com botão "Desbloquear Agora" → `/pagamento`.
- Pagante → player com "continuar de onde parou" + episódios relacionados.

**Estado (Fase 1)**
- Auth e estado de pagamento simulados via Zustand + localStorage para validar fluxos.
- Dados de doramas/episódios em mock (`src/data/doramas.ts`) com 6-8 títulos e capas geradas.
- Painel admin funcional sobre os mocks (CRUD em memória) para validar UX.

### Fase 2 — Backend (próxima entrega, após aprovação)
Activar Lovable Cloud para:
- Auth real (email/password + Google), recuperação de senha, perfis.
- Tabelas: `profiles`, `doramas`, `episodes`, `payments`, `watch_progress`, `user_roles` (com `has_role` security definer).
- RLS: episódios só lêem URL de vídeo se `status_pagamento = 'pagante'`.
- Storage para capas e vídeos.
- Edge function webhook para confirmar pagamentos e promover utilizador a "pagante".
- Estrutura para integração M-Pesa / E-Mola (endpoints stub assinados).

### Detalhes técnicos
- TanStack Start + Tailwind v4 + shadcn, design tokens em `src/styles.css` (sem cores hardcoded nos componentes).
- Variantes de Button (`hero`, `unlock`), Card (`dorama`), Badge (`premium`).
- Imagens de capa geradas com `imagegen` (estética dorama moçambicano).
- Componentes: `HeroBanner`, `DoramaCarousel`, `DoramaCard`, `UnlockModal`, `EpisodeList`, `VideoPlayer`, `PaymentCard`, `AdminTable`.
- SEO: cada rota com `head()` próprio; `/dorama/$slug` com `og:image` = capa (essencial para anúncios).

### Fora do âmbito da Fase 1
- Processamento real de pagamentos (só UI).
- Upload/streaming real de vídeos (player usa vídeo demo).
- Envio real de emails.

Confirmas que avanço com a Fase 1 assim? Se preferires que eu inclua já o Lovable Cloud (auth real + BD) nesta primeira entrega, diz só "inclui o backend" e ajusto o âmbito.