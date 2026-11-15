export default function Termos() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="font-heading text-2xl font-bold">Termos de uso</h1>
      <div className="card-soft space-y-4 p-6 text-sm leading-relaxed text-muted-foreground">
        <p>
          O acervo da Biblioteca do Professor é destinado a professores do Ensino Fundamental II e é licenciado para uso
          pedagógico individual do titular da conta.
        </p>
        <p>
          <strong className="text-foreground">Licença de uso.</strong> É permitido utilizar os materiais com seus alunos e
          imprimir cópias para a turma. Não é permitido redistribuir, revender, publicar os arquivos na internet ou
          compartilhar o acesso à conta.
        </p>
        <p>
          <strong className="text-foreground">Acesso.</strong> A liberação dos materiais depende de pagamento confirmado.
          Situações de reembolso, chargeback ou cancelamento revogam o acesso automaticamente.
        </p>
        <p>
          <strong className="text-foreground">Conta.</strong> As credenciais são pessoais e intransferíveis. O uso
          simultâneo indevido da conta pode levar à suspensão do acesso.
        </p>
        <p>
          <strong className="text-foreground">Conteúdo pedagógico.</strong> As habilidades da BNCC exibidas são as
          cadastradas pela curadoria a partir de documentos oficiais. Alterações curriculares podem gerar atualizações do
          acervo.
        </p>
      </div>
    </div>
  );
}