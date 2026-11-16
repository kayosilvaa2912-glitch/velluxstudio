import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3, MapPin, Plus, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

const DAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const initial = { class_name: '', subject: '', room: '', weekday: '1', starts_at: '07:00', ends_at: '07:50' };

function upcomingClass(rows, now) {
  const options = rows.map((row) => {
    const [hour, minute] = row.starts_at.split(':').map(Number);
    const date = new Date(now);
    const offset = (Number(row.weekday) - date.getDay() + 7) % 7;
    date.setDate(date.getDate() + offset);
    date.setHours(hour, minute, 0, 0);
    if (date <= now) date.setDate(date.getDate() + 7);
    return { ...row, nextAt: date };
  });
  return options.sort((a, b) => a.nextAt - b.nextAt)[0] || null;
}

export default function Agenda() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(new Date());

  const load = useCallback(async () => {
    if (!user?.id) return;
    const { data, error: loadError } = await supabase.from('teacher_schedule').select('*').eq('user_id', user.id).order('weekday').order('starts_at');
    if (loadError) setError('Não foi possível carregar a agenda. Confira se a migração SQL foi aplicada.');
    else setClasses(data || []);
    setBusy(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(timer); }, []);

  const next = useMemo(() => upcomingClass(classes, now), [classes, now]);
  const countdown = next ? Math.max(0, Math.ceil((next.nextAt - now) / 60000)) : null;

  const save = async (event) => {
    event.preventDefault();
    setSaving(true); setError('');
    const { error: saveError } = await supabase.from('teacher_schedule').insert({ ...form, weekday: Number(form.weekday), user_id: user.id });
    if (saveError) setError('Não foi possível salvar. Confira se a tabela da agenda foi criada no Supabase.');
    else { setForm(initial); await load(); }
    setSaving(false);
  };

  const remove = async (id) => {
    const { error: removeError } = await supabase.from('teacher_schedule').delete().eq('id', id).eq('user_id', user.id);
    if (removeError) setError('Não foi possível remover esta aula.');
    else setClasses((current) => current.filter((item) => item.id !== id));
  };

  return <div className="space-y-5">
    <header><h1 className="font-heading text-2xl font-bold">Agenda do professor</h1><p className="mt-1 text-sm text-muted-foreground">Organize suas aulas semanais e veja qual é a próxima.</p></header>
    <section className="rounded-2xl bg-navy p-5 text-white shadow-lg">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/70"><Clock3 className="h-4 w-4" /> Próxima aula</p>
      {next ? <div className="mt-2"><p className="font-heading text-xl font-bold">{next.class_name} · {next.subject}</p><p className="mt-1 text-sm text-white/80">{DAYS[next.nextAt.getDay()]}, às {next.starts_at}{next.room ? ` · ${next.room}` : ''}</p><p className="mt-2 text-sm font-semibold text-cyan-200">{countdown === 0 ? 'Começa agora' : countdown < 60 ? `Em ${countdown} ${countdown === 1 ? 'minuto' : 'minutos'}` : `Em ${Math.floor(countdown / 60)}h${countdown % 60 ? ` ${countdown % 60}min` : ''}`}</p></div> : <p className="mt-2 text-sm text-white/75">Cadastre suas aulas semanais para ver a próxima aqui.</p>}
    </section>
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <form onSubmit={save} className="card-soft space-y-3 p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold"><Plus className="h-4 w-4 text-primary" /> Adicionar aula semanal</h2>
        <input required maxLength={80} value={form.class_name} onChange={(e) => setForm({ ...form, class_name: e.target.value })} placeholder="Turma (ex.: 7º ano B)" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" />
        <input required maxLength={80} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Disciplina" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" />
        <input maxLength={100} value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="Local / sala (opcional)" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" />
        <div className="grid grid-cols-3 gap-2"><select value={form.weekday} onChange={(e) => setForm({ ...form, weekday: e.target.value })} className="col-span-3 h-10 rounded-lg border border-border bg-background px-3 text-sm sm:col-span-1">{DAYS.map((day, index) => <option value={index} key={day}>{day}</option>)}</select><input aria-label="Início" type="time" required value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className="h-10 rounded-lg border border-border bg-background px-2 text-sm" /><input aria-label="Fim" type="time" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} className="h-10 rounded-lg border border-border bg-background px-2 text-sm" /></div>
        {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
        <button disabled={saving} className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Salvar aula</button>
      </form>
      <section className="card-soft p-5"><h2 className="mb-3 flex items-center gap-2 text-sm font-semibold"><CalendarDays className="h-4 w-4 text-primary" /> Minha semana</h2>
        {busy ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div> : classes.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma aula cadastrada ainda.</p> : <ul className="divide-y divide-border/70">{classes.map((item) => <li key={item.id} className="flex items-center gap-3 py-3"><span className="w-24 shrink-0 text-xs font-semibold text-primary">{DAYS[item.weekday]}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.class_name} · {item.subject}</p><p className="flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="h-3 w-3" />{item.starts_at}{item.ends_at ? `–${item.ends_at}` : ''}{item.room && <><MapPin className="ml-1 h-3 w-3" />{item.room}</>}</p></div><button type="button" aria-label={`Excluir aula ${item.class_name}`} onClick={() => remove(item.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button></li>)}</ul>}
      </section>
    </div>
    <p className="text-xs text-muted-foreground">A agenda se repete semanalmente e o aviso aparece enquanto o app estiver aberto. Notificações com o app fechado exigiriam configurar notificações push.</p>
  </div>;
}
