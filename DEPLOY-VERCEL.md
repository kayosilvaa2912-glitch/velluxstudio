# Publicar esta cópia na Vercel

Esta pasta contém uma cópia limpa do app para ser usada como raiz do projeto na Vercel.

1. Envie o conteúdo desta pasta para a raiz de um repositório GitHub novo, ou configure **Root Directory** do projeto Vercel como `vercel-ready` neste repositório.
2. Use `npm ci --include=optional` para instalar dependências e `npm run build` para compilar.
3. Defina **Output Directory** como `dist` (também está configurado em `vercel.json`).
4. Cadastre `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas variáveis de ambiente da Vercel para Preview e Production.
5. Faça o deploy novamente depois de enviar os arquivos.

O lockfile foi preservado para manter as mesmas versões do app atual. A instalação está configurada com `npm ci --include=optional`, que usa o lockfile e solicita a instalação das dependências opcionais da plataforma de build.
