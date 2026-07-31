# Dine

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
EXPO_PUBLIC_USE_SUPABASE_AUTH=false
EXPO_PUBLIC_PRIVACY_POLICY_URL=
EXPO_PUBLIC_APP_URL=
EXPO_PUBLIC_SUPPORT_EMAIL=
EXPO_PUBLIC_SUPPORT_WHATSAPP=
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
- `app_reservations`: reservas nativas, quantidade de pessoas e status operacional.
- `app_waitlist_entries`: lista de espera por restaurante, data e horario preferido.
- `external_places`: locais de gastronomia exibidos apenas no mapa, separados dos parceiros.
- `external_place_claims`: solicitações de donos para transformar um local externo em perfil Dine.

### Atualizar locais externos

O extrato inicial usa dados abertos do Overture Maps para São José do Rio Preto:

```bash
python -m pip install -r scripts/requirements-overture.txt
python scripts/import_overture_places.py
```

O comando atualiza `src/data/externalPlacesSeed.json`, usado como fallback do app. Depois de aplicar a migration `202607310001_external_places.sql`, um administrador pode enviar o mesmo extrato ao Supabase:

```powershell
$env:SUPABASE_URL="https://seu-projeto.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="sua-chave-service-role"
python scripts/import_overture_places.py --push
```

`SUPABASE_SERVICE_ROLE_KEY` é segredo de servidor e nunca deve usar o prefixo `EXPO_PUBLIC_`.

Campos importantes de `restaurants`:

- `legacy_id`: id textual usado pelo app.
- `owner_legacy_id`: id textual do usuario local/demo.
- `app_payload`: payload completo do app para preservar campos ricos da UI.
- `name`, `cuisine_type`, `district`, `price_tier`, `rating`, `reviews_count`, `status`, `cover_image_url`, `tags`, `opening_hours`.

Fluxo atual:

- No cadastro, a pessoa escolhe entre conta de `user` e `restaurant_owner`.
- Contas `user` entram na experiência de descoberta; contas `restaurant_owner` entram no cadastro/painel do estabelecimento.
- Perfis antigos sem tipo explícito são tratados como `user` para manter compatibilidade.
- O painel do dono possui navegação própria para visão geral, reservas, disponibilidade e perfil.
- O restaurante configura agenda semanal, intervalo dos horários, capacidade por slot, tamanho máximo do grupo e confirmação automática.
- Usuários podem reservar no detalhe do restaurante, acompanhar ou cancelar em `Perfil > Reservas` e entrar na lista de espera quando não houver capacidade.
- Donos podem confirmar reservas, registrar chegada, concluir atendimento, cancelar e avisar a lista de espera.
- Ao reivindicar um local externo, o dono informa responsável, telefone e CNPJ; o pedido fica pendente na Central Admin.
- A aprovação cria um perfil em rascunho vinculado à conta solicitante. A rejeição não concede acesso e mantém o local externo no mapa.
- Novo restaurante e salvo como `pending`.
- Admin definido por `EXPO_PUBLIC_ADMIN_EMAIL` ou `EXPO_PUBLIC_ADMIN_EMAILS` pode publicar ou rejeitar na tela de aprovacoes.
- Dados/contas demo so devem ser ativados localmente com `EXPO_PUBLIC_ENABLE_DEMO_DATA=true`.
- A politica de privacidade publica deve ser configurada em `EXPO_PUBLIC_PRIVACY_POLICY_URL` e aparece dentro do app.
- Proprietario pode editar, pausar, reativar ou arquivar pelo painel do restaurante.
- Metricas de visualizacao, Maps, WhatsApp e reserva sao sincronizadas no Supabase.
- Fotos de perfil, feed e restaurantes sobem para Supabase Storage no bucket `restaurant-media`; se o upload falhar, o app usa URI local como fallback.

Nota de seguranca:

O modo seguro usa Supabase Auth, RLS por `auth.uid()`, Storage por proprietário e criação transacional de reservas. A ativação é gradual:

1. Aplique todas as migrations, incluindo `202607300003_backend_hardening.sql`.
2. No painel do Supabase, em Authentication > Providers > Email, desative **Confirm email** enquanto o produto não usar confirmação por e-mail.
3. Valide cadastro e login em homologação.
4. Defina `EXPO_PUBLIC_USE_SUPABASE_AUTH=true` no ambiente que será publicado.

Com a flag desligada, o fluxo local legado continua disponível para desenvolvimento. Ele não deve ser usado em produção depois que a migration de hardening for aplicada, porque as escritas anônimas passam a ser bloqueadas.

## Gamificacao

O perfil mantem `gamification` no usuario:

- `points`: pontuacao total.
- `metrics`: contadores de favoritos, rotas abertas, avaliacoes, restaurantes conhecidos, curtidas dadas, convites e colecoes.
- `awarded`: ids ja pontuados para evitar farmar a mesma acao repetidamente.
- `achievements`: conquistas liberadas.

## App Store e moderacao

O app tem experiencia nativa de descoberta, busca/filtros, favoritos, mapa/rotas, avaliacoes, feed, compartilhamento, notificacoes e fallback de localizacao por cidade/bairro.

Controles exigidos para conteudo gerado por usuarios:

- Denuncia em restaurante, publicacao, perfil e avaliacao.
- Bloqueio de perfis em perfil publico e em `Configuracoes > Contas bloqueadas`.
- Filtro local de termos ofensivos antes de publicar post, comentario ou avaliacao.
- Fila de moderacao na `Central admin`.
- Remocao de avaliacoes por admin no detalhe do restaurante.
- Exclusao de conta em `Perfil > Configuracoes > Seguranca > Excluir minha conta`.

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
