import { useState } from 'react';
import { Eye, Lock, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import FileViewerModal from '@/components/FileViewerModal';

export default function FileActions({ material, hasAccess }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);

  const open = async () => {
    setError('');
    setBusy(true);
    try {
      const res = await base44.functions.invoke('getMaterialFile', { material_id: material.id, mode: 'view' });
      const url = res.data?.url;
      if (!url) throw new Error('Não foi possível liberar o arquivo.');
      setFile({ url, name: res.data?.file_name || material.file_name || 'material', mimeType: material.mime_type });
    } catch (e) {
      setError(e?.response?.data?.error || 'Não foi possível abrir o arquivo.');
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