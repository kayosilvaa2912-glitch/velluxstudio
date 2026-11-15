import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import useAccess from '@/hooks/useAccess';
import { CATEGORIES } from '@/lib/constants';

export default function Assuntos() {
  const { isAdmin } = useAccess();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function loadSubjects() {
      try {
        let query = supabase.from('subjects').select('categories, published');
        if (!isAdmin) {
          query = query.eq('published', true);
        }
        const { data, error } = await query;
        if (error) throw error;
        if (alive) setSubjects(data || []);
      } catch (err) {
        console.warn('Erro ao carregar assuntos:', err);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadSubjects();

    return () => {
      alive = false;
    };
  }, [isAdmin]);

  const grouped = useMemo(() => {
    const map = {};
    subjects.forEach((s) => {
      (s.categories || []).forEach((c) => {
        map[c] = (map[c] || 0) + 1;
      });
    });
    return CATEGORIES.map((c) => ({ name: c, count: map[c] || 0 }));
  }, [subjects]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-bold">Por assunto</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Navegue pelo acervo a partir do tema que você vai trabalhar.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {grouped.map((c) => (
            <Link
              key={c.name}
              to={`/biblioteca?cat=${encodeURIComponent(c.name)}`}
              className="card-soft flex items-center gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Tag className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="text-[11px] text-muted-foreground">{c.count} conteúdo(s)</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
