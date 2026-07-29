# Relatorio de Revisao Cirurgica - Dine

Data: 29/07/2026

## 1. Resumo executivo

O Dine e um aplicativo Expo/React Native com saida nativa e web. A interface, os dados, a navegacao interna e grande parte das regras ainda estao concentrados em `App.js`. O Supabase armazena restaurantes, avaliacoes e dados sociais, mas a autenticacao atual e local e usa identificadores textuais de compatibilidade.

- Problemas encontrados: **18**
- Problemas corrigidos: **10**
- Pendencias reais: **8**
- P0: 2 pendentes
- P1: 6 corrigidos
- P2/P3: 4 corrigidos e 6 pendentes

O principal erro de produto foi corrigido: uma foto publicada agora abre o detalhe da publicacao. Autor e restaurante possuem destinos separados, e o restaurante aparece como informacao secundaria. O feed passou a hidratar dados remotos e persistir dados locais. O mapa web deixou de prender cards nas bordas. Links ficticios de suporte e publicacao deixaram de ser tratados como contatos reais.

O sistema inicia, gera build web e passou no fluxo E2E social em oito larguras. Ele ainda nao deve ser considerado seguro para producao com dados reais enquanto usar senha local e policies anonimas permissivas no Supabase.

## 2. Mapa do sistema

| Modulo | Pagina/rota | Finalidade | Status anterior | Status atual | Observacoes |
|---|---|---|---|---|---|
| Onboarding | Modal inicial | Apresentar o produto | Funcional | Funcional | Validado em mobile e desktop |
| Autenticacao | Login/cadastro modal | Criar sessao local | Parcial/inseguro | Parcial/inseguro | Validacao melhorada; depende de Supabase Auth |
| Explorar | Aba `Explorar` | Descoberta e curadoria | Funcional | Funcional | Dados locais/remotos de restaurantes |
| Feed | Aba `Feed` | Publicacoes sociais | Parcial | Funcional com ressalvas | Persistencia e detalhe corrigidos |
| Criar publicacao | `FeedComposerModal` | Fotos, legenda e restaurante | Parcial | Melhorado | Exige login e aceita ate 4 fotos |
| Detalhe da publicacao | `FeedPostDetailModal` | Midia, autor, legenda, data e interacoes | Ausente | Adicionado | Comentario, curtir, salvar, compartilhar e excluir proprio post |
| Perfil social | `feedProfile` | Perfil de outro autor e grid | Fluxo incorreto | Corrigido | Grid abre post, nao restaurante |
| Busca/resultados | `results` | Nome, cozinha, bairro, ordenacao | Funcional | Funcional | Busca normaliza acentos e caixa |
| Filtros | Drawer em mapa/resultados | Area, raio e filtro rapido | Parcial | Parcial | Permite um filtro rapido por vez |
| Mapa | Aba `Mapa` | Descoberta geografica | Web inconsistente | Corrigido | Cards seguem a coordenada durante o arraste |
| Favoritos | Aba `Favoritos` | Restaurantes salvos | Funcional | Funcional | Exige login e sincroniza quando possivel |
| Restaurante | `RestaurantModal` | Perfil, cardapio, contato e avaliacoes | Funcional | Melhorado | Posts internos ganharam acao de curtir |
| Avaliacoes | Dentro do restaurante | Criar, curtir e moderar | Funcional com fallback | Funcional com ressalvas | Autorizacao remota ainda depende do P0 |
| Perfil proprio | Aba `Perfil` | Dados, preferencias e gamificacao | Funcional | Funcional | Edicao inline e persistencia local/remota |
| Configuracoes | `settings` e subtelas | Conta, privacidade e suporte | Parcial | Melhorado | Contatos falsos removidos |
| Notificacoes | `notifications` | Preferencias push | Parcial | Parcial | Nao existe inbox de eventos |
| Restaurantes do usuario | `restaurantPanel`/`restaurantRegister` | Cadastro e gestao | Funcional com ressalvas | Funcional com ressalvas | Seguranca remota depende de Auth/RLS |
| Administracao | `adminApprovals` | Aprovar e revisar restaurantes | Parcial/inseguro | Parcial/inseguro | Papel admin e validado no cliente local |
| Moderacao | Denuncia/bloqueio/remocao | Controles de conteudo | Funcional com ressalvas | Funcional com ressalvas | Persistencia remota usa facade permissiva |
| Convites/Dine+ | `invites`/`dinePlus` | Convites e beneficios | Parcial | Melhorado | URL publica agora e configuravel |
| Backend | `supabaseConfig.js` | Persistencia e storage | Parcial/inseguro | Melhorado, ainda inseguro | Feed agora e lido; Auth/RLS continuam pendentes |

## 3. Problemas encontrados

### REV-001 - P0 - Autenticacao

- Modulo: login, cadastro e seguranca.
- Reproducao: criar uma conta e inspecionar o AsyncStorage web/nativo.
- Anterior: senha armazenada em texto simples e comparada no cliente.
- Esperado: Supabase Auth, senha fora do cliente, sessao assinada e recuperacao por e-mail.
- Causa: autenticacao local/demo evoluiu para fluxo principal.
- Correcao: nao e seguro mascarar localmente. Foram adicionadas validacao de e-mail e trava de envio duplicado.
- Teste: cadastro E2E nas oito larguras.
- Status: **pendente**. Migrar para Supabase Auth e remover senhas locais.

### REV-002 - P0 - Autorizacao/RLS

- Modulo: banco, storage, admin e conteudo social.
- Reproducao: usar a chave anon e executar update/delete nas tabelas da facade.
- Anterior: policies `to anon, authenticated` com `using (true)`/`with check (true)` permitem alterar dados de terceiros.
- Esperado: policies por `auth.uid()`, ownership e papel admin verificado no banco.
- Causa: camada de compatibilidade para IDs locais.
- Correcao: documentada como bloqueio arquitetural; endurecer agora quebraria o cliente sem Auth.
- Teste: revisao completa das migrations e funcoes de acesso.
- Status: **pendente critico**.

### REV-003 - P1 - Grid do perfil abria restaurante

- Reproducao: Feed > autor > tocar em uma foto.
- Anterior: `setSelectedRestaurant(post.restaurant)`.
- Esperado: abrir a publicacao.
- Correcao: grid chama `openFeedPost(post)`.
- Arquivo: `App.js`.
- Teste: E2E abre o post pelo perfil e volta mantendo o perfil.
- Status: **corrigido**.

### REV-004 - P1 - Foto do feed abria perfil

- Reproducao: tocar na imagem de um post do feed.
- Anterior: `openFeedProfile(post)`.
- Esperado: detalhe da publicacao.
- Correcao: imagem e titulo/legenda abrem `FeedPostDetailModal`.
- Teste: E2E mobile/tablet/desktop.
- Status: **corrigido**.

### REV-005 - P1 - Detalhe social incompleto

- Anterior: o unico viewer exibia produto/restaurante e ignorava a prop de curtir.
- Esperado: midia, autor, data, legenda, curtidas, comentarios, comentario novo, salvar, compartilhar, denunciar, excluir post proprio e restaurante secundario.
- Correcao: criado `FeedPostDetailModal`; viewer de restaurante tambem passou a usar curtir/denunciar.
- Teste: comentario, perfil, retorno, contadores e ausencia de `pageerror`.
- Status: **corrigido**.

### REV-006 - P1 - Feed remoto era somente escrito

- Reproducao: publicar/reagir, recarregar em outro contexto.
- Anterior: posts, comentarios e reacoes eram gravados, mas nunca lidos; dados locais do feed nao eram persistidos.
- Correcao: `fetchFeedDataFromDb`, hidratacao de posts/comentarios/reacoes e AsyncStorage dedicado.
- Teste: smoke, build e E2E.
- Status: **corrigido**.

### REV-007 - P1 - Cards do mapa se soltavam da coordenada

- Causa: posicao projetada era limitada artificialmente nas bordas do mapa.
- Correcao: card usa exatamente `left/top` da coordenada projetada e some apenas fora da area visivel.
- Teste: assercao no smoke e inspecao da build web.
- Status: **corrigido**.

### REV-008 - P1 - Links e contatos ficticios

- Anterior: WhatsApp `5517999999999`, e-mail presumido e URLs fixas eram abertos como reais.
- Correcao: `EXPO_PUBLIC_APP_URL`, `EXPO_PUBLIC_SUPPORT_EMAIL`, `EXPO_PUBLIC_SUPPORT_WHATSAPP` e politica configuravel; na web a origem publicada e usada automaticamente.
- Teste: parse, smoke e build.
- Status: **corrigido**. As variaveis reais ainda precisam ser preenchidas na Vercel/EAS.

### REV-009 - P2 - Composer aceitava identidade visitante

- Anterior: helper podia receber um objeto visitante com ID e passar pela verificacao superficial.
- Correcao: abertura do composer exige usuario e retoma a acao depois do login.
- Status: **corrigido**.

### REV-010 - P2 - Login sem validacao/trava

- Anterior: qualquer formato de e-mail era aceito e varios cliques podiam disparar o fluxo.
- Correcao: validacao de e-mail, estado `authSubmitting` e botoes desabilitados.
- Status: **corrigido**.

### REV-011 - P2 - Comentario podia duplicar apos hidratacao

- Causa: o mesmo ID podia existir no post remoto e na reacao local.
- Correcao: `commentsForPost` consolida comentarios por ID.
- Status: **corrigido**.

### REV-012 - P2 - Publicacoes sem data

- Correcao: novos posts recebem `createdAt`; registros remotos usam `created_at`; o detalhe formata a data.
- Status: **corrigido**.

### REV-013 - P2 - Notificacoes sem inbox

- A rota atual controla permissoes e categorias, mas nao lista curtidas, comentarios ou seguidores.
- Falta: leitura de `notification_queue`, estado lido/nao lido e links para conteudo.
- Status: **pendente**.

### REV-014 - P2 - Recuperacao e expiracao de sessao ausentes

- Falta: "esqueci minha senha", confirmacao de e-mail, token expirado e protecao remota de rotas.
- Dependencia: Supabase Auth.
- Status: **pendente**.

### REV-015 - P2 - Feed sem paginacao

- O cliente agrega posts em memoria; a leitura remota esta limitada a 100 itens.
- Recomendacao: cursor por `created_at` e lista virtualizada.
- Status: **pendente**.

### REV-016 - P2 - Upload sem validacao completa

- Ha limite de quantidade, permissao e compressao, mas nao ha limite cliente de bytes/MIME, progresso ou retry explicito.
- Recomendacao: validar metadados e alinhar com limite do bucket.
- Status: **pendente**.

### REV-017 - P2 - Dependencias vulneraveis

- `npm audit`: 28 alertas, sendo 19 altos e 9 moderados; nenhum critico. Os alertas estao principalmente na arvore Expo/React Native e as correcoes propostas envolvem atualizacoes de stack.
- Recomendacao: atualizar Expo SDK/React Native em branch dedicada e repetir testes nativos.
- Status: **pendente**.

### REV-018 - P3 - Divida estrutural e codigo morto

- `App.js` permanece monolitico, com duas camadas `Object.assign(styles, ...)`, funcoes historicas de perfil e componente modal duplicado sem uso ativo.
- Nao foi feita refatoracao ampla para evitar regressao fora do escopo funcional.
- Status: **pendente planejado**.

## 4. Correcoes realizadas

### Funcionalidades e navegacao

- Detalhe social completo para posts.
- Clique em foto/titulo abre post; autor e restaurante possuem acoes separadas.
- Grid de perfil abre post e preserva contexto ao fechar.
- Exclusao de post proprio com confirmacao e tentativa remota.
- Composer protegido por login.

### UX, interface, responsividade e acessibilidade

- Estado vazio de comentarios e composer dentro do detalhe.
- Labels acessiveis em imagens, botoes e campos do fluxo revisado.
- Botoes desabilitados durante autenticacao e comentario vazio.
- Restaurante aparece como bloco secundario "Publicado em".
- Cards do mapa acompanham sua coordenada sem prender nas bordas.

### Backend, seguranca e qualidade

- Leitura remota de posts, comentarios e reacoes.
- Persistencia local do feed e reacoes.
- Remocao logica remota de post proprio.
- Contatos e URLs externas passaram a depender de configuracao real.
- Smoke ganhou verificacoes de regressao do detalhe e mapa.
- E2E Playwright adicionado.

## 5. Paginas incompletas

| Pagina | O que falta | Concluido nesta revisao | Dependencia |
|---|---|---|---|
| Autenticacao | Auth real, recuperar senha, expirar sessao | Validacao e trava de envio | Supabase Auth |
| Notificacoes | Inbox, nao lidas, destino do evento | Preferencias push ja existem | API/queries e regra de leitura |
| Feed | Paginacao e edicao de post | Detalhe, persistencia e exclusao | Cursor e contrato de edicao |
| Upload | Bytes, MIME, progresso, retry | Quantidade e fallback existentes | Regra de produto/storage |
| Admin/moderacao | Autorizacao confiavel | Controles de UI existentes | Auth/RLS |
| Dine+ | Cobranca/beneficios reais | Estado visual existente | Regras comerciais e integracao |

## 6. Arquivos modificados

| Caminho | Motivo |
|---|---|
| `App.js` | Fluxo de post, mapa, persistencia, autenticacao, acessibilidade e configuracoes externas |
| `supabaseConfig.js` | Leitura do feed, remocao de post e URL publica configuravel |
| `scripts/smoke-check.js` | Regressao estatica de post e mapa |
| `tests/social-post-detail.spec.js` | E2E do fluxo social critico |
| `playwright.config.js` | Oito viewports e servidor da build |
| `package.json`/`package-lock.json` | Script e dependencia Playwright |
| `.env.example`/`README.md` | Variaveis externas documentadas |
| `.gitignore` | Saidas de teste ignoradas |
| `RELATORIO_REVISAO_CIRURGICA.md` | Relatorio obrigatorio |
| `CHANGELOG_REVISAO.md` | Changelog obrigatorio |

## 7. Testes executados

| Comando/verificacao | Resultado |
|---|---|
| `npm run smoke` | Passou |
| `npm run build` | Passou; bundle web gerado em `dist` |
| `npm run test:e2e` | 8/8 passaram |
| Viewports E2E | 320, 375, 390, 430, 768, 1024, 1280 e 1440 px |
| Console E2E | Nenhum `pageerror` |
| Inspecao visual | Onboarding em 320, 390 e 1440 px sem sobreposicao |
| `git diff --check` | Passou |
| `npm audit` | 28 alertas: 19 altos, 9 moderados, 0 criticos |
| Lint | Nao existe script/configuracao de lint no projeto |
| Typecheck | Nao aplicavel: projeto JavaScript sem TypeScript/checker configurado |

Limitacao: nao foi executado simulador Android/iOS neste ambiente. O bundle Expo e a configuracao foram validados pelo smoke/build, mas permissoes, teclado e mapas nativos ainda exigem teste em aparelho/simulador antes da loja.

## 8. Pendencias

| Prioridade | Motivo | Risco | Recomendacao |
|---|---|---|---|
| P0 | Senhas e sessao locais | Roubo de conta e ausencia de sessao confiavel | Migrar para Supabase Auth |
| P0 | RLS anonima permissiva | Alteracao de dados de terceiros | Policies por `auth.uid()` apos Auth |
| P2 | Sem inbox de notificacoes | Usuario nao encontra eventos | Implementar leitura/status/destino |
| P2 | Sem recuperacao de senha | Conta pode ficar inacessivel | Fluxo de reset do Supabase |
| P2 | Sem paginacao do feed | Memoria e tempo de carga crescem | Cursor e lista virtualizada |
| P2 | Upload parcial | Arquivos invalidos/pesados e pouco feedback | MIME, bytes, progresso e retry |
| P2 | Dependencias vulneraveis | Risco de cadeia e manutencao | Upgrade controlado do Expo SDK |
| P3 | Monolito/duplicacao | Alto custo de manutencao | Extrair telas, hooks e tokens em etapas |

## 9. Sugestoes futuras

- Separar `App.js` por dominio somente depois de estabilizar Auth e testes.
- Adicionar carrossel com indicador de pagina sincronizado no detalhe.
- Adicionar edicao de post e exclusao de comentario proprio.
- Adotar lista virtualizada e cache de imagens.
- Criar testes nativos de permissao, teclado, mapa e deep links.

Esses itens sao evolucoes opcionais; nao substituem as pendencias P0.

## 10. Checklist final

| Verificacao | Resultado |
|---|---|
| Projeto inicia? | Sim, build web servida e navegada |
| Build funciona? | Sim |
| Lint passa? | Nao existe lint configurado |
| Typecheck passa? | Nao existe typecheck configurado |
| Login funciona? | Sim localmente; inseguro para producao |
| Feed funciona? | Sim, com persistencia; sem paginacao |
| Publicacoes abrem corretamente? | Sim |
| Comentarios funcionam? | Sim no fluxo testado |
| Curtidas funcionam? | Sim no fluxo e viewer |
| Perfil funciona? | Sim |
| Restaurantes abrem corretamente? | Sim como acao secundaria |
| Busca funciona? | Sim |
| Filtros funcionam? | Sim, um filtro rapido por vez |
| Mobile esta funcional? | Sim no E2E web responsivo |
| Existem erros no console? | Nenhum `pageerror` no E2E |
| Existem paginas incompletas? | Sim, listadas na secao 5 |
| Existem falhas criticas pendentes? | Sim: Auth local e RLS anonima |
