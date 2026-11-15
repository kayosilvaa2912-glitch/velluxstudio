import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Loader2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import useAccess from '@/hooks/useAccess';
import SubjectCard from '@/components/SubjectCard';
import { YEARS, BIMESTERS, CATEGORIES, yearLabel } from '@/lib/constants';

export default function Biblioteca() {
  const { isAdmin } = useAccess();
  const [params, setParams] = useSearchParams();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState(params.get('q') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const ano = params.get('ano') || '';
  const bime = params.get('bime') || '';
  const cat = params.get('cat') || '';
  const q = params.get('q') || '';
  const bncc = params.get('bncc') || '';

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const query = isAdmin ? {} : { published: true };
    if (ano) query.school_year = ano;
    if (bime) query.bimester = Number(bime);
    if (cat) query.categories = cat;
    if (bncc) query.bncc_codes = bncc;
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { search_text: { $regex: q, $options: 'i' } }
      ];
    }
    base44.entities.Subject.filter(query, { sort: '-created_date', limit: 60 })
      .then((page) => {
        if (alive) setSubjects(page.items || []);
      })
      .catch(() => {
        if (alive) setSubjects([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [ano, bime, cat, q, bncc, refreshKey, isAdmin]);

  // Novos conteúdos e alterações feitas pelo admin aparecem sem recarregar a página.
  useEffect(() => {
    const unsubscribe = base44.entities.Subject.subscribe(() => {
      setRefreshKey((k) => k + 1);
    });
    return unsubscribe;
  }, []);

  const activeFilters = [ano, bime, cat].filter(Boolean).length;
  const heading = useMemo(() => {
    if (ano) return `Biblioteca · ${yearLabel(ano)}`;
    return 'Minha biblioteca';
  }, [ano]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">{heading}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? 'Buscando materiais...' : `${subjects.length} conteúdo(s) encontrado(s)`}
          </p>
          {bncc && (
            <button
              onClick={() => setParam('bncc', '')}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-accent-foreground"
            >
              Habilidade {bncc}
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filtros
          {activeFilters > 0 && (
            <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">{activeFilters}</span>
          )}
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setParam('q', term.trim());
        }}
        className="relative"
      >
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Pesquisar por assunto, conteúdo ou habilidade da BNCC..."
          className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-24 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
        />
        <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white">
          Buscar
        </button>
      </form>

      {showFilters && (
        <div className="card-soft space-y-4 p-5">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Ano escolar</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setParam('ano', '')}
                className={`rounded-lg px-3 py-1.5 text-xs ${!ano ? 'bg-navy text-white' : 'border border-border'}`}
              >
                Todos
              </button>
              {YEARS.map((y) => (
                <button
                  key={y.value}
                  onClick={() => setParam('ano', y.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs ${ano === y.value ? 'bg-navy text-white' : 'border border-border'}`}
                >
                  {y.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Bimestre</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setParam('bime', '')}
                className={`rounded-lg px-3 py-1.5 text-xs ${!bime ? 'bg-navy text-white' : 'border border-border'}`}
              >
                Todos
              </button>
              {BIMESTERS.map((b) => (
                <button
                  key={b.value}
                  onClick={() => setParam('bime', String(b.value))}
                  className={`rounded-lg px-3 py-1.5 text-xs ${bime === String(b.value) ? 'bg-navy text-white' : 'border border-border'}`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Assunto</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setParam('cat', '')}
                className={`rounded-lg px-3 py-1.5 text-xs ${!cat ? 'bg-navy text-white' : 'border border-border'}`}
              >
                Todos
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setParam('cat', c)}
                  className={`rounded-lg px-3 py-1.5 text-xs ${cat === c ? 'bg-navy text-white' : 'border border-border'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : subjects.length === 0 ? (
        <div className="card-soft flex flex-col items-center gap-2 px-6 py-16 text-center">
          <p className="font-heading text-base font-semibold">Nenhum conteúdo encontrado</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            Ajuste a busca ou os filtros. Novos materiais são publicados continuamente.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {subjects.map((s) => (
            <SubjectCard key={s.id} subject={s} />
          ))}
        </div>
      )}
    </div>
  );
}