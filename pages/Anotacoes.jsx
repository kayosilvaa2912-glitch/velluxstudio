import { useCallback, useEffect, useState } from 'react';
import { Loader2, StickyNote } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import NoteEditor from '@/components/notes/NoteEditor';
import NoteCard from '@/components/notes/NoteCard';

export default function Anotacoes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('teacher_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (err) {
      console.warn('Erro ao carregar anotações:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async ({ title, content }) => {
    if (!user?.id) return;
    setSaving(true);
    try {
      if (editing?.id) {
        const { error } = await supabase
          .from('teacher_notes')
          .update({ title, content, updated_at: new Date().toISOString() })
          .eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('teacher_notes')
          .insert({ user_id: user.id, title, content });
        if (error) throw error;
      }
      setEditing(null);
      await load();
    } catch (err) {
      alert(`Erro ao salvar anotação: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (note) => {
    if (!window.confirm('Excluir esta anotação? Essa ação não pode ser desfeita.')) return;
    try {
      const { error } = await supabase.from('teacher_notes').delete().eq('id', note.id);
      if (error) throw error;
      if (editing?.id === note.id) setEditing(null);
      await load();
    } catch (err) {
      alert(`Erro ao excluir: ${err.message}`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Minhas anotações</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Registre observações das aulas, combinados e ideias — só você vê suas anotações.
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground">
          <StickyNote className="h-3.5 w-3.5" />
          {notes.length} anotação(ões)
        </span>
      </div>

      <NoteEditor
        key={editing?.id || 'nova'}
        note={editing}
        saving={saving}
        onSave={save}
        onCancel={() => setEditing(null)}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : notes.length === 0 ? (
        <div className="card-soft px-6 py-14 text-center">
          <p className="font-heading text-base font-semibold">Nenhuma anotação ainda</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
            Use o campo acima para registrar o que precisa lembrar sobre suas turmas.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onEdit={setEditing} onDelete={remove} />
          ))}
        </div>
      )}
    </div>
  );
}
