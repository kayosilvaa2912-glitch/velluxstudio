import { Link } from 'react-router-dom';
import { HelpCircle, ShieldCheck, CreditCard, FileText } from 'lucide-react';

const faq = [
  {
    icon: CreditCard,
    q: 'Como o acesso aos materiais é liberado?',
    a: 'A liberação acontece automaticamente após a confirmação do pagamento pela Zuptos. Enquanto o pagamento não é confirmado, sua conta permanece com status “pendente de pagamento” e os arquivos continuam bloqueados.'
  },
  {
    icon: FileText,
    q: 'Posso abrir os arquivos quantas vezes quiser?',
    a: 'Sim. Com o acesso ativo, você pode visualizar cada material quantas vezes precisar. Cada abertura gera um link assinado de curta duração, exclusivo para a sua sessão.'
  },
  {
    icon: ShieldCheck,
    q: 'Por que os arquivos não abrem por link direto?',
    a: 'Os materiais são produtos comerciais protegidos. Eles ficam em armazenamento privado e só são liberados após a verificação da sua sessão e do seu acesso ativo no servidor.'
  }
];

export default function Ajuda() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-bold">Ajuda</h1>
        <p className="mt-1 text-sm text-muted-foreground">Dúvidas frequentes sobre acesso, pagamento e downloads.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {faq.map(({ icon: Icon, q, a }) => (
          <div key={q} className="card-soft p-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold">{q}</p>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{a}</p>
          </div>
        ))}

        <div className="card-soft p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <HelpCircle className="h-4 w-4" />
            </span>
            <p className="text-sm font-semibold">Precisa de atendimento?</p>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            O canal de atendimento é o mesmo usado na sua compra. Tenha em mãos o e-mail cadastrado e o comprovante da
            transação para agilizar a verificação da sua situação de acesso.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Link to="/meus-dados" className="rounded-lg border border-border px-3 py-2 font-medium">
              Ver minha situação
            </Link>
            <Link to="/privacidade" className="rounded-lg border border-border px-3 py-2 font-medium">
              Privacidade
            </Link>
            <Link to="/termos" className="rounded-lg border border-border px-3 py-2 font-medium">
              Termos de uso
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}