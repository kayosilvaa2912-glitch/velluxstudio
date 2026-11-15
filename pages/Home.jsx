import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import useAccess from '@/hooks/useAccess';
import { YEARS } from '@/lib/constants';
import WelcomeBanner from '@/components/home/WelcomeBanner';
import YearCard from '@/components/home/YearCard';
import QuickAccess from '@/components/home/QuickAccess';
import RecentMaterials from '@/components/home/RecentMaterials';
import BnccHighlight from '@/components/home/BnccHighlight';
import AccessNotice from '@/components/AccessNotice';
import { Lightbulb } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const { access, isAdmin, hasAccess, loading } = useAccess();
  const [counts, setCounts] = useState({});
  const [recent, setRecent] = useState([]);
  const [skill, setSkill] = useState(null);
  const firstName = (user?.full_name || 'professor(a)').split(' ')[0];

  // Contagem exata por ano escolar usando Supabase
  const loadCounts = useCallback(async () => {
    try {
      const results = await Promise.all(
        YEARS.map(async (y) => {
          let query = supabase
            .from('subjects')
            .select('*', { count: 'exact', head: true })
            .eq('school_year', y.value);

          if (!isAdmin) {
            query = query.eq('published', true);
          }

          const { count, error } = await query;
          if (error) throw error;
          return count || 0;
        })
      );

      const map = {};
      YEARS.forEach((y, i) => {
        map[y.value] = results[i] || 0;
      });
      setCounts(map);
    } catch (err) {
      console.warn('Erro ao carregar contagens:', err);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  useEffect(() => {
    let alive = true;

    async function loadData() {
      try {
        if (user?.id) {
          const { data: logs } = await supabase
            .from('access_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(40);

          const seen = new Set();
          const items = [];
          for (const log of logs || []) {
            const key = log.resource_id || log.resource_title;
            if (!key || seen.has(key)) continue;
            seen.add(key);
            items.push({
              id: key,
              kind: 'PDF',
              title: log.resource_title || 'Material',
              meta: new Date(log.created_at).toLocaleDateString('pt-BR'),
              to: log.metadata?.subject_id ? `/conteudo/${log.metadata.subject_id}` : '/biblioteca'
            });
            if (items.length === 4) break;
          }
          if (alive) setRecent(items);
        }

        const { data: skills } = await supabase
          .from('bncc_skills')
          .select('*')
          .order('code', { ascending: true })
          .limit(120);

        const pool = skills || [];
        if (alive) setSkill(pool.length ? pool[Math.floor(Math.random() * pool.length)] : null);
      } catch (err) {
        console.warn('Erro ao carregar dados do usuário:', err);
      }
    }

    loadData();

    return () => {
      alive = false;
    };
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold sm:text-[28px]">Olá, professor(a) {firstName}!</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Encontre rapidamente o material que precisa para sua próxima aula.
          </p>
        </div>
        <div className="w-full sm:w-72">
          <WelcomeBanner />
        </div>
      </div>

      {!loading && !hasAccess && !isAdmin && <AccessNotice status={access?.status} compact />}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {YEARS.map((y) => (
          <YearCard key={y.value} year={y.value} label={y.label} color={y.color} materials={counts[y.value] || 0} />
        ))}
      </div>

      <QuickAccess />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentMaterials items={recent} />
        </div>
        <BnccHighlight skill={skill} />
      </div>

      <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-card px-4 py-3 text-xs text-muted-foreground">
        <Lightbulb className="h-4 w-4 shrink-0 text-amber-500" />
        <span>
          <strong className="font-semibold text-foreground">Dica do professor:</strong> explore os materiais por assunto
          ou habilidade da BNCC para encontrar exatamente o que precisa.
        </span>
      </div>
    </div>
  );
}
