import React from 'react';
import { ExternalLink, MessageCircle, ShieldAlert, Clock, Ban, CircleDollarSign } from 'lucide-react';

const content = {
  pendente: {
    icon: Clock,
    title: 'Acesso completo bloqueado (Pagamento pendente)',
    text: 'Você pode explorar todo o catálogo e navegar pelas disciplinas. Para liberar a visualização e download dos PDFs e arquivos editáveis, adquira seu acesso.'
  },
  suspenso: {
    icon: ShieldAlert,
    title: 'Acesso suspenso',
    text: 'O acesso aos materiais está temporariamente suspenso. Fale com nosso suporte para regularizar a situação.'
  },
  reembolsado: {
    icon: CircleDollarSign,
    title: 'Compra reembolsada',
    text: 'Esta compra foi reembolsada. Para acessar novamente o acervo, adquira o acesso.'
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

export default function AccessNotice({
  status,
  compact,
  checkoutUrl = 'https://checkout.zuptos.com/seu-link-de-checkout',
  whatsappNumber = '5511999999999'
}) {
  const info = content[status] || content.pendente;
  const Icon = info.icon;

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    'Olá! Gostaria de tirar dúvidas sobre a Biblioteca do Professor e liberação de acesso.'
  )}`;

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 sm:flex-row sm:items-center sm:justify-between ${
        compact ? '' : 'sm:p-5'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-200/70 text-amber-900">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-amber-950">{info.title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-amber-900/90">{info.text}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-transform hover:scale-105 hover:bg-emerald-700"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Liberar acesso agora
        </a>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-50"
        >
          <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />
          Falar no WhatsApp
        </a>
      </div>
    </div>
  );
}
