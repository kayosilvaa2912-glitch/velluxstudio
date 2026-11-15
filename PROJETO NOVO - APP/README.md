# Biblioteca do Professor — MVP inicial

Aplicativo web responsivo com Next.js + Supabase. Inclui login, área protegida, dashboard, pesquisa/listagem de materiais, detalhe do recurso e links de download temporários para arquivos privados.

## O que já está incluído
- Login por e-mail e senha.
- Sessões via cookies e rotas protegidas.
- Dashboard para 6º, 7º, 8º e 9º anos.
- Pesquisa e filtros básicos de materiais.
- Estrutura PostgreSQL para perfis, permissões, materiais, arquivos, favoritos, logs e direitos de acesso.
- Bucket privado `materiais` e políticas RLS iniciais.
- Geração de URL assinada com validade de 60 segundos para download.

## O que ainda precisa ser conectado/configurado
1. Criar um projeto no Supabase.
2. Executar `supabase/schema.sql` no SQL Editor.
3. Copiar `.env.example` para `.env.local` e preencher URL e chave pública/anon do Supabase.
4. Configurar a URL do app nas configurações de Authentication do Supabase.
5. Criar o primeiro usuário pelo Supabase Auth e promovê-lo a administrador usando o SQL comentado no final de `schema.sql`.
6. Cadastrar materiais e arquivos no banco/bucket. A interface administrativa de cadastro ainda será construída na próxima etapa.
7. Integrar checkout via webhook seguro para criar/revogar `entitlements`. Não liberar acesso apenas com base em uma tela de sucesso do checkout.

## Rodar localmente
Requer Node.js 20+.

```bash
npm install
cp .env.example .env.local
# preencher as variáveis
npm run dev
```

Acesse http://localhost:3000.

## Modelo de acesso
O perfil recém-criado fica `pending`. Para liberar acesso, o backend deve criar uma linha ativa em `entitlements` após confirmação do pagamento ou um administrador pode conceder acesso manualmente. A tabela `profiles` também tem `access_status` para suspensões administrativas.

## Segurança — revisão necessária antes de produção
- Mantenha o bucket privado.
- Nunca exponha a `service_role` key no navegador.
- Faça a concessão/revogação de acesso por webhook validado no servidor.
- Revise as políticas RLS e fluxos de cadastro antes de produção.
- Configure confirmação de e-mail, recuperação de senha, limites de sessão e monitoramento.
- A política atual de leitura de arquivos permite membros ativos lerem objetos do bucket; em produção, associe os caminhos dos objetos aos recursos autorizados e registre downloads.
- Não há proteção absoluta contra compartilhamento de credenciais ou redistribuição de arquivos. Watermark individual pode reduzir redistribuição casual.

## Próximas entregas recomendadas
1. Painel administrativo completo (criar/editar anos, bimestres, tópicos, materiais e arquivos).
2. Fluxo de cadastro, confirmação de e-mail e recuperação de senha.
3. Integração de checkout/webhook e gestão de assinaturas/acessos.
4. Favoritos funcionais, histórico e busca avançada.
