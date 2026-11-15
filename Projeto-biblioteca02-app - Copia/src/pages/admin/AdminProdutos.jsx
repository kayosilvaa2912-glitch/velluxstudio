import { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, Webhook, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const empty = { name: '', external_product_id: '', price: '', description: '', active: true };

export default function AdminProdutos() {
  const [products, setProducts] = useState([]);
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    const [prodPage, eventPage] = await Promise.all([
      base44.entities.Product.list({ sort: '-created_date', limit: 50 }),
      base44.entities.WebhookEvent.list({ sort: '-created_date', limit: 20 })
    ]);
    setProducts(prodPage.items || []);
    setEvents(eventPage.items || []);
    setLoading(false);
  };

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.external_product_id.trim()) {
      setError('Informe o nome e o identificador do produto na Zuptos.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await base44.entities.Product.create({
        name: form.name.trim(),
        external_product_id: form.external_product_id.trim(),
        price: Number(form.price) || 0,
        description: form.description.trim(),
        active: form.active
      });
      setForm(empty);
      await load();
    } catch {
      setError('Não foi possível salvar o produto.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await base44.entities.Product.delete(id);
    await load();
  };

  // URL pública do app publicado: é esta que deve ser cadastrada na Zuptos.
  const webhookUrl = 'https://faithful-pro-lesson-hub.base44.app/functions/zuptosWebhook';

  return (
    <div className="space-y-4">
      <div className="card-soft p-5">
        <p className="mb-1 flex items-center gap-2 text-sm font-semibold">
          <Webhook className="h-4 w-4 text-primary" /> Webhook de pagamento (Zuptos)
        </p>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Cadastre esta URL no painel da Zuptos. O evento só é aplicado se a autenticidade for validada (assinatura HMAC
          ou token compartilhado) e cada evento é processado uma única vez.
        </p>
        <code className="mt-2 block overflow-x-auto rounded-lg bg-secondary px-3 py-2 text-[11px]">{webhookUrl}</code>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Os segredos do webhook são configurados na página <strong>Secrets</strong> do painel do aplicativo. Sem eles o
          endpoint rejeita todos os eventos — nenhum acesso é liberado.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={save} className="card-soft space-y-3 p-5">
          <p className="text-sm font-semibold">Produtos comercializados</p>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nome do produto (ex.: Acervo completo 6º ao 9º)"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary/40"
          />
          <input
            value={form.external_product_id}
            onChange={(e) => setForm({ ...form, external_product_id: e.target.value })}
            placeholder="ID do produto na Zuptos"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary/40"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="Preço (R$)"
              type="number"
              step="0.01"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary/40"
            />
            <label className="flex items-center gap-2 text-[11px] font-medium">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="h-4 w-4"
              />
              Ativo
            </label>
          </div>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            placeholder="Descrição interna"
            className="w-full rounded-lg border border-border bg-background p-3 text-xs outline-none focus:border-primary/40"
          />
          {error && <p className="text-[11px] font-medium text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Cadastrar produto
          </button>
        </form>

        <div className="card-soft p-5">
          <p className="mb-3 text-sm font-semibold">Produtos cadastrados</p>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              Nenhum produto configurado. Sem produto cadastrado, o webhook rejeita eventos e nenhum acesso é liberado.
            </p>
          ) : (
            <ul className="divide-y divide-border/70">
              {products.map((p) => (
                <li key={p.id} className="flex items-center gap-2 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">{p.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      ID Zuptos: {p.external_product_id}
                      {p.price ? ` · R$ ${Number(p.price).toFixed(2)}` : ''}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      p.active ? 'bg-emerald-50 text-emerald-700' : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {p.active ? 'Ativo' : 'Inativo'}
                  </span>
                  <button onClick={() => remove(p.id)} className="rounded p-1 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card-soft p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Save className="h-4 w-4 text-primary" /> Eventos recebidos
        </p>
        {events.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">Nenhum evento recebido até agora.</p>
        ) : (
          <ul className="divide-y divide-border/70">
            {events.map((ev) => (
              <li key={ev.id} className="flex flex-wrap items-center gap-2 py-2.5 text-[11px]">
                <span className="rounded bg-secondary px-2 py-0.5 font-medium">{ev.event_type}</span>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">
                  {ev.external_event_id} {ev.note ? `· ${ev.note}` : ''}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 font-semibold ${
                    ev.processing_status === 'processed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : ev.processing_status === 'failed'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {ev.processing_status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}