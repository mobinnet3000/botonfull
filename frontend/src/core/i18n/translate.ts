import { fa } from './fa';
import { en } from './en';
import type { Lang } from './types';

export function getDict(lang: Lang): Record<string, string> {
  return lang === 'fa' ? fa : en;
}

export function translate(dict: Record<string, string>, key: string, params?: Record<string, string | number>): string {
  let value = dict[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) value = value.replace(`{${k}}`, String(v));
  }
  return value;
}