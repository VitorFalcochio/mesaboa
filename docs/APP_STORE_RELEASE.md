# App Store Release Checklist

Este projeto ja gera bundle iOS com Expo, mas a publicacao na App Store depende de credenciais Apple, metadados publicos e uma ultima decisao de seguranca do backend.

## Validacao local

```bash
npm run smoke
npx expo-doctor
npx expo export --platform ios --output-dir .expo-export-ios-smoke
```

O diretorio `.expo-export-ios-smoke/` e temporario e esta ignorado pelo Git.

## Build EAS

1. Entrar na conta Expo:

```bash
npx eas login
```

2. Vincular/criar o projeto EAS:

```bash
npx eas init
```

3. Gerar build interno para TestFlight/manual QA:

```bash
npx eas build --platform ios --profile preview
```

4. Gerar build de producao:

```bash
npx eas build --platform ios --profile production
```

5. Submeter para App Store Connect:

```bash
npx eas submit --platform ios --profile production
```

## App Store Connect

Preencher antes de enviar para review:

- Nome, subtitulo, categoria e descricao.
- Screenshots dos tamanhos exigidos pelo App Store Connect.
- URL publica de suporte.
- URL publica de politica de privacidade.
- App Privacy: declarar localizacao, fotos, identificadores de usuario, conteudo gerado pelo usuario, dados de contato, diagnosticos e qualquer dado coletado por Supabase/Google Maps/Expo.
- Contato de review e credenciais de teste, se houver area logada.

## Backend e seguranca

Antes de usar dados reais, resolver uma destas opcoes:

- Migrar login/perfil para Supabase Auth e trocar as policies abertas para regras baseadas em `auth.uid()`.
- Manter o app como catalogo/social beta, mas publicar sabendo que as migrations atuais permitem sincronizacao ampla para `anon`.

Pendencias conhecidas no codigo atual:

- Contas locais/demo ainda existem em `App.js`.
- A flag `EXPO_PUBLIC_ENABLE_DEMO_DATA` deve ficar `false` em producao.
- Policies em `supabase/migrations/202607210001_app_supabase_facade.sql` permitem escrita ampla para `anon`.
- A tela interna de termos e privacidade e apenas um resumo; a App Store exige uma politica publica por URL.

## Requisito Apple vigente

Desde 28 de abril de 2026, uploads para App Store Connect precisam ser feitos com Xcode 26/iOS SDK 26 ou superior. Em Expo/EAS, use builders atualizados e confira o log do build antes de submeter.
