import { useState, useEffect } from 'react';
import { Trash2, Upload, Loader2, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
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
    const res = await base44.entities.Material.filter({ subject_id: subjectId }, { sort: 'created_date', limit: 100 });
    setMaterials(res.items || []);
  };

  useEffect(() => {
    if (!subjectId) return;
    load().catch(() => {});
    const unsubscribe = base44.entities.Material.subscribe(() => {
      load().catch(() => {});
    });
    return unsubscribe;
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
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const created = await base44.entities.Material.create({
        subject_id: subjectId,
        title: title.trim() || file.name.replace(/\.[^.]+$/, ''),
        kind,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type
      });
      await base44.entities.MaterialFile.create({
        material_id: created.id,
        file_uri,
        file_name: file.name
      });
      setTitle('');
      setNotice('Arquivo enviado e já disponível para os professores com acesso.');
      await load();
    } catch (e) {
      setError('Falha ao enviar o arquivo. Tente novamente.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    await base44.entities.MaterialFile.deleteMany({ material_id: id });
    await base44.entities.Material.delete(id);
    await load();
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
        {busy ? 'Enviando... arquivos grandes podem levar alguns minutos' : `Selecionar arquivo (PDF, DOC, DOCX · até ${MAX_FILE_LABEL})`}
        <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={upload} disabled={busy} />
      </label>
      <p className="mt-1.5 text-[10px] text-muted-foreground">
        Enviado para armazenamento privado (stored privately). O acesso passa sempre pela autorização do servidor.
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