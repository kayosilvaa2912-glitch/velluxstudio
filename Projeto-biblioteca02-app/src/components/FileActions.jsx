import { useState } from 'react';
import { Eye, Lock, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import FileViewerModal from '@/components/FileViewerModal';

export default function FileActions({ material, hasAccess }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);

  const open = async () => {
    setError('');
    setBusy(true);

    try {
      // 1. Obter caminho do arquivo privado
      const { data: fileRecord, error: fileError } = await supabase
        .from('material_files')
        .select('file_uri, file_name')
        .eq('material_id', material.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fileError || !fileRecord?.file_uri) {
        throw new Error('Arquivo não encontrado ou sem permissão de acesso.');
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
    } catch (e) {
      console.error('Erro ao abrir material:', e);
      setError(e.message || 'Não foi possível abrir o arquivo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={open}
        disabled={busy}
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
