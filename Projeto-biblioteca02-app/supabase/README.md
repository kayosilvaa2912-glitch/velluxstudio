# Supabase: aplicar as proteções e publicar o webhook

1. No Supabase SQL Editor, revise e execute `migrations/202611150001_security_calendar_progress.sql`. A migration pressupõe as tabelas existentes do app (`profiles`, `user_access`, `subjects`, `materials`, `material_files`, `favorites`, `teacher_notes`, `access_logs`, `products` e `feedbacks`) e as colunas que o frontend já consulta.
2. Confirme em **Storage → Buckets** que `materials-vault` aparece como **Private**. A migration marca o bucket como privado e instala regras que autorizam leitura só quando há `user_access.status = 'ativo'` ou quando o usuário consta na tabela restrita `app_admins`.
3. Confirme que sua conta administrativa existente foi inserida em `app_admins` pela migration. Para cadastrar outro administrador, insira manualmente o UUID do usuário no SQL Editor como proprietário do projeto. Não use `user_metadata.role` como fonte de autorização.
4. Publique a função: `supabase functions deploy zuptos-webhook --no-verify-jwt`.
5. Configure secrets no projeto Supabase: `supabase secrets set ZUPTOS_WEBHOOK_SECRET="SEGREDO_FORNECIDO_PELA_ZUPTOS" ZUPTOS_SIGNATURE_HEADER="x-zuptos-signature"`. A Zuptos deve assinar o corpo bruto com HMAC-SHA256 e enviar o resultado nesse cabeçalho. Não envie segredos no endereço URL.
6. Cadastre no painel da Zuptos a URL `https://SEU-PROJETO.supabase.co/functions/v1/zuptos-webhook` e faça um pagamento de teste aprovado e outro reembolsado antes de liberar vendas.

O endpoint de arquivos depende dessas políticas no servidor. Antes de executar a migration, confira se os nomes e tipos de colunas no seu banco correspondem às consultas atuais do app. Não cole aqui chaves `service_role` ou segredos de webhook.
