export default function Privacidade() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="font-heading text-2xl font-bold">Política de privacidade</h1>
      <div className="card-soft space-y-4 p-6 text-sm leading-relaxed text-muted-foreground">
        <p>
          A Biblioteca do Professor trata apenas os dados necessários para criar e manter o acesso do professor ao
          acervo: nome, e-mail de acesso, situação da compra e registros de uso dos materiais.
        </p>
        <p>
          <strong className="text-foreground">Finalidade.</strong> Os dados são usados para autenticar a conta, verificar
          a autorização de acesso, liberar downloads, prestar suporte e cumprir obrigações legais e fiscais.
        </p>
        <p>
          <strong className="text-foreground">Compartilhamento.</strong> Os dados de pagamento são processados pela Zuptos,
          responsável pela transação financeira. Não vendemos dados pessoais.
        </p>
        <p>
          <strong className="text-foreground">Segurança.</strong> Senhas não são armazenadas em texto puro; o acesso aos
          arquivos é verificado no servidor a cada visualização ou download, com links assinados de curta duração.
        </p>
        <p>
          <strong className="text-foreground">Direitos do titular.</strong> Você pode solicitar confirmação de tratamento,
          correção, portabilidade ou exclusão dos seus dados pessoais, respeitadas as obrigações legais de retenção, pelo
          canal de atendimento usado na compra.
        </p>
        <p>
          <strong className="text-foreground">Retenção.</strong> Registros de acesso e de transações são mantidos pelo
          período necessário ao cumprimento de obrigações legais e à comprovação de autorização de uso do conteúdo.
        </p>
      </div>
    </div>
  );
}