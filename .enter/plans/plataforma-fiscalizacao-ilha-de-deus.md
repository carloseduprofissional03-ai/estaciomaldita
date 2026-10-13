# Fase 2 — Dados na nuvem (Enter Cloud) — Plataforma "Da Nascente à Foz"

## Contexto

O site comunitário de fiscalização ambiental da Ilha de Deus (Recife) está pronto, com o design claro aprovado e publicado como **demo**: todos os dados vivem em `localStorage` (via `DataProvider` + seed) e o login da equipe é simulado com credenciais fixas.

O usuário assinou o **plano Basic**, ativou o **Enter Cloud** e quer a versão com **banco de dados real na nuvem**: denúncias, mutirões, notícias e fotos enviadas por qualquer visitante passam a ser guardadas de verdade e moderadas pela equipe (conteúdo só vira público após aprovação). A interface visual **não muda**.

Decisões confirmadas com o usuário:
- Moderação por **código de convite**: quem tem o código secreto cria a conta de moderador (nome + e-mail + senha). Vários moderadores podem ser criados depois.
- Primeiro moderador: e-mail `equipe@nascfz.org.br`.
- Conteúdo demo atual (denúncias, mutirões, notícias, fotos, inscrições) vira o conteúdo inicial real do banco.
- Denúncias seguem anônimas (contato opcional e nunca público); voluntários continuam se inscrevendo sem conta.

## Arquitetura

### 1. Banco de dados (1 migration única via `supabase_migration`)

Tabelas espelhando o modelo atual (`src/lib/types.ts`), com colunas `snake_case`:
- `profiles` — `id uuid PK FK auth.users`, `full_name text`, `role text` (`user`|`admin`), `created_at`. RLS: cada usuário lê/atualiza o próprio perfil.
- `reports` — `id text PK default gen_random_uuid()::text`, `category`, `title`, `description`, `reference`, `lat float8`, `lng float8`, `photo_url`, `contact` (nunca público), `status`, `resolved bool default false`, `resolution_note`, `created_at`.
- `cleanup_events` — como o modelo atual + `signup_count int not null default 0` (contador público; e-mails de inscritos nunca expostos).
- `event_signups` — `id`, `event_id FK cleanup_events (on delete cascade)`, `name`, `email`, `phone`, `created_at` + **`unique (event_id, email)`**.
- `news` e `gallery_photos` — como o modelo atual.
- Função `public.is_admin()` (security definer): retorna `true` se `profiles.role='admin'` para `auth.uid()`.
- Trigger `set_pending()` (before insert em `reports`, `cleanup_events`, `news`, `gallery_photos`): se a requisição for `service_role` (seed/migração) **ou** moderador logado, mantém o `status` enviado; caso contrário força `'pending'` (ninguém anônimo publica direto).
- Trigger em `event_signups` (after insert): `cleanup_events.signup_count = signup_count + 1`.
- **RLS em todas as tabelas**: `reports`, `cleanup_events`, `news`, `gallery_photos` → SELECT/UPDATE/DELETE somente `is_admin()`; INSERT liberado a todos (trigger força `pending`). `event_signups` → INSERT a todos, sem SELECT público. `profiles` como acima.
- **Views públicas** `security barrier` para leitura anônima (o `anon` não recebe SELECT nas tabelas base): `approved_reports` (somente `approved`, **sem `contact`**), `approved_cleanup_events` (somente `approved`, **sem `proposer_contact`**, com `signup_count`), `approved_news`, `approved_gallery_photos`. `grant select` a `anon` e `authenticated`.
- Grants explícitos de SELECT/INSERT/UPDATE/DELETE nas tabelas base para `authenticated` (moderador) e views para `anon`.
- Storage: bucket público `nascfz` (insert em `storage.buckets` `on conflict do nothing`) + policies em `storage.objects`: SELECT e INSERT para `anon`/`authenticated` com `bucket_id='nascfz'`. **Fallback** se o ambiente bloquear: `photo_url`/`image_url` continuam aceitando `data URL` no texto (interface já suporta).
- Conferir resultado com `supabase_get_table_schema` (RLS ligado + policies listadas) e `supabase_read_query` (contadores).

### 2. Autenticação da equipe (real)

- `supabase_configure_auth`: `disable_signup=true` (contas só nascem pelo convite) — sem usuários anônimos.
- Segredo `ADMIN_INVITE_CODE` via `supabase_add_secret` (o usuário digita o código que vai compartilhar com a equipe).
- Backend function `register-admin` (`supabase/functions/register-admin/index.ts`, `verify_jwt=false` no `supabase/config.toml`): CORS completo; valida `invite_code` contra `Deno.env.get('ADMIN_INVITE_CODE')` (errado → 403); cria o usuário autenticado (admin API, `email_confirm: true`) com `full_name`; insere `profiles` com `role='admin'`. Deploy via `supabase_deploy_edge_function`.

### 3. Camada de dados do frontend (mesma interface, dados reais)

- **`src/components/data-provider.tsx`** (reescrito): passa a usar o client `@/integrations/supabase/client` (`supabase`). Estado local igual ao atual (`db` com `reports/events/news/photos`), mapeando `snake_case → camelCase`. No carregamento inicial: visitante busca as **views aprovadas**; moderador logado busca as **tabelas base** (todas as situações, com `contact`). Reage a `onAuthStateChange` (refetch ao entrar/sair). Mostra um loader simples até o primeiro carregamento (evita flash de conteúdo vazio). Ações escrevem no banco com atualização otimista local:
  - `addReport/addEvent/addNews/addPhoto` → INSERT (id gerado no cliente e enviado; status controlado pelo trigger).
  - `updateReport/updateEvent/updateNews/updatePhoto`, `remove` → UPDATE/DELETE.
  - `addSignup` → vira **assíncrona** retornando `{ok, message}`; e-mail duplicado (constraint `unique`) vira a mensagem amigável atual.
  - `resetDemo` **removido** (não faz sentido na nuvem).
- **`src/lib/types.ts`**: `CleanupEvent` ganha `signupCount: number`; `AppDB` perde `signups` (as contagens vêm do contador). `NewSignupInput` continua igual.
- **`src/lib/stats.ts`**: `voluntarios` passa a somar `signup_count` dos eventos aprovados (mesmo número de antes).
- **`src/pages/voluntariado/index.tsx`**: `countFor` lê `event.signupCount`; `submit` do formulário de inscrição faz `await actions.addSignup(...)`.
- **`src/lib/auth.ts`** (substituído): sessão real do `supabase.auth` + leitura do próprio perfil (`profiles`) para saber se é admin; removida a credencial demo.
- **`src/pages/admin/index.tsx`**: login real (e-mail/senha); nova aba **"Registrar"** (nome, e-mail, senha, código de convite) chamando `supabase.functions.invoke('register-admin')` e entrando em seguida; botão "Restaurar demo" removido; demais abas (Pendentes/Publicados/Criar) permanecem, agora sobre o banco.
- **`src/components/image-upload.tsx`**: comprime como hoje e **envia ao bucket `nascfz`** (`uploads/<uuid>.jpg`), devolvendo a URL pública via `onChange` — páginas de denúncia/galeria/equipe continuam idênticas.

### 4. Seed realista no banco

Via `supabase_insert`, o mesmo conteúdo atual de `src/lib/seed.ts`: 10 denúncias (8 aprovadas, 2 pendentes), 3 mutirões (2 aprovados, 1 pendente) com contadores, 12 inscrições (e1=10, e2=2), 4 notícias (3 aprovadas, 1 pendente), 7 fotos (6 aprovadas, 1 pendente). As imagens já existem na CDN (`src/lib/images.ts`) — apenas referências por URL. Depois: `src/lib/seed.ts` deixa de ser importado (conteúdo agora vive no banco).

### Arquivos principais

- **Backend**: migration SQL única; `supabase/functions/register-admin/index.ts`; `supabase/config.toml` (entrada `register-admin`); secret `ADMIN_INVITE_CODE`.
- **Frontend**: `src/components/data-provider.tsx` (reescrito), `src/lib/auth.ts` (reescrito), `src/lib/types.ts`, `src/lib/stats.ts`, `src/components/image-upload.tsx`, `src/pages/voluntariado/index.tsx`, `src/pages/admin/index.tsx`.
- **Sem mudança visual**: `PublicLayout`, rotas, Home, Mapa, Denunciar, Denúncias, Notícias, Galeria, Impacto (lêem `db` como hoje).
- `src/lib/seed.ts` e `src/lib/site.ts` (parte demo) ficam sem uso no fluxo de dados.

## Implementation checklist

- [ ] Aplicar a migration única (tabelas + `is_admin()` + triggers `set_pending`/contador + RLS + views públicas + grants + bucket `nascfz` + policies de storage) via `supabase_migration`.
- [ ] Confirmar com `supabase_get_table_schema`: RLS habilitado e policies presentes em `profiles`, `reports`, `cleanup_events`, `event_signups`, `news`, `gallery_photos`.
- [ ] Configurar auth via `supabase_configure_auth` (`disable_signup=true`).
- [ ] Coletar o segredo `ADMIN_INVITE_CODE` via `supabase_add_secret`.
- [ ] Criar e deployar `register-admin` (`verify_jwt=false`); validar com CORS e erros (código errado → 403; sucesso → usuário + perfil admin).
- [ ] Inserir seed realista (denúncias/mutirões/inscrições/notícias/fotos) via `supabase_insert`; conferir `signup_count` (e1=10, e2=2) com `supabase_read_query`.
- [ ] Reescrever `src/components/data-provider.tsx` com o client do Enter Cloud, mapeamento de colunas, loader inicial, refetch em troca de sessão e ações otimistas; remover `resetDemo` e o uso de `localStorage`/`seed`.
- [ ] Atualizar `src/lib/types.ts` (`signupCount` em `CleanupEvent`, `AppDB` sem `signups`).
- [ ] Atualizar `src/lib/stats.ts` para somar `signup_count`; ajustar `src/pages/voluntariado/index.tsx` (`event.signupCount` + `await addSignup`).
- [ ] Reescrever `src/lib/auth.ts` com sessão real; adaptar `src/pages/admin/index.tsx` (login real, aba Registrar com convite, remover botão "Restaurar demo").
- [ ] Atualizar `src/components/image-upload.tsx` para upload no bucket e devolver URL pública.
- [ ] Remover import de `seed.ts` morto no fluxo de dados.
- [ ] `pnpm lint` e `pnpm exec tsc --noEmit` sem erros; `pnpm run build` conclui.
- [ ] Registrar o primeiro moderador (`equipe@nascfz.org.br`) pela aba Registrar com o código de convite e publicar o site de novo (botão Publish) ao final.

## Verification checklist

- [ ] **Positivo público**: visitante (sem login) vê no preview as denúncias/mutirões/notícias/fotos aprovadas do seed; mapa, home, impacto e denúncias mostram contagens corretas (voluntários = 12).
- [ ] **Fluxo denúncia**: enviar denúncia anônima no preview → não aparece no mapa (status `pending`); logar como moderador no `/admin` → aparece em Pendentes; aprovar → volta a aparecer publicamente (após reload).
- [ ] **Fluxo mutirão**: propor mutirão → pendente; aprovar → listado em Voluntariado com contador; inscrever 2 vezes com o mesmo e-mail no mesmo evento → segunda tentaiva mostra a mensagem amigável de duplicado e o contador não sobe.
- [ ] **Negativo/segurança**: com SQL de leitura confirmar que views públicas não contêm `contact`/`proposer_contact` e que `event_signups` não é legível publicamente; código de convite errado não cria conta; visitante não consegue alterar/excluir conteúdo (RLS).
- [ ] **Registro de moderador**: `register-admin` cria o usuário e perfil `admin`; login real funciona; logout funciona; acesso ao `/admin` sem sessão mostra a tela de login/registro.
- [ ] **Upload**: enviar foto em Denunciar/Galeria → imagem aparece no preview com URL do bucket `nascfz`.
- [ ] **Build/escopo**: `pnpm run build` passa; sem mudanças visuais nas páginas públicas além do loader inicial.
