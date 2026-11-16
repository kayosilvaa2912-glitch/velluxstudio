import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Loader2, Heart, ArrowLeft, Target, GraduationCap, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import useAccess from '@/hooks/useAccess';
import FileActions from '@/components/FileActions';
import AccessNotice from '@/components/AccessNotice';
import { yearLabel, bimesterLabel, kindMeta } from '@/lib/constants';

export default function Conteudo() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const resumeMaterialId = searchParams.get('material');
  const { user } = useAuth();
  const { hasAccess, access, loading: accessLoading, isAdmin } = useAccess();
  const [subject, setSubject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    async function loadSubjectData() {
      try {
        // 1. Buscar conteúdo no Supabase
        const { data: found, error: subjectError } = await supabase
          .from('subjects')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (subjectError || !found) {
          if (alive) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        }

        // Rascunhos só podem ser abertos por administrador
        if (!found.published && !isAdmin) {
          if (alive) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        }

        if (!alive) return;
        setNotFound(false);
        setSubject(found);

        // 2. Buscar materiais vinculados
        const { data: mats } = await supabase
          .from('materials')
          .select('*')
          .eq('subject_id', id)
          .order('created_at', { ascending: true });

        // 3. Verificar se o professor favoritou
        let favId = null;
        if (user?.id) {
          const { data: favData } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('subject_id', id)
            .maybeSingle();

          favId = favData?.id || null;
        }

        if (alive) {
          setMaterials(mats || []);
          setFavoriteId(favId);
        }
      } catch (err) {
        console.error('Erro ao carregar detalhes do conteúdo:', err);
        if (alive) setNotFound(true);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadSubjectData();

    return () => {
      alive = false;
    };
  }, [id, user?.id, isAdmin]);

  const toggleFavorite = async () => {
    if (!user) return;
    try {
      if (favoriteId) {
        await supabase.from('favorites').delete().eq('id', favoriteId).eq('user_id', user.id);
        setFavoriteId(null);
      } else {
        const { data } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, subject_id: id })
          .select()
          .single();
        if (data) setFavoriteId(data.id);
      }
    } catch (err) {
      console.warn('Erro ao alternar favorito:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="card-soft px-6 py-16 text-center">
        <p className="font-heading text-lg font-bold">Conteúdo não encontrado</p>
        <p className="mt-1 text-xs text-muted-foreground">Este material pode ter sido removido ou não está publicado.</p>
        <Link to="/biblioteca" className="mt-4 inline-block rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white">
          Voltar à biblioteca
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link to="/biblioteca" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar para a biblioteca
      </Link>

      <div className="card-soft p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-medium text-muted-foreground">
              <span className="rounded-md bg-accent px-2 py-1 text-accent-foreground">{yearLabel(subject.school_year)}</span>
              <span className="rounded-md bg-secondary px-2 py-1">{bimesterLabel(subject.bimester)}</span>
              {(subject.categories || []).map((c) => (
                <span key={c} className="rounded-full border border-border px-2 py-0.5">
                  {c}
                </span>
              ))}
            </div>
            <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">{subject.title}</h1>
            {subject.description && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{subject.description}</p>
            )}
          </div>
          <button
            onClick={toggleFavorite}
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors ${
              favoriteId ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-border hover:border-primary/40'
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${favoriteId ? 'fill-rose-500 text-rose-500' : ''}`} />
            {favoriteId ? 'Favoritado' : 'Favoritar'}
          </button>
        </div>

        {!accessLoading && !hasAccess && <div className="mt-4"><AccessNotice status={access?.status} compact /></div>}

        <div className="mt-5 grid gap-4 border-t border-border/70 pt-5 sm:grid-cols-2">
          {subject.objectives && (
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Target className="h-3.5 w-3.5 text-primary" /> Objetivos de aprendizagem
              </p>
              <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">{subject.objectives}</p>
            </div>
          )}
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <GraduationCap className="h-3.5 w-3.5 text-primary" /> Habilidades da BNCC
            </p>
            {(subject.bncc_codes || []).length ? (
              <div className="flex flex-wrap gap-1.5">
                {subject.bncc_codes.map((code) => (
                  <Link
                    key={code}
                    to={`/biblioteca?q=${encodeURIComponent(code)}`}
                    className="rounded-full bg-primary/8 px-2.5 py-1 text-[11px] font-semibold text-primary"
                  >
                    {code}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Nenhuma habilidade vinculada a este conteúdo.</p>
            )}
          </div>
        </div>
      </div>

      <div className="card-soft p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <FileText className="h-4 w-4 text-primary" /> Materiais disponíveis
        </h2>
        {materials.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            Os arquivos deste conteúdo serão publicados em breve.
          </p>
        ) : (
          <ul className="divide-y divide-border/70">
            {materials.map((m) => {
              const meta = kindMeta(m.kind);
              return (
                <li key={m.id} className="flex flex-wrap items-center gap-3 py-3">
                  <span className="rounded-lg bg-secondary px-2 py-1 text-[10px] font-bold uppercase text-foreground/70">
                    {meta.badge}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.title}</p>
                    <p className="text-[11px] text-muted-foreground">{meta.label}</p>
                  </div>
                  <FileActions material={m} hasAccess={hasAccess} autoOpen={resumeMaterialId === m.id} />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
