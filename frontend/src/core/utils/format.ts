import dayjs from 'dayjs';

export function formatDate(value?: string | null, withTime = false): string {
  if (!value) return '—';
  return dayjs(value).format(withTime ? 'YYYY/MM/DD HH:mm' : 'YYYY/MM/DD');
}

export function formatNumber(value?: number | string | null, digits = 0): string {
  if (value === null || value === undefined || value === '') return '—';
  const n = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(n)) return String(value);
  return n.toLocaleString('fa-IR', { maximumFractionDigits: digits });
}

export function downloadBlob(content: string, filename: string, type = 'text/csv;charset=utf-8') {
  const blob = new Blob(['\uFEFF' + content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function rowsToCsv(rows: Record<string, unknown>[], columns: { field: string; headerName: string }[]): string {
  const header = columns.map((c) => c.headerName).join(',');
  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const val = row[c.field];
          const str = val === null || val === undefined ? '' : String(val);
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(','),
    )
    .join('\n');
  return `${header}\n${body}`;
}

export function printElement(title: string) {
  document.title = title;
  window.print();
}