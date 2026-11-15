import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import SubjectCard from '@/components/SubjectCard';

export default function Favoritos() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function loadFavorites() {
      if (!user?.id) {
        if (alive) setLoading(false);
        return;
      }

      try {
        const { data: favs, error: favError } = await supabase
          .from('favorites')
          .select('subject_id')
          .eq('user_id', user.id);

        if (favError) throw favError;

        const ids = (favs || []).map((f) => f.subject_id).filter(Boolean);
        if (!ids.length) {
          if (alive) setSubjects([]);
          return;
        }

        const { data: found, error: subError } = await supabase
          .from('subjects')
          .select('*')
          .in('id', ids);

        if (subError) throw subError;
        if (alive) setSubjects(found || []);
      } catch (err) {
        console.warn('Erro ao carregar favoritos:', err);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadFavorites();

    return () => {
      alive = false;
    };
  }, [user?.id]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-bold">Favoritos</h1>
        <p className="mt-1 text-sm text-muted-foreground">Os conteúdos que você salvou para acessar depois.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : subjects.length === 0 ? (
        <div className="card-soft flex flex-col items-center gap-3 px-6 py-16 text-center">
          <Heart className="h-6 w-6 text-muted-foreground" />
          <p className="font-heading text-base font-semibold">Nenhum favorito ainda</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            Abra um conteúdo e toque em “Favoritar” para encontrá-lo rapidamente aqui.
          </p>
          <Link to="/biblioteca" className="rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white">
            Explorar biblioteca
          </Link>
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
