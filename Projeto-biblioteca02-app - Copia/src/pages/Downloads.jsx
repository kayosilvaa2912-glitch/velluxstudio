import { useEffect, useState } from 'react';
import { Loader2, Eye, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Downloads() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const user = await base44.auth.me();
      const res = await base44.entities.AccessLog.filter(
        { user_id: user.id },
        { sort: '-created_date', limit: 50 }
      );
      if (alive) setLogs(res.items || []);
    })()
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-bold">Histórico de acessos</h1>
        <p className="mt-1 text-sm text-muted-foreground">Materiais que você abriu recentemente.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : logs.length === 0 ? (
        <div className="card-soft px-6 py-16 text-center">
          <p className="font-heading text-base font-semibold">Nenhum acesso registrado</p>
          <p className="mt-1 text-xs text-muted-foreground">Os materiais que você abrir aparecerão aqui.</p>
        </div>
      ) : (
        <div className="card-soft divide-y divide-border/70">
          {logs.map((l) => (
            <div key={l.id} className="flex items-center gap-3 p-4">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  l.action === 'download' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                }`}
              >
                {l.action === 'download' ? <Download className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{l.resource_title || 'Material'}</p>
                <p className="text-[11px] text-muted-foreground">
                  {l.action === 'download' ? 'Download' : 'Visualização'} ·{' '}
                  {new Date(l.created_date).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}