import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, FileText, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import useAccess from '@/hooks/useAccess';
import { YEARS, BIMESTERS } from '@/lib/constants';

export default function Bimestres() {
  const { isAdmin } = useAccess();
  const [year, setYear] = useState('6');
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  const loadCounts = useCallback(async () => {
    try {
      const res = await Promise.all(
        BIMESTERS.map(async (b) => {
          let query = supabase
            .from('subjects')
            .select('*', { count: 'exact', head: true })
            .eq('school_year', year)
            .eq('bimester', String(b.value));

          if (!isAdmin) {
            query = query.eq('published', true);
          }

          const { count, error } = await query;
          if (error) throw error;
          return count || 0;
        })
      );

      const map = {};
      BIMESTERS.forEach((b, i) => {
        map[b.value] = res[i] || 0;
      });
      setCounts(map);
    } catch (err) {
      console.warn('Erro ao carregar contagens por bimestre:', err);
    } finally {
      setLoading(false);
    }
  }, [year, isAdmin]);

  useEffect(() => {
    setLoading(true);
    loadCounts();
  }, [loadCounts]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-bold">Por bimestre</h1>
        <p className="mt-1 text-sm text-muted-foreground">Escolha o ano e o bimestre que está preparando.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {YEARS.map((y) => (
          <button
            key={y.value}
            onClick={() => setYear(y.value)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              year === y.value ? 'bg-navy text-white' : 'border border-border bg-card'
            }`}
          >
            {y.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {BIMESTERS.map((b) => (
            <Link
              key={b.value}
              to={`/biblioteca?ano=${year}&bime=${b.value}`}
              className="card-soft group flex items-center justify-between p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div>
                <p className="font-heading text-lg font-bold group-hover:text-primary">{b.label}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" /> {counts[b.value] || 0} conteúdo(s)
                </p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
