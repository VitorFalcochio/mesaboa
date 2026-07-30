# Changelog da Revisao

## Reservas e experiência do restaurante

- Cadastro agora distingue conta de usuário e dono de restaurante.
- Dono recebe um workspace próprio com visão geral, reservas, disponibilidade e perfil.
- Restaurantes configuram agenda semanal, intervalo, capacidade e confirmação automática.
- Usuários fazem reservas nativas e acompanham confirmações em `Minhas reservas`.
- Horários sem capacidade oferecem entrada em lista de espera.
- Painel permite confirmar, registrar chegada, concluir ou cancelar reservas e avisar clientes em espera.
- Reservas e lista de espera persistem localmente e possuem tabelas de compatibilidade no Supabase.

## Corrigido

- Fotos do feed agora abrem o detalhe da publicacao.
- Fotos no grid de perfil agora abrem a publicacao, nao o restaurante.
- Restaurante relacionado passou a ser informacao secundaria e clicavel.
- Feed remoto agora e lido ao iniciar e possui fallback persistido localmente.
- Comentarios remotos/locais sao consolidados sem duplicacao por ID.
- Cards do mapa web permanecem presos a coordenada ao arrastar.
- Composer de publicacao exige usuario autenticado.
- Login valida formato de e-mail e impede envios repetidos.
- Links ficticios de WhatsApp, suporte, politica e convite deixaram de ser abertos como reais.
- Viewer de posts de restaurante passou a usar curtir e denunciar.

## Melhorado

- Detalhe de post responsivo com autor, data, legenda, contadores e comentarios.
- Estados vazios e feedback de botoes desabilitados.
- Labels acessiveis nos controles do fluxo social revisado.
- Compartilhamento inclui restaurante e URL publica quando configurados.
- Novos posts registram data de criacao.

## Adicionado

- `FeedPostDetailModal`.
- Hidratacao remota de posts, comentarios e reacoes.
- Persistencia local de posts e reacoes.
- Exclusao de post proprio com confirmacao.
- Variaveis de ambiente para URL publica e suporte.
- Teste E2E Playwright em oito larguras.
- Checks de regressao para post e mapa no smoke.

## Refatorado

- Composicao de comentarios centralizada em `commentsForPost`.
- Contatos e links externos centralizados em configuracoes de ambiente.
- Botao compartilhado passou a suportar estado desabilitado acessivel.

## Pendente

- Migrar login e sessao para Supabase Auth.
- Endurecer RLS e storage por usuario/papel.
- Implementar recuperacao de senha.
- Implementar inbox de notificacoes.
- Paginar e virtualizar o feed.
- Validar tamanho/MIME e mostrar progresso de upload.
- Atualizar dependencias Expo/React Native para tratar alertas do `npm audit`.
- Dividir o `App.js` monolitico em modulos menores.
