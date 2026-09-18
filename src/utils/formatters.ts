export const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercent = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return '0%';
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

export const formatDateBR = (dateString: string): string => {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }
  return dateString;
};

export const MONTH_NAMES_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const formatMonthYear = (month: number, year: number): string => {
  const monthName = MONTH_NAMES_PT[month - 1] || '';
  return `${monthName} de ${year}`;
};

export const parseCurrencyInput = (input: string): number => {
  if (!input) return 0;
  // Remove non-numeric except comma and dot
  const clean = input.replace(/[^\d.,]/g, '').replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : Math.max(0, num);
};
