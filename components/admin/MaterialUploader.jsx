import { useState, useEffect } from 'react';
import { Trash2, Upload, Loader2, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import {
  MATERIAL_KINDS,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  MAX_FILE_LABEL,
  formatBytes,
  kindMeta
} from '@/lib/constants';

export default function MaterialUploader({ subjectId }) {
  const [materials, setMaterials] = useState([]);
  const [kind, setKind] = useState('aluno_pdf');
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('materials')
        .select('*')
        .eq('subject_id', subjectId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setMaterials(data || []);
    } catch (err) {
      console.warn('Erro ao carregar materiais do conteúdo:', err);
    }
  };

  useEffect(() => {
    if (!subjectId) return;
    load();
  }, [subjectId]);

  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    setNotice('');
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError('Formato não permitido. Envie PDF, DOC ou DOCX.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(`Arquivo maior que ${MAX_FILE_LABEL}.`);
      return;
    }
    setBusy(true);

    try {
      // 1. Upload seguro para o bucket privado 'materials-vault'
      const fileExt = file.name.split('.').pop();
      const safeSubjectId = String(subjectId);
      const uniqueFileName = `${safeSubjectId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('materials-vault')
        .upload(uniqueFileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Erro no upload Storage:', uploadError);
        throw new Error(`Storage: ${uploadError.message}`);
      }

      // 2. Criar registro do material no PostgreSQL
      const { data: createdMaterial, error: materialError } = await supabase
        .from('materials')
        .insert({
          subject_id: safeSubjectId,
          title: title.trim() || file.name.replace(/\.[^.]+$/, ''),
          kind,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type
        })
        .select()
        .single();

      if (materialError) {
        console.error('Erro ao inserir material:', materialError);
        throw new Error(`Banco (materials): ${materialError.message}`);
      }

      // 3. Registrar o caminho privado na tabela protegida 'material_files'
      const { error: fileRecordError } = await supabase
        .from('material_files')
        .insert({
          material_id: createdMaterial.id,
          file_uri: uploadData.path,
          file_name: file.name
        });

      if (fileRecordError) {
        console.error('Erro ao inserir material_files:', fileRecordError);
        throw new Error(`Banco (material_files): ${fileRecordError.message}`);
      }

      setTitle('');
      setNotice('Arquivo enviado com sucesso!');
      await load();
    } catch (e) {
      console.error('Falha no upload:', e);
      setError(`Falha ao enviar arquivo: ${e.message || 'Erro desconhecido'}`);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    try {
      const { data: files } = await supabase
        .from('material_files')
        .select('file_uri')
        .eq('material_id', id);

      if (files?.length) {
        const paths = files.map((f) => f.file_uri);
        await supabase.storage.from('materials-vault').remove(paths);
      }

      await supabase.from('materials').delete().eq('id', id);
      await load();
    } catch (err) {
      alert(`Erro ao excluir arquivo: ${err.message}`);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-4">
      <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold">
        <FileText className="h-3.5 w-3.5 text-primary" /> Arquivos deste conteúdo
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título do arquivo (opcional)"
          className="h-10 rounded-lg border border-border bg-card px-3 text-xs outline-none focus:border-primary/40"
        />
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="h-10 rounded-lg border border-border bg-card px-3 text-xs outline-none"
        >
          {MATERIAL_KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
      </div>

      <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card px-3 py-3 text-xs font-medium text-muted-foreground hover:border-primary/50 hover:text-primary">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {busy ? 'Enviando arquivo...' : `Selecionar arquivo (PDF, DOC, DOCX · até ${MAX_FILE_LABEL})`}
        <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={upload} disabled={busy} />
      </label>
      <p className="mt-1.5 text-[10px] text-muted-foreground">
        Armazenamento privado no Supabase (`materials-vault`). O acesso requer autorização e gera URLs assinadas temporárias.
      </p>
      {notice && <p className="mt-1 text-[11px] font-medium text-emerald-600">{notice}</p>}
      {error && <p className="mt-1 text-[11px] font-medium text-destructive">{error}</p>}

      {materials.length > 0 && (
        <ul className="mt-3 divide-y divide-border">
          {materials.map((m) => (
            <li key={m.id} className="flex items-center gap-2 py-2">
              <span className="rounded bg-card px-1.5 py-0.5 text-[9px] font-bold uppercase text-foreground/60">
                {kindMeta(m.kind).badge}
              </span>
              <span className="min-w-0 flex-1 truncate text-[11px]">{m.title}</span>
              {m.file_size ? (
                <span className="shrink-0 text-[10px] text-muted-foreground">{formatBytes(m.file_size)}</span>
              ) : null}
              <button onClick={() => remove(m.id)} className="rounded p-1 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
