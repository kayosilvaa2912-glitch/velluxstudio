import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Sessão inválida. Faça login novamente.' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const materialId = typeof body.material_id === 'string' ? body.material_id : '';
    const mode = body.mode === 'download' ? 'download' : 'view';
    if (!materialId) return Response.json({ error: 'Material não informado.' }, { status: 400 });

    const material = await base44.asServiceRole.entities.Material
      .get(materialId)
      .catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!material) return Response.json({ error: 'Material não encontrado.' }, { status: 404 });

    // O arquivo fica em uma entidade restrita ao administrador; só esta função
    // (service role) consegue resolver o file_uri, depois de validar o acesso.
    const fileRes = await base44.asServiceRole.entities.MaterialFile.filter(
      { material_id: material.id },
      { sort: '-created_date', limit: 1 }
    );
    const storedFile = fileRes?.items?.[0];
    if (!storedFile?.file_uri) return Response.json({ error: 'Arquivo indisponível.' }, { status: 409 });

    if (user.role !== 'admin') {
      const accessRes = await base44.asServiceRole.entities.UserAccess.filter(
        { user_id: user.id },
        { sort: '-created_date', limit: 1 }
      );
      const access = accessRes?.items?.[0];
      if (!access || access.status !== 'ativo') {
        return Response.json(
          {
            error: 'Seu acesso aos materiais não está ativo.',
            code: 'no_access',
            status: access?.status || 'pendente'
          },
          { status: 403 }
        );
      }
    }

    const signed = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
      file_uri: storedFile.file_uri,
      expires_in: 300
    });

    await base44.asServiceRole.entities.AccessLog.create({
      user_id: user.id,
      user_email: user.email,
      action: mode,
      resource_id: material.id,
      resource_title: material.title || storedFile.file_name || 'Material',
      metadata: { subject_id: material.subject_id || null }
    });

    return Response.json({
      url: signed?.signed_url || signed?.url,
      file_name: storedFile.file_name || material.file_name || material.title || 'material',
      expires_in: 300
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}