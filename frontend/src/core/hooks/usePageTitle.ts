export function usePageTitle(title: string) {
  const full = title ? `${title} | LIMS` : 'LIMS';
  if (typeof document !== 'undefined') document.title = full;
}