import { X, ExternalLink, FileWarning } from 'lucide-react';

export default function FileViewerModal({ file, onClose }) {
  if (!file?.url) return null;

  const name = file.name || 'material';
  const isPdf = /\.pdf$/i.test(name) || /pdf/i.test(file.mimeType || '');

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-navy-deep/70 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        className="flex h-full max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <p className="min-w-0 flex-1 truncate text-sm font-semibold">{name}</p>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-medium hover:border-primary/40 hover:text-primary"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Abrir em nova aba
          </a>
          <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary" aria-label="Fechar">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 bg-secondary/40">
          {isPdf ? (
            <iframe src={file.url} title={name} className="h-full min-h-[60vh] w-full border-0" />
          ) : (
            <div className="flex h-full min-h-[50vh] flex-col items-center justify-center gap-3 px-6 text-center">
              <FileWarning className="h-8 w-8 text-amber-500" />
              <p className="text-sm font-semibold">Este formato não abre no navegador</p>
              <p className="max-w-sm text-xs text-muted-foreground">
                Arquivos do Word precisam ser abertos em nova aba para leitura no seu computador.
              </p>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white"
              >
                Abrir arquivo
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}