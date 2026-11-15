import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SubjectDialog from '@/components/admin/SubjectDialog';
import { yearLabel, bimesterLabel } from '@/lib/constants';

export default function AdminMateriais() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    const res = await base44.entities.Subject.filter({}, { sort: '-updated_date', limit: 200 });
    setSubjects(res.items || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load().catch(() => setLoading(false));
    const unsubscribe = base44.entities.Subject.subscribe(() => {
      load().catch(() => {});
    });
    return unsubscribe;
  }, [load]);

  const remove = async (subject) => {
    if (!window.confirm(`Excluir "${subject.title}" e todos os seus arquivos do acervo?`)) return;
    const mats = await base44.entities.Material.filter({ subject_id: subject.id }, { limit: 100 });
    const ids = (mats.items || []).map((m) => m.id);
    if (ids.length) await base44.entities.MaterialFile.deleteMany({ material_id: { $in: ids } });
    await base44.entities.Material.deleteMany({ subject_id: subject.id });
    await base44.entities.Subject.delete(subject.id);
    await load();
  };

  const filtered = subjects.filter((s) => {
    if (!term.trim()) return true;
    const t = term.toLowerCase();
    return (
      (s.title || '').toLowerCase().includes(t) ||
      (s.description || '').toLowerCase().includes(t) ||
      (s.categories || []).join(' ').toLowerCase().includes(t)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Buscar conteúdo por título, descrição ou categoria"
            className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-xs outline-none focus:border-primary/40"
          />
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-xs font-semibold text-white"
        >
          <Plus className="h-3.5 w-3.5" /> Novo conteúdo
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-soft px-6 py-16 text-center">
          <p className="font-heading text-base font-semibold">Nenhum conteúdo cadastrado</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Crie o primeiro conteúdo com descrição, habilidades da BNCC e arquivos.
          </p>
        </div>
      ) : (
        <div className="card-soft overflow-hidden">
          <ul className="divide-y divide-border/70">
            {filtered.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{s.title}</p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        s.published ? 'bg-emerald-50 text-emerald-700' : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {s.published ? 'Publicado' : 'Rascunho'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {yearLabel(s.school_year)} · {bimesterLabel(s.bimester)} ·{' '}
                    {(s.categories || []).join(', ') || 'sem categoria'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    to={`/conteudo/${s.id}`}
                    className="rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-medium"
                  >
                    Ver página
                  </Link>
                  <button
                    onClick={() => {
                      setEditing(s);
                      setDialogOpen(true);
                    }}
                    className="rounded-lg border border-border p-2 text-muted-foreground hover:text-primary"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => remove(s)}
                    className="rounded-lg border border-border p-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <SubjectDialog
        open={dialogOpen}
        subject={editing}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSaved={load}
      />
    </div>
  );
}