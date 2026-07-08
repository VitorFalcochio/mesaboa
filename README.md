# Dine / Mesa Boa

Aplicativo Expo/React Native para descoberta de restaurantes parceiros, com mapa, coleções, favoritos, perfil e cadastro de restaurantes.

## Setup local

1. Instale as dependências:

```bash
npm install
```

2. Copie as variáveis de ambiente:

```bash
copy .env.example .env
```

3. Preencha as chaves no `.env`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=
EXPO_PUBLIC_ADMIN_EMAIL=
```

4. Rode o app:

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

O app usa Firebase/Firestore em `firebaseConfig.js`.

Coleções usadas hoje:

- `restaurants`: restaurantes publicados ou cadastrados localmente.
- `userFavorites`: favoritos por usuário.
- `users`: perfil básico do usuário.
- `restaurantReviews`: avaliações/comentários sociais por restaurante.

Campos importantes de `restaurants`:

- `name`
- `type`
- `district`
- `price`
- `rating`
- `reviews`
- `open`
- `phone`
- `address`
- `latitude`
- `longitude`
- `image`
- `description`
- `ownerId`
- `ownerName`
- `ownerEmail`
- `status`: `pending`, `published`, `paused`, `archived` ou `rejected`
- `approval`
- `photos`
- `coverPhoto`
- `menuItems`
- `openingHours`
- `reservationUrl`
- `instagram`
- `whatsapp`
- `tags`
- `highlights`
- `claim`
- `metrics`

Fluxo atual:

- Novo restaurante é salvo como `pending`.
- Admin definido por `EXPO_PUBLIC_ADMIN_EMAIL` pode publicar ou rejeitar na tela de aprovações.
- Proprietário pode editar, pausar, reativar ou arquivar pelo painel do restaurante.
- Métricas de visualização, Maps, WhatsApp e reserva são incrementadas no Firestore.
- Reivindicação de restaurante grava `claim.status = pending` no documento do restaurante.

Avaliações sociais:

- Cada avaliação fica em `restaurantReviews`.
- Campos principais: `restaurantId`, `userId`, `userName`, `rating`, `comment`, `likes`, `likedBy`, `pinned`.
- Usuários podem comentar e curtir.
- Admin pode fixar/desfixar comentários.

## Gamificação

O perfil mantém `gamification` no usuário:

- `points`: pontuação total.
- `metrics`: contadores de favoritos, rotas abertas, avaliações, restaurantes conhecidos, curtidas dadas, convites e coleções.
- `awarded`: ids já pontuados para evitar farmar a mesma ação repetidamente.
- `achievements`: conquistas liberadas.

Ranks:

- Beliscador
- Caçador de Mesa
- Garfo Curioso
- Roteirista de Rolês
- Sommelier de Experiências
- Curador Dine
- Lenda da Reserva

Pontuação inicial:

- Salvar restaurante: `+5`
- Abrir rota no mapa: `+5`
- Avaliar/comentar restaurante: `+20`
- Marcar restaurante como conhecido: `+30`
- Curtir comentário: `+2`

Também existe uma pasta `supabase/migrations` com modelagem inicial para uma futura migração/expansão. Hoje a tela principal do app ainda usa Firebase.

## Qualidade

Rode o smoke check antes de entregar mudanças:

```bash
npm run smoke
```

Ele valida:

- parse JSX do `App.js`;
- resolução do `app.config.js`;
- dependências essenciais;
- ruídos comuns de codificação;
- telas registradas na navegação interna;
- dívida atual de camadas de estilo.

Para validar o bundle web:

```bash
npx expo export --platform web --output-dir .expo-export-smoke
```

Depois da validação, o diretório `.expo-export-smoke/` pode ser apagado. Ele já está no `.gitignore`.

## Checklist manual

Android:

- Abrir `Explorar`, `Coleções`, `Mapa`, `Favoritos`, `Perfil`.
- Pedir localização no mapa e testar permissão aceita/negada.
- Abrir filtros da busca e aplicar cidade, raio e filtros rápidos.
- Abrir detalhes de restaurante e botões de WhatsApp/Maps.

iPhone:

- Repetir fluxo do Android.
- Conferir se o rodapé não cobre conteúdo em telas com safe area.
- Conferir permissões de localização.

Web:

- Abrir `npm run web`.
- Confirmar fallback do mapa.
- Confirmar que localização mostra fallback elegante.

Telas pequenas:

- Conferir cards da home.
- Conferir lista do mapa.
- Conferir formulário de cadastro de restaurante.

## Dívida técnica conhecida

- `App.js` concentra dados, telas e estilos. O próximo passo estrutural é separar em `src/data`, `src/components`, `src/screens` e `src/styles`.
- Dados estáticos iniciais já foram movidos para `src/data/appData.js`.
- Há duas camadas históricas de `Object.assign(styles, ...)`. O smoke check permite no máximo duas e avisa sobre isso.
- `Backup/`, `BackLog/` e `macaco.html` parecem arquivos históricos. Não foram removidos automaticamente para evitar perda de referência.
- As imagens remotas do Unsplash já usam parâmetros de largura/qualidade, mas ainda precisam de política de cache/thumbnail para produção.
- O bundle web atual exportado ficou em torno de 1.92 MB de JS, com peso relevante em fontes/ícones. Vale reduzir famílias/pesos de fonte e imports de ícones antes de produção.
