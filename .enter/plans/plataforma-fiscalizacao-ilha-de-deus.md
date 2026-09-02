# Plataforma de Fiscalização Ambiental Comunitária — Piloto Ilha de Deus (Recife)

## Contexto

O usuário é estudante em uma disciplina de extensão (tema social e ambiental) e quer criar um site que sirva como **ferramenta de resultados e de ação** para a Ilha de Deus (Recife/PE) — uma comunidade em área de mangue/sistema estuarino.

A visão é maior que o mangue da Ilha de Deus: o projeto é um **protótipo de preservação dos sistemas costeiros do Recife**, com a comunidade como protagonista de uma "fiscalização comunitária" que funcione (1) para engajar voluntários, (2) para dar visibilidade ao que acontece no território e (3) para pressionar/registrar o papel do poder público no combate ao descarte irregular e na garantia de um meio ambiente justo. O site deve servir como piloto demonstrável, replicável para outras regiões e bairros.

O projeto atual é um template Vite + React 19 + TS + shadcn/Tailwind praticamente vazio (página Index + rota 404, i18n en/zh-CN pré-instalado). Todo o produto será construído do zero sobre ele.

### Decisões confirmadas com o usuário
1. **Idioma**: somente Português (pt-BR) — remover a maquinaria de i18n do template e escrever conteúdo direto em pt-BR.
2. **Denúncias**: anônimas, com contato **opcional** (baixa barreira, adequado à fiscalização comunitária).
3. **Voluntariado**: voluntários **propõem** mutirões com data/hora; um moderador **aprova antes de publicar**.
4. **Conteúdo de demonstração**: sim, incluir exemplos realistas (marcadores no mapa, mutirões, notícias, fotos) para apresentação na disciplina.
5. **Moderação**: todo conteúdo vindo da comunidade (denúncias, mutirões, notícias, fotos) nasce como `pending` e só aparece publicamente após aprovação por moderadores (equipe do projeto).
6. **Marca provisória**: *Recifes Vivos* — "Comunidade na defesa dos sistemas costeiros do Recife", com piloto na Ilha de Deus. Alternativas abertas à revisão do usuário: "Costas Vivas do Recife", "Guardiões do Mangue". Centralizada em um único local de fácil troca.

## Backend (necessário — Enter Cloud)

Dados persistidos + aprovação + contas de moderador exigem banco, autenticação e armazenamento de arquivos. **Enter Cloud não está habilitado** → habilitar via `supabase_enable` no início da implementação e carregar a skill `enter_cloud` antes de escrever SQL/auth/storage. Skills `frontend-design` (design system) também serão carregadas. Sem backend, o fluxo "conteúdo da comunidade precisa ser aprovado" seria falso/mockado — o que não faremos.

## Arquitetura & Stack

- Frontend React existente + **@tanstack/react-query** (já instalado) para dados.
- **Mapa**: `leaflet` + `react-leaflet` (novas dependências) com tiles OpenStreetMap — gratuito, sem chave de API. Marcadores por `L.divIcon` colorido por categoria (evita problema de assets de ícones do Leaflet).
- **Gráficos** de relatórios: `recharts` (já instalado).
- **Backend**: Enter Cloud — Supabase client (já existe `@supabase/supabase-js`), tabelas + RLS, Storage para fotos, 1 função de backend para criar moderadores com código de convite.
- Identidade visual: paleta "sistema costeiro" (verde-mangue, azul-estuário, areia/quente) aplicada via tokens no `index.css` + `tailwind.config.ts`. Componentes shadcn já disponíveis (button, card, badge, dialog, sheet, form, input, textarea, select, tabs, skeleton, sonner/toast etc.) — reutilizar.

## Modelo de dados (Enter Cloud)

- `reports` — denúncia: `id`, `category` (descarte irregular; esgoto/efluente; degradação do manguezal; ocupação de área de preservação; poluição de rio/canal; queimada/desmatamento; outro), `title`, `description`, `reference` (ponto de referência), `lat`, `lng`, `photo_url`, `contact` (opcional, **nunca público**), `status` (`pending|approved|rejected`), `resolved` (bool), `resolution_note`, `created_at`.
- `cleanup_events` — mutirão: `id`, `title`, `description`, `location_name`, `lat`, `lng`, `date`, `start_time`, `end_time`, `volunteers_target`, `signup_count` (contador), `proposer_name`, `proposer_contact` (só moderador), `status` (`pending|approved|cancelled`), `created_at`.
- `event_signups` — inscrição em mutirão: `id`, `event_id` (FK), `name`, `email`, `phone`, `created_at`. Restrição `unique(event_id, email)` — sem duplicidade.
- `news` — notícia: `id`, `title`, `summary`, `body`, `cover_url`, `author`, `status` (`pending|approved`), `created_at`.
- `gallery_photos` — foto da galeria: `id`, `title`, `description`, `image_url`, `author`, `status` (`pending|approved`), `created_at`.
- `profiles` — moderadores: `id` (FK auth.users), `full_name`, `role` (`admin`), `created_at`.

**Segurança/RLS (resumo)**:
- Anônimo: `INSERT` nas tabelas de conteúdo é permitido, mas um trigger `set_pending()` força `status='pending'` (ignora valor enviado). Anônimo **não** lê nada além de conteúdo `approved` (via **view** `approved_reports`, que exclui `contact`) nem atualiza nada.
- `event_signups`: INSERT anônimo; contagem pública via contador `signup_count` atualizado por trigger (sem expor e-mails).
- Moderador (`public.is_admin()` security definer): SELECT em tudo (pendentes/contatos), UPDATE/DELETE, marcar `resolved`.
- Storage bucket público de leitura; upload permitido com nomes aleatórios (uuid).
- Cadastro de moderador: página `/admin` → aba "Registrar" pede nome + e-mail + senha + **código de convite**; função de backend `register-admin` valida o código (secreto armazenado via `supabase_add_secret`, lido com `Deno.env.get`), cria o usuário autenticado e insere `profile` com `role='admin'`. Contas de moderador = equipe do projeto (não há cadastro público de usuários).

## Páginas & Rotas (todas em pt-BR)

Estrutura comum: `PublicLayout` (cabeçalho com navegação + CTA "Denunciar" + rodapé com link discreto "Moderação").

| Rota | Conteúdo |
|---|---|
| `/` **Início** | Hero com identidade visual; missão ("protótipo de preservação dos sistemas costeiros do Recife, piloto na Ilha de Deus"); seção "Como funciona" (Observar → Denunciar → Moderar/Aprovar → Poder público → Resolvido); números ao vivo (totais); últimas notícias aprovadas; CTAs "Fazer denúncia" e "Participar de mutirão". |
| `/mapa` **Mapa** | Leaflet centralizado na Ilha de Deus; marcadores de denúncias **aprovadas**, filtro por categoria e por situação (ativa/resolvida); popup + painel lateral com detalhe (foto, descrição, referência, data, status). |
| `/denunciar` **Denunciar** | Formulário: categoria, título, descrição, ponto de referência, **clique no mapa para marcar o local** (lat/lng), foto opcional (upload), contato opcional; confirmação "em análise". |
| `/denuncias` **Denúncias** | Explica o que é fiscalização comunitária, tipos de problemas monitorados e o fluxo até a resolução; lista recente de aprovadas (link p/ mapa); CTA para nova denúncia. |
| `/voluntariado` **Voluntariado** | Mutirões aprovados futuros com data/hora/local e nº de inscritos; inscrição (nome/e-mail/tel); formulário "Propor um mutirão" (data, hora, local, descrição) → entra como `pending`. |
| `/noticias` e `/noticias/:id` | Lista e artigo (somente aprovadas). |
| `/galeria` **Galeria** | Grade de fotos aprovadas (upload comunitário + equipe). |
| `/relatorios` **Relatórios** | Transparência: contadores (denúncias, resolvidas, mutirões, voluntários); gráficos recharts: por categoria, evolução mensal, abertas × resolvidas. |
| `/admin` **Moderação** | Login (e-mail/senha) ou Registro (código de convite). Painel em abas: **Pendentes** (aprovar/rejeitar: denúncias, mutirões, notícias, fotos), **Publicados** (gerenciar; marcar denúncia como resolvida com nota; cancelar mutirão; excluir), **Criar** (notícia/evento/foto pela equipe). Protegido por role. |
| `*` 404 | Mantida. |

## Demonstração (conteúdo de exemplo)

- **Coordenadas**: ao iniciar a implementação, confirmar com o usuário um ponto de referência real (ex.: associação de moradores / entrada da comunidade) para centralizar mapa e dados de exemplo. Constante única `ILHA_DE_DEUS_CENTER` + `DEFAULT_ZOOM` em `src/lib/geo.ts`.
- Seed realista via SQL (somente após Enter Cloud): ~8 denúncias aprovadas (algumas resolvidas, com datas ao longo dos meses), 2 pendentes (para demonstrar a fila de moderação), 2 mutirões (1 aprovado futuro com inscritos, 1 pendente), 3 notícias aprovadas + 1 pendente, ~6 fotos aprovadas + 2 pendentes — com textos que reflitam a realidade costeira/mangue da Ilha de Deus.
- Imagens geradas com `image_generation` (cenas: manguezal/estuário, mutirão de limpeza, comunidade, fauna costeira) para hero, notícias, denúncias e galeria.

## Arquivos críticos

- **Backend**: schema SQL (tabelas/triggers/views/RLS/`is_admin`), bucket de storage, função `register-admin` — criados via fluxo Enter Cloud (`enter_cloud` skill), nenhum arquivo TS novo.
- **Novos (frontend)**:
  - `src/lib/supabase.ts` (client), `src/lib/types.ts`, `src/lib/geo.ts` (constantes do mapa), `src/lib/queries.ts` (hooks react-query por entidade)
  - `src/components/layout/PublicLayout.tsx` (header/nav/footer responsivos)
  - `src/pages/home/index.tsx`, `src/pages/mapa/index.tsx`, `src/pages/denunciar/index.tsx`, `src/pages/denuncias/index.tsx`, `src/pages/voluntariado/index.tsx`, `src/pages/noticias/index.tsx` + `artigo.tsx`, `src/pages/galeria/index.tsx`, `src/pages/relatorios/index.tsx`, `src/pages/admin/index.tsx`
  - Subcomponentes de página onde fizer sentido (formulários, cards, filtros, modais de moderação).
- **Alterados**: `src/router.tsx` (rotas), `src/main.tsx` (remove import i18n), `src/index.css` + `tailwind.config.ts` (tokens/design), `index.html` (`lang="pt-BR"`), `package.json` (leaflet), `CodeGuideline.md` (estrutura), página `Index` atual -> `src/pages/home/`.
- **Removidos**: `src/i18n/`, `public/locales/`, `src/components/language-switcher.tsx`, `i18n.config.json`.

## Implementação checklist

- [ ] Carregar skill `enter_cloud` e habilitar Enter Cloud via `supabase_enable` (necessário para persistir dados com aprovação — sem isso o fluxo seria mockado).
- [ ] Carregar skill `frontend-design` e definir tokens de identidade "sistema costeiro" em `index.css`/`tailwind.config.ts` (cores verdes/azul/areia, gradientes, sombras) e conferir contraste claro/escuro.
- [ ] Remover maquinaria de i18n (import em `main.tsx`, `src/i18n/`, `public/locales/`, `language-switcher.tsx`, `i18n.config.json`) e fixar `lang="pt-BR"` no `index.html`.
- [ ] Adicionar dependências `leaflet`, `react-leaflet`, `@types/leaflet`.
- [ ] Confirmar com o usuário o ponto de referência/coordenadas da Ilha de Deus e gravar em `src/lib/geo.ts`.
- [ ] Criar schema no Enter Cloud: tabelas `profiles`, `reports`, `cleanup_events`, `event_signups`, `news`, `gallery_photos` com `status`/defaults.
- [ ] Criar trigger `set_pending()` (conteúdo anônimo nasce `pending`), trigger de contador de inscritos, view `approved_reports` (sem `contact`) e políticas RLS com `public.is_admin()`.
- [ ] Criar bucket de storage (leitura pública, upload anônimo com nome aleatório) e armazenar o segredo `ADMIN_INVITE_CODE` via `supabase_add_secret`.
- [ ] Criar função de backend `register-admin` (valida convite via `Deno.env.get`, cria usuário autenticado + `profile role='admin'`).
- [ ] Gerar imagens de demonstração via `image_generation` (hero/manguezal/mutirão/comunidade) e aplicar seed SQL de conteúdo demo.
- [ ] Criar client `supabase.ts`, tipos e hooks de query (`queries.ts`).
- [ ] Criar `PublicLayout` (header com navegação + CTA, footer com link "Moderação"), responsivo.
- [ ] Página Início (hero, missão, como funciona, números, últimas notícias, CTAs).
- [ ] Página Mapa (Leaflet, marcadores por categoria, filtros, detalhe, sem `contact`).
- [ ] Página Denunciar (form + clique no mapa p/ coordenadas + upload de foto + contato opcional → `pending` + confirmação).
- [ ] Página Denúncias (educativa + fluxo até resolução + lista recente aprovada).
- [ ] Página Voluntariado (listar mutirões aprovados futuros com nº de inscritos; inscrever com e-mail; propor mutirão → `pending`).
- [ ] Páginas Notícias (lista + artigo) e Galeria (grade), somente aprovadas.
- [ ] Página Relatórios (contadores + gráficos recharts por categoria, evolução mensal, abertas × resolvidas).
- [ ] Página Admin (login, registro com convite, abas Pendentes/Publicados/Criar, marcar resolvida, cancelar/excluir) protegida por role.
- [ ] Registrar rotas em `src/router.tsx` e atualizar `CodeGuideline.md` com a estrutura final.

## Verification checklist

- [ ] `pnpm lint` e `pnpm exec tsc --noEmit` sem erros; `pnpm run build` conclui.
- [ ] Fluxo positivo denúncia: visitante envia denúncia → não aparece no mapa → aprovação no `/admin` → aparece no mapa com marcador/filtro correto; `contact` nunca exposto (verificado na view pública).
- [ ] Fluxo positivo mutirão: voluntário propõe → pendente → aprovado → listado no Voluntariado; inscrição incrementa `signup_count` e e-mail repetido no mesmo evento é bloqueado.
- [ ] Fluxo positivo moderação: notícia/foto comunitária pendente → aprovada → aparece em Notícias/Galeria.
- [ ] Negativo/segurança: conteúdo `pending`/`rejected` e campo `contact` não vazam ao público; anônimo não consegue atualizar/excluir registros; moderação inacessível sem login de moderador; código de convite errado não cria conta admin.
- [ ] Default/limites: páginas com listas vazias mostram estado vazio amigável; formulários exigem campos obrigatórios (categoria, título, descrição, ponto no mapa p/ denúncia; data/hora/local p/ mutirão); datas passadas não aparecem como mutirões futuros na listagem.
- [ ] Visual responsivo verificado com screenshots em `mobile_390` e `desktop_1280` (assunção declarada) nas rotas principais (Início, Mapa, Voluntariado) e navegação funcionando no mobile.
- [ ] Rota `/` e todas as navs acessíveis; rota 404 mantida.
