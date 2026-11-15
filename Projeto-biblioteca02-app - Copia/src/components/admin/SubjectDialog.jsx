import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Modal from '@/components/Modal';
import MaterialUploader from '@/components/admin/MaterialUploader';
import { YEARS, BIMESTERS, CATEGORIES } from '@/lib/constants';

const emptyForm = {
  title: '',
  description: '',
  objectives: '',
  school_year: '6',
  bimester: 1,
  categories: [],
  bncc: '',
  published: false
};

export default function SubjectDialog({ open, onClose, subject, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [savedId, setSavedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    if (subject) {
      setForm({
        title: subject.title || '',
        description: subject.description || '',
        objectives: subject.objectives || '',
        school_year: String(subject.school_year || '6'),
        bimester: Number(subject.bimester || 1),
        categories: subject.categories || [],
        bncc: (subject.bncc_codes || []).join(', '),
        published: !!subject.published
      });
      setSavedId(subject.id);
    } else {
      setForm(emptyForm);
      setSavedId(null);
    }
  }, [open, subject]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleCategory = (name) =>
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(name) ? f.categories.filter((c) => c !== name) : [...f.categories, name]
    }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Informe o título do conteúdo.');
      return;
    }
    setSaving(true);
    setError('');
    const bnccCodes = form.bncc
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      objectives: form.objectives.trim(),
      school_year: form.school_year,
      bimester: Number(form.bimester),
      categories: form.categories,
      bncc_codes: bnccCodes,
      published: form.published,
      search_text: [form.title, form.description, form.categories.join(' '), bnccCodes.join(' ')].join(' ').toLowerCase()
    };
    try {
      if (savedId) {
        await base44.entities.Subject.update(savedId, payload);
      } else {
        const created = await base44.entities.Subject.create(payload);
        setSavedId(created.id);
      }
      await onSaved?.();
      if (subject || savedId) {
        onClose();
      }
    } catch (err) {
      setError('Não foi possível salvar. Verifique os campos e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title={savedId ? 'Editar conteúdo' : 'Novo conteúdo'}
      subtitle="Ano escolar → bimestre → conteúdo → materiais"
    >
      <form onSubmit={save} className="space-y-3">
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Título</label>
          <input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Ex.: Histórias em quadrinhos"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary/40"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Ano escolar</label>
            <select
              value={form.school_year}
              onChange={(e) => set('school_year', e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
            >
              {YEARS.map((y) => (
                <option key={y.value} value={y.value}>
                  {y.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Bimestre</label>
            <select
              value={form.bimester}
              onChange={(e) => set('bimester', e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
            >
              {BIMESTERS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Descrição</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary/40"
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Objetivos de aprendizagem</label>
          <textarea
            value={form.objectives}
            onChange={(e) => set('objectives', e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary/40"
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Categorias</label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => toggleCategory(c)}
                className={`rounded-full px-2.5 py-1 text-[11px] ${
                  form.categories.includes(c) ? 'bg-navy text-white' : 'border border-border'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">
            Códigos da BNCC (separe por vírgula)
          </label>
          <input
            value={form.bncc}
            onChange={(e) => set('bncc', e.target.value)}
            placeholder="Ex.: EF67LP07"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary/40"
          />
          <p className="mt-1 text-[10px] text-muted-foreground">
            Informe apenas códigos verificados no documento oficial da BNCC.
          </p>
        </div>

        <label className="flex items-center gap-2 text-xs font-medium">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => set('published', e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Publicar na biblioteca dos professores
        </label>

        {savedId ? (
          <MaterialUploader subjectId={savedId} />
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-secondary/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
            Para anexar os arquivos (PDF do aluno, versão editável, gabarito e orientações), clique em
            <span className="font-semibold text-foreground"> “Criar conteúdo”</span>. A janela continua aberta e a
            área de envio aparece aqui mesmo.
          </p>
        )}

        {error && <p className="text-[11px] font-medium text-destructive">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-xs font-medium">
            Fechar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {savedId ? 'Salvar alterações' : 'Criar conteúdo'}
          </button>
        </div>
      </form>
    </Modal>
  );
}