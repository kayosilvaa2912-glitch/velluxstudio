import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, Heart, ArrowLeft, Target, GraduationCap, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import useAccess from '@/hooks/useAccess';
import FileActions from '@/components/FileActions';
import AccessNotice from '@/components/AccessNotice';
import { yearLabel, bimesterLabel, kindMeta } from '@/lib/constants';

export default function Conteudo() {
  const { id } = useParams();
  const { hasAccess, access, loading: accessLoading } = useAccess();
  const [subject, setSubject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      const user = await base44.auth.me().catch(() => null);
      const found = await base44.entities.Subject.get(id).catch(() => null);
      if (!alive) return;
      // Rascunhos só podem ser abertos pelo administrador.
      if (!found || (found.published === false && user?.role !== 'admin')) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setNotFound(false);
      setSubject(found);
      const mats = await base44.entities.Material.filter(
        { subject_id: id },
        { sort: 'created_date', limit: 100 }
      );
      const favs = user
        ? await base44.entities.Favorite.filter({ user_id: user.id, subject_id: id }, { limit: 1 })
        : { items: [] };
      if (!alive) return;
      setMaterials(mats.items || []);
      setFavoriteId((favs.items || [])[0]?.id || null);
      setLoading(false);
    })().catch(() => {
      if (alive) setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [id, refreshKey]);

  // Novos arquivos e edições do admin chegam na tela do professor sem recarregar.
  useEffect(() => {
    const unsubscribeMaterial = base44.entities.Material.subscribe((event) => {
      if (event?.data?.subject_id === id) setRefreshKey((k) => k + 1);
    });
    const unsubscribeSubject = base44.entities.Subject.subscribe((event) => {
      if (event?.id === id) setRefreshKey((k) => k + 1);
    });
    return () => {
      unsubscribeMaterial();
      unsubscribeSubject();
    };
  }, [id]);

  useEffect(() => {
    if (!notFound) return;
    const meta = document.createElement('meta');
    meta.name = 'prerender-status-code';
    meta.content = '404';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [notFound]);

  const toggleFavorite = async () => {
    if (favoriteId) {
      await base44.entities.Favorite.delete(favoriteId);
      setFavoriteId(null);
    } else {
      const user = await base44.auth.me();
      const created = await base44.entities.Favorite.create({ user_id: user.id, subject_id: id });
      setFavoriteId(created.id);
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
                  <FileActions material={m} hasAccess={hasAccess} />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}