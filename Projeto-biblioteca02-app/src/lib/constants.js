export const YEARS = [
  { value: '6', label: '6º Ano', color: 'blue' },
  { value: '7', label: '7º Ano', color: 'green' },
  { value: '8', label: '8º Ano', color: 'purple' },
  { value: '9', label: '9º Ano', color: 'orange' }
];

export const BIMESTERS = [
  { value: 1, label: '1º bimestre' },
  { value: 2, label: '2º bimestre' },
  { value: 3, label: '3º bimestre' },
  { value: 4, label: '4º bimestre' }
];

export const MATERIAL_KINDS = [
  { value: 'aluno_pdf', label: 'Material do aluno (PDF)', badge: 'PDF' },
  { value: 'editavel_word', label: 'Versão editável (Word)', badge: 'DOC' },
  { value: 'gabarito', label: 'Gabarito do professor', badge: 'GAB' },
  { value: 'orientacoes', label: 'Orientações pedagógicas', badge: 'ORI' },
  { value: 'complementar', label: 'Material complementar', badge: 'COMP' }
];

export const CATEGORIES = [
  'Interpretação textual',
  'Gêneros textuais',
  'Gramática',
  'Ortografia',
  'Produção textual',
  'Leitura',
  'Literatura',
  'Análise linguística',
  'Avaliações',
  'Revisões'
];

export const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx'];
export const MAX_FILE_SIZE = 200 * 1024 * 1024;
export const MAX_FILE_LABEL = '200 MB';

export const formatBytes = (bytes) => {
  if (!bytes) return '';
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

export const yearLabel = (value) => YEARS.find((y) => y.value === String(value))?.label || `${value}º ano`;
export const bimesterLabel = (value) => BIMESTERS.find((b) => b.value === Number(value))?.label || `${value}º bimestre`;
export const kindMeta = (value) => MATERIAL_KINDS.find((k) => k.value === value) || MATERIAL_KINDS[0];