import { useCallback, useEffect, useRef, useState } from 'react';
import { Eye, Lock, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import FileViewerModal from '@/components/FileViewerModal';

export default function FileActions({ material, hasAccess, autoOpen = false }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const autoStarted = useRef(false);

  const open = useCallback(async () => {
    setError('');
    if (!hasAccess) {
      setError('O acesso aos arquivos exige pagamento confirmado.');
      return;
    }
    setBusy(true);

    try {
      // 1. Obter caminho do arquivo privado
      const { data: fileRecord, error: fileError } = await supabase
        .from('material_files')
        .select('file_uri, file_name, material_id')
        .eq('material_id', material.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fileError || !fileRecord?.file_uri) {
        throw new Error('Arquivo não encontrado ou sem permissão de acesso.');
      }

      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !currentUser) throw new Error('Entre novamente para confirmar sua autorização.');

      const [{ data: accessRow, error: accessError }, { data: profile }] = await Promise.all([
        supabase
        .from('user_access')
        .select('status')
        .eq('user_id', currentUser.id)
        .eq('status', 'ativo')
        .limit(1)
        .maybeSingle(),
        supabase.from('profiles').select('role').eq('id', currentUser.id).maybeSingle()
      ]);
      if ((accessError && accessError.code !== 'PGRST116') || (!accessRow && profile?.role !== 'admin')) {
        throw new Error('Não foi possível confirmar seu pagamento. O arquivo foi bloqueado.');
      }

      // 2. Gerar URL assinada privada temporária (válida por 5 minutos = 300 segundos)
      const { data: signedData, error: signedError } = await supabase.storage
        .from('materials-vault')
        .createSignedUrl(fileRecord.file_uri, 300);

      if (signedError || !signedData?.signedUrl) {
        throw new Error(signedError?.message || 'Erro ao gerar link de visualização.');
      }

      setFile({
        url: signedData.signedUrl,
        name: fileRecord.file_name || material.file_name || material.title || 'material',
        mimeType: material.mime_type
      });
      await supabase.from('access_logs').insert({
        user_id: currentUser.id,
        user_email: currentUser.email,
        action: 'view',
        resource_id: material.id,
        resource_title: material.title || fileRecord.file_name || 'Material',
        metadata: { subject_id: material.subject_id || null, material_id: material.id }
      });
      if (material.subject_id) {
        await supabase.from('user_progress').upsert({
          user_id: currentUser.id,
          material_id: material.id,
          subject_id: material.subject_id,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      }
    } catch (e) {
      console.error('Erro ao abrir material:', e);
      setError(e.message || 'Não foi possível abrir o arquivo.');
    } finally {
      setBusy(false);
    }
  }, [hasAccess, material]);

  useEffect(() => {
    if (autoOpen && hasAccess && !autoStarted.current) {
      autoStarted.current = true;
      open();
    }
  }, [autoOpen, hasAccess, open]);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={open}
        disabled={busy || !hasAccess}
        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50"
      >
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : hasAccess ? (
          <Eye className="h-3.5 w-3.5" />
        ) : (
          <Lock className="h-3.5 w-3.5" />
        )}
        Visualizar
      </button>
      {error && <p className="max-w-[220px] text-right text-[10px] leading-tight text-destructive">{error}</p>}
      <FileViewerModal file={file} onClose={() => setFile(null)} />
    </div>
  );
}
