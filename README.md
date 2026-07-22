# Dine / Mesa Boa

Aplicativo Expo/React Native para descoberta de restaurantes parceiros, com mapa, colecoes, favoritos, perfil e cadastro de restaurantes.

## Setup local

1. Instale as dependencias:

```bash
npm install
```

2. Copie as variaveis de ambiente:

```bash
copy .env.example .env
```

3. Preencha as chaves no `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=
EXPO_PUBLIC_ADMIN_EMAIL=
EXPO_PUBLIC_ADMIN_EMAILS=
EXPO_PUBLIC_ENABLE_DEMO_DATA=false
```

4. Aplique as migrations no Supabase:

```bash
npx supabase db push
```

Ou cole os arquivos de `supabase/migrations/` no SQL Editor do painel Supabase, na ordem dos nomes.

5. Rode o app:

```bash
npm start
```

Atalhos:

```bash
npm run android
npm run ios
npm run web
```

## Banco e dados

O app usa Supabase em `supabaseConfig.js`, que cria o client com `@supabase/supabase-js` e concentra a camada de servicos remotos.

Migrations principais:

- `202607070001_initial_schema.sql`: schema base de restaurantes, perfis, roles, avaliacoes, favoritos e metricas.
- `202607070002_storage_policies.sql`: bucket publico `restaurant-media`.
- `202607210001_app_supabase_facade.sql`: campos e tabelas de compatibilidade para o app Expo atual.

Tabelas usadas pela camada do app:

- `restaurants`: restaurantes publicados, pendentes e dados do painel do restaurante.
- `reviews`: comentarios/avaliacoes sociais por restaurante.
- `app_profiles`: perfil local/demo sincronizado.
- `app_favorites`: favoritos por usuario local/demo.
- `feed_posts`, `feed_comments`, `feed_reactions`: feed social.
- `moderation_reports`: denuncias e fila de moderacao.
- `user_blocks`: bloqueios entre perfis.
- `invites`, `invite_redemptions`: links e usos de convite.
- `push_tokens`, `notification_queue`: notificacoes.

Campos importantes de `restaurants`:

- `legacy_id`: id textual usado pelo app.
- `owner_legacy_id`: id textual do usuario local/demo.
- `app_payload`: payload completo do app para preservar campos ricos da UI.
- `name`, `cuisine_type`, `district`, `price_tier`, `rating`, `reviews_count`, `status`, `cover_image_url`, `tags`, `opening_hours`.

Fluxo atual:

- Novo restaurante e salvo como `pending`.
- Admin definido por `EXPO_PUBLIC_ADMIN_EMAIL` ou `EXPO_PUBLIC_ADMIN_EMAILS` pode publicar ou rejeitar na tela de aprovacoes.
- Dados/contas demo so devem ser ativados localmente com `EXPO_PUBLIC_ENABLE_DEMO_DATA=true`.
- Proprietario pode editar, pausar, reativar ou arquivar pelo painel do restaurante.
- Metricas de visualizacao, Maps, WhatsApp e reserva sao sincronizadas no Supabase.
- Fotos de perfil, feed e restaurantes sobem para Supabase Storage no bucket `restaurant-media`; se o upload falhar, o app usa URI local como fallback.

Nota de seguranca:

O app ainda usa contas locais/demo, nao Supabase Auth. Por isso a migration de compatibilidade libera policies para `anon` sincronizar os dados esperados pelo app. Para producao, o proximo passo recomendado e migrar login/perfil para Supabase Auth e endurecer RLS usando `auth.uid()`.

## Gamificacao

O perfil mantem `gamification` no usuario:

- `points`: pontuacao total.
- `metrics`: contadores de favoritos, rotas abertas, avaliacoes, restaurantes conhecidos, curtidas dadas, convites e colecoes.
- `awarded`: ids ja pontuados para evitar farmar a mesma acao repetidamente.
- `achievements`: conquistas liberadas.

Ranks:

- Beliscador
- Cacador de Mesa
- Garfo Curioso
- Roteirista de Roles
- Sommelier de Experiencias
- Curador Dine
- Lenda da Reserva

## Qualidade

Rode o smoke check antes de entregar mudancas:

```bash
npm run smoke
```

Ele valida:

- parse JSX do `App.js`;
- resolucao do `app.config.js`;
- dependencias essenciais;
- ruidos comuns de codificacao;
- telas registradas na navegacao interna;
- divida atual de camadas de estilo.

Para validar o bundle web:

```bash
npx expo export --platform web --output-dir .expo-export-smoke
```

Depois da validacao, o diretorio `.expo-export-smoke/` pode ser apagado. Ele ja esta no `.gitignore`.

## Checklist manual

Android:

- Abrir `Explorar`, `Colecoes`, `Mapa`, `Favoritos`, `Perfil`.
- Pedir localizacao no mapa e testar permissao aceita/negada.
- Abrir filtros da busca e aplicar cidade, raio e filtros rapidos.
- Abrir detalhes de restaurante e botoes de WhatsApp/Maps.

iPhone:

- Repetir fluxo do Android.
- Conferir se o rodape nao cobre conteudo em telas com safe area.
- Conferir permissoes de localizacao.

Web:

- Abrir `npm run web`.
- Confirmar fallback do mapa.
- Confirmar que localizacao mostra fallback elegante.

## Divida tecnica conhecida

- `App.js` concentra dados, telas e estilos. O proximo passo estrutural e separar em `src/data`, `src/components`, `src/screens` e `src/styles`.
- Dados estaticos iniciais ja foram movidos para `src/data/appData.js`.
- Ha duas camadas historicas de `Object.assign(styles, ...)`. O smoke check permite no maximo duas e avisa sobre isso.
