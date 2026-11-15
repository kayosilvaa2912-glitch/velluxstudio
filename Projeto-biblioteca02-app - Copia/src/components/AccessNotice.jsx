import { Link } from 'react-router-dom';
import { ShieldAlert, Clock, Ban, CircleDollarSign } from 'lucide-react';

const content = {
  pendente: {
    icon: Clock,
    title: 'Pagamento pendente',
    text: 'Seu cadastro foi criado, mas o acesso aos materiais depende da confirmação do pagamento. Assim que a Zuptos confirmar a compra, o acesso é liberado automaticamente.'
  },
  suspenso: {
    icon: ShieldAlert,
    title: 'Acesso suspenso',
    text: 'O acesso aos materiais está temporariamente suspenso. Fale com o suporte para regularizar a situação.'
  },
  reembolsado: {
    icon: CircleDollarSign,
    title: 'Compra reembolsada',
    text: 'Esta compra foi reembolsada, por isso o acesso aos materiais foi encerrado.'
  },
  cancelado: {
    icon: Ban,
    title: 'Assinatura cancelada',
    text: 'O acesso foi encerrado após o cancelamento. Você pode reativar adquirindo novamente o acervo.'
  },
  bloqueado: {
    icon: Ban,
    title: 'Acesso bloqueado',
    text: 'O acesso a esta conta está bloqueado. Entre em contato com o suporte para mais informações.'
  }
};

export default function AccessNotice({ status, compact }) {
  const info = content[status] || content.pendente;
  const Icon = info.icon;
  return (
    <div className={`flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 ${compact ? '' : 'sm:p-5'}`}>
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-sm font-semibold text-amber-900">{info.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-amber-800/90">{info.text}</p>
        <Link to="/ajuda" className="mt-2 inline-block text-xs font-semibold text-amber-900 underline">
          Falar com o suporte
        </Link>
      </div>
    </div>
  );
}