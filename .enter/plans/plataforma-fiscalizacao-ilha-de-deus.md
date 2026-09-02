# Plataforma de Fiscalização Ambiental Comunitária — Piloto Ilha de Deus (Recife)

## Contexto

O usuário é estudante em uma disciplina de extensão (tema social e ambiental) e quer criar um **site** que sirva como ferramenta de resultados e de ação para a Ilha de Deus (Recife/PE) — comunidade em área de mangue/sistema estuarino. O site é público e navegável no navegador, para a comunidade, universidade e poder público.

A visão é maior que a Ilha de Deus: o projeto é um **protótipo de preservação dos sistemas costeiros do Recife**, com a comunidade como protagonista de uma "fiscalização comunitária" que (1) engaja voluntários, (2) dá visibilidade ao que acontece no território e (3) registra/demanda o papel do poder público no combate ao descarte irregular e na garantia de um meio ambiente justo. O site é um piloto demonstrável e replicável para outras regiões e bairros.

### Referência de produto: De Olho na Guanabara (deolhonaguanabara.com.br)
O usuário pediu para usar o "De Olho na Guanabara" como base. Trata-se de um portal de fiscalização socioambiental de comunidades (pescadores da Baía de Guanabara) cujo padrão vamos espelhar:

- **Mapa como peça central**: CTA principal "Acesse o mapa!" e o mapa interativo como ferramenta-coração do projeto.
- **Home editorial**: narrativa em seções que explicam o valor do território, o propósito do projeto, quem alimenta, como o fluxo de denúncia funciona (verificação antes de publicar) e para onde as denúncias são encaminhadas.
- **Credibilidade**: todo ponto publicado foi **verificado antes de virar público**; origem de dados institucionais explícita.
- **Proteção ao denunciante**: aviso "IMPORTANTE" afirmando que dados de quem denuncia são protegidos e nunca publicados.
- **Institucional**: seção de realização, parceiros e apoios + rodapé com créditos.
- **Layout**: cabeçalho branco com logo ao centro e navegação; hero com foto de fundo e botão CTA em destaque; faixa de declaração em cor forte; grade de cards de números; seções alternando texto centralizado. Vamos manter essa linguagem de comunicação (título forte, texto centralizado, seções claras) mas com **paleta própria definida pelo usuário: azul + verde + branco** (tons costeiros — água, estuário e mangue) — sem copiar a marca do site de referência.
- **Direção de design/comunicação (definida pelo usuário)**: visual **moderno e atual, porém simples — sem complicar o site** (navegação enxuta, hierarquia clara, sem excesso de elementos). A aba **Início é a principal**: nela ficam as informações sobre o projeto e os **dados da comunidade** (em cards/números), no estilo editorial do site de referência. A mensagem que deve ficar clara para quem visita: trata-se de um **projeto que parece pequeno hoje (um piloto na Ilha de Deus), mas com impacto maior e de longo prazo** sobre os sistemas costeiros do Recife — despertando a ideia de escala/replicabilidade.

### Decisões confirmadas com o usuário
1. **É um site público** (não um aplicativo): páginas no navegador para todos; a única exceção é a **área de moderação escondida** (`/admin`, com login só para a equipe) usada para aprovar o que a comunidade envia.
2. **Idioma**: somente Português (pt-BR) — remover a maquinaria de i18n do template e escrever conteúdo direto em pt-BR.
3. **Denúncias**: anônimas, com contato **opcional** (baixa barreira) — e com aviso de proteção ao denunciante, no espírito do site de referência.
4. **Voluntariado**: voluntários **propõem** mutirões com data/hora; um moderador **aprova antes de publicar**.
5. **Conteúdo demo**: incluir exemplos realistas (marcadores no mapa, mutirões, notícias, fotos) para apresentação na disciplina.
6. **Moderação**: todo conteúdo vindo da comunidade (denúncias, mutirões, notícias, fotos) nasce como `pending` e só aparece publicamente após aprovação — verificação antes de publicar, como no site de referência.
7. **Marca provisória**: *Recifes Vivos* — "Comunidade na defesa dos sistemas costeiros do Recife", piloto na Ilha de Deus. Alternativas abertas à revisão: "Costas Vivas do Recife", "Guardiões do Mangue". Centralizada em um único local de fácil troca.

## Backend (necessário — Enter Cloud)

Dados persistidos + aprovação + contas de moderador exigem banco, autenticação e armazenamento de arquivos. **Enter Cloud não está habilitado** → habilitar via `supabase_enable` no início da implementação e carregar a skill `enter_cloud` antes de escrever SQL/auth/storage. Skills `frontend-design` (design system) também serão carregadas. Sem backend, o fluxo "conteúdo só aparece após aprovação" seria falso/mockado — não faremos isso.

## Arquitetura & Stack

- Frontend React existente + **@tanstack/react-query** (já instalado) para dados.
- **Mapa**: `leaflet` + `react-leaflet` (novas dependências) com tiles OpenStreetMap — gratuito, sem chave de API. Marcadores por `L.divIcon` colorido por categoria.
- **Gráficos** de impacto: `recharts` (já instalado).
- **Backend**: Enter Cloud — Supabase client (já existe `@supabase/supabase-js`), tabelas + RLS, Storage para fotos, 1 função de backend para criar moderadores com código de convite.
- **Design system**: identidade costeira definida pelo usuário — **azul, verde e branco** (água/estuário + mangue + fundos claros) — via tokens no `index.css` + `tailwind.config.ts`; linguagem de layout editorial do site de referência (hero com foto + CTA, faixa de declaração, grade de números, seções centradas). Componentes shadcn já disponíveis — reutilizar (button, card, badge, dialog, sheet, form, input, textarea, select, tabs, skeleton, sonner/toast etc.).

## Modelo de dados (Enter Cloud)

- `reports` — denúncia: `id`, `category` (descarte irregular; esgoto/efluente; degradação do manguezal; ocupação de área de preservação; poluição de rio/canal; queimada/desmatamento; outro), `title`, `description`, `reference` (ponto de referência), `lat`, `lng`, `photo_url`, `contact` (opcional, **nunca público**), `status` (`pending|approved|rejected`), `resolved` (bool), `resolution_note`, `created_at`.
- `cleanup_events` — mutirão: `id`, `title`, `description`, `location_name`, `lat`, `lng`, `date`, `start_time`, `end_time`, `volunteers_target`, `signup_count` (contador), `proposer_name`, `proposer_contact` (só moderador), `status` (`pending|approved|cancelled`), `created_at`.
- `event_signups` — inscrição: `id`, `event_id` (FK), `name`, `email`, `phone`, `created_at`. `unique(event_id, email)`.
- `news` — notícia: `id`, `title`, `summary`, `body`, `cover_url`, `author`, `status` (`pending|approved`), `created_at`.
- `gallery_photos` — foto: `id`, `title`, `description`, `image_url`, `author`, `status` (`pending|approved`), `created_at`.
- `profiles` — moderadores: `id` (FK auth.users), `full_name`, `role` (`admin`), `created_at`.

**Segurança/RLS (resumo)**:
- Anônimo: `INSERT` nas tabelas de conteúdo permitido, mas trigger `set_pending()` força `status='pending'`. Anônimo **não** lê nada além de conteúdo `approved` (via **view** `approved_reports`, que exclui `contact`) nem atualiza nada.
- `event_signups`: INSERT anônimo; contagem pública via contador `signup_count` por trigger (sem expor e-mails).
- Moderador (`public.is_admin()` security definer): SELECT em tudo (pendentes/contatos), UPDATE/DELETE, marcar `resolved`.
- Storage bucket com leitura pública e upload anônimo com nomes aleatórios (uuid).
- Cadastro de moderador: `/admin` → aba "Registrar" (nome + e-mail + senha + **código de convite**); função de backend `register-admin` valida o código (secreto via `supabase_add_secret`, lido com `Deno.env.get`), cria o usuário autenticado e insere `profile` `role='admin'`. Contas de moderador = equipe do projeto (não há cadastro público).

## Páginas & Rotas (todas em pt-BR)

Estrutura comum: `PublicLayout` espelhando o padrão do site de referência — cabeçalho branco com logo central e navegação (Início, Mapa, Denúncias, Voluntariado, Notícias, Galeria, Impacto) + CTA "Denunciar"; rodapé com créditos e link discreto "Área da equipe" (→ `/admin`).

| Rota | Conteúdo |
|---|---|
| `/` **Início** (aba principal; editorial, em seções) | **Hero**: foto de fundo (mangue/estuário da Ilha de Deus) com CTA principal "Acesse o mapa!" + faixa de declaração de valor ("A Ilha de Deus é parte do patrimônio natural do Recife…"). **Sobre o projeto e a comunidade** (seção principal): narrativa centralizada sobre o piloto na Ilha de Deus, a comunidade como protagonista e a visão de longo prazo — um projeto que **parece pequeno hoje, mas com impacto maior** sobre os sistemas costeiros do Recife. **Dados da comunidade** (grade de cards ao vivo, no estilo do site de referência): denúncias registradas, resolvidas, voluntários mobilizados, mutirões realizados (+ texto sobre a comunidade: território de mangue, histórico). **Como funciona / processo de verificação**: Observar → Denunciar → Verificar (equipe) → Publicar no mapa → Visibilizar → Encaminhar ao poder público → Acompanhar/resolver; origem dos dados e verificação antes de publicar. **Aviso "IMPORTANTE"**: dados de quem denuncia são protegidos. **Realização/Apoio**: quem faz (disciplina/universidade, comunidade) com espaço para parceiros. Últimas notícias aprovadas + CTAs. |
| `/mapa` **Mapa** | CTA da home leva até aqui: Leaflet centralizado na Ilha de Deus; marcadores de denúncias **aprovadas**; filtro por categoria e por situação (ativa/resolvida); popup + painel lateral com detalhe (foto, descrição, referência, data, status, nº). |
| `/denunciar` **Denunciar** | Formulário: categoria, título, descrição, ponto de referência, **clique no mapa para marcar o local** (lat/lng), foto opcional (upload), contato opcional; confirmação "Recebida — em verificação". |
| `/denuncias` **Denúncias** | Página que explica a fiscalização comunitária e o fluxo até a resolução (no espírito do site de referência), tipos de problemas monitorados, garantia de proteção ao denunciante, lista recente de aprovadas e CTA para denunciar. |
| `/voluntariado` **Voluntariado** | Mutirões aprovados futuros com data/hora/local e nº de inscritos; inscrição (nome/e-mail/tel); formulário "Propor um mutirão" → `pending`. |
| `/noticias` e `/noticias/:id` | Lista e artigo (somente aprovadas). |
| `/galeria` **Galeria** | Grade de fotos aprovadas (upload comunitário + equipe). |
| `/impacto` **Impacto** | Transparência: contadores + gráficos recharts (por categoria, evolução mensal, abertas × resolvidas) — equivalente à seção "Impacto" do site de referência. |
| `/admin` **Área da equipe** | Login (e-mail/senha) ou Registro (código de convite). Painel em abas: **Pendentes** (aprovar/rejeitar: denúncias, mutirões, notícias, fotos), **Publicados** (gerenciar; marcar denúncia resolvida com nota; cancelar mutirão; excluir), **Criar** (notícia/evento/foto pela equipe). Protegido por role. Acesso apenas pelo link discreto no rodapé. |
| `*` 404 | Mantida. |

## Demonstração (conteúdo de exemplo)

- **Coordenadas**: ao iniciar a implementação, confirmar com o usuário um ponto de referência real (ex.: associação de moradores / entrada da comunidade) para centralizar mapa e dados de exemplo. Constante única `ILHA_DE_DEUS_CENTER` + `DEFAULT_ZOOM` em `src/lib/geo.ts`.
- Seed realista via SQL (após Enter Cloud): ~8 denúncias aprovadas (algumas resolvidas, datas ao longo dos meses), 2 pendentes (para demonstrar a fila de verificação), 2 mutirões (1 aprovado futuro com inscritos, 1 pendente), 3 notícias aprovadas + 1 pendente, ~6 fotos aprovadas + 2 pendentes — textos que reflitam a realidade costeira/mangue da Ilha de Deus.
- Imagens geradas com `image_generation` (hero: manguezal/estuário; mutirão de limpeza; comunidade; fauna costeira) para hero, notícias, denúncias e galeria.

## Arquivos críticos

- **Backend**: schema SQL (tabelas/triggers/views/RLS/`is_admin`), bucket de storage, função `register-admin` — criados via fluxo Enter Cloud (skill `enter_cloud`).
- **Novos (frontend)**:
  - `src/lib/supabase.ts` (client), `src/lib/types.ts`, `src/lib/geo.ts` (constantes do mapa), `src/lib/queries.ts` (hooks react-query por entidade)
  - `src/components/layout/PublicLayout.tsx` (header/nav/footer responsivos, padrão editorial do site de referência)
  - `src/pages/home/index.tsx` (home editorial em seções), `src/pages/mapa/index.tsx`, `src/pages/denunciar/index.tsx`, `src/pages/denuncias/index.tsx`, `src/pages/voluntariado/index.tsx`, `src/pages/noticias/index.tsx` + `artigo.tsx`, `src/pages/galeria/index.tsx`, `src/pages/impacto/index.tsx`, `src/pages/admin/index.tsx`
  - Subcomponentes de página onde fizer sentido (formulários, cards de números, filtros, modais de moderação).
- **Alterados**: `src/router.tsx` (rotas), `src/main.tsx` (remove import i18n), `src/index.css` + `tailwind.config.ts` (tokens/design), `index.html` (`lang="pt-BR"`), `package.json` (leaflet), `CodeGuideline.md` (estrutura).
- **Removidos**: `src/i18n/`, `public/locales/`, `src/components/language-switcher.tsx`, `i18n.config.json`.

## Implementação checklist

- [ ] Carregar skill `enter_cloud` e habilitar Enter Cloud via `supabase_enable` (necessário para persistir dados com verificação — sem isso o fluxo seria mockado).
- [ ] Carregar skill `frontend-design` e definir tokens de identidade costeira (**azul + verde + branco**) em `index.css`/`tailwind.config.ts` (tonalidades de água/estuário e mangue, gradientes, sombras) e conferir contraste claro/escuro.
- [ ] Remover maquinaria de i18n (import em `main.tsx`, `src/i18n/`, `public/locales/`, `language-switcher.tsx`, `i18n.config.json`) e fixar `lang="pt-BR"` no `index.html`.
- [ ] Adicionar dependências `leaflet`, `react-leaflet`, `@types/leaflet`.
- [ ] Confirmar com o usuário o ponto de referência/coordenadas da Ilha de Deus e gravar em `src/lib/geo.ts`.
- [ ] Criar schema no Enter Cloud: tabelas `profiles`, `reports`, `cleanup_events`, `event_signups`, `news`, `gallery_photos` com `status`/defaults.
- [ ] Criar trigger `set_pending()` (conteúdo anônimo nasce `pending`), trigger de contador de inscritos, view `approved_reports` (sem `contact`) e políticas RLS com `public.is_admin()`.
- [ ] Criar bucket de storage (leitura pública, upload anônimo com nome aleatório) e armazenar o segredo `ADMIN_INVITE_CODE` via `supabase_add_secret`.
- [ ] Criar função de backend `register-admin` (valida convite via `Deno.env.get`, cria usuário autenticado + `profile role='admin'`).
- [ ] Gerar imagens de demonstração via `image_generation` e aplicar seed SQL de conteúdo demo.
- [ ] Criar client `supabase.ts`, tipos e hooks de query (`queries.ts`).
- [ ] Criar `PublicLayout` responsivo (cabeçalho com logo/nav + CTA "Denunciar"; rodapé com créditos e link "Área da equipe").
- [ ] Página Início com seções na ordem do padrão editorial (hero + "Acesse o mapa!", declaração de valor, sobre o projeto **e dados da comunidade** em cards, como funciona/verificação, aviso de privacidade, realização/apoios, notícias) — narrativa "projeto pequeno hoje, impacto maior a longo prazo".
- [ ] Página Mapa (Leaflet, marcadores por categoria, filtros, detalhe, sem `contact`).
- [ ] Página Denunciar (form + clique no mapa p/ coordenadas + upload de foto + contato opcional → `pending` + confirmação).
- [ ] Página Denúncias (educativa, proteção ao denunciante, fluxo até resolução, lista recente aprovada).
- [ ] Página Voluntariado (listar mutirões aprovados futuros com nº de inscritos; inscrever com e-mail; propor mutirão → `pending`).
- [ ] Páginas Notícias (lista + artigo) e Galeria (grade), somente aprovadas.
- [ ] Página Impacto (contadores + gráficos recharts por categoria, evolução mensal, abertas × resolvidas).
- [ ] Página Admin (login, registro com convite, abas Pendentes/Publicados/Criar, marcar resolvida, cancelar/excluir) protegida por role.
- [ ] Registrar rotas em `src/router.tsx` e atualizar `CodeGuideline.md` com a estrutura final.

## Verification checklist

- [ ] `pnpm lint` e `pnpm exec tsc --noEmit` sem erros; `pnpm run build` conclui.
- [ ] Fluxo positivo denúncia: visitante envia denúncia → não aparece no mapa → aprovação no `/admin` → aparece no mapa com marcador/filtro correto; `contact` nunca exposto (view pública).
- [ ] Fluxo positivo mutirão: voluntário propõe → pendente → aprovado → listado no Voluntariado; inscrição incrementa `signup_count` e e-mail repetido no mesmo evento é bloqueado.
- [ ] Fluxo positivo moderação: notícia/foto comunitária pendente → aprovada → aparece em Notícias/Galeria.
- [ ] Negativo/segurança: conteúdo `pending`/`rejected` e campo `contact` não vazam ao público; anônimo não atualiza/exclui registros; `/admin` inacessível sem login de moderador; código de convite errado não cria conta admin.
- [ ] Default/limites: listas vazias mostram estado vazio amigável; formulários exigem campos obrigatórios; datas passadas não aparecem como mutirões futuros na listagem.
- [ ] Visual: identidade costeira **azul/verde/branco** aplicada nos tokens e páginas; hero com CTA "Acesse o mapa!" leva a `/mapa`; layout editorial em seções na home, similar ao padrão do site de referência (sem copiar marca).
- [ ] Responsivo verificado com screenshots em `mobile_390` e `desktop_1280` (assunção declarada) nas rotas principais (Início, Mapa, Voluntariado) e navegação funcionando no mobile.
- [ ] Rota `/` e todas as navs acessíveis; rota 404 mantida.
