import dayjs from 'dayjs';
import type { Mold, Sample } from '../types';

export interface MoldDueInfo {
  dueDate: dayjs.Dayjs;
  remainingDays: number;
  isOverdue: boolean;
  isDueToday: boolean;
  isDueTomorrow: boolean;
  window: 'overdue' | 'today' | 'tomorrow' | 'week' | 'upcoming';
}

export function moldDue(mold: Mold, base?: dayjs.Dayjs): MoldDueInfo {
  const now = base ?? dayjs();
  const due = dayjs(mold.deadline);
  const remaining = due.startOf('day').diff(now.startOf('day'), 'day');
  const isOverdue = remaining < 0 && !mold.is_done;
  return {
    dueDate: due,
    remainingDays: remaining,
    isOverdue,
    isDueToday: remaining === 0,
    isDueTomorrow: remaining === 1,
    window: isOverdue
      ? 'overdue'
      : remaining === 0
        ? 'today'
        : remaining === 1
          ? 'tomorrow'
          : remaining <= 7
            ? 'week'
            : 'upcoming',
  };
}

export type MoldGroup = '7days' | '14days' | '28days' | 'archive';

export function moldGroup(mold: Mold): MoldGroup {
  if (mold.is_done || (mold.completed_at && mold.completed_at !== mold.deadline)) return 'archive';
  switch (mold.age_in_days) {
    case 7:
      return '7days';
    case 14:
      return '14days';
    case 28:
      return '28days';
    default:
      return 'archive';
  }
}

export const MOLD_GROUP_LABELS: Record<MoldGroup, string> = {
  '7days': 'آزمون ۷ روزه',
  '14days': 'آزمون ۱۴ روزه',
  '28days': 'آزمون ۲۸ روزه',
  archive: 'بایگانی',
};

export const MOLD_AGED_TO_LABEL = {
  7: 'آزمون ۷ روزه',
  14: 'آزمون ۱۴ روزه',
  28: 'آزمون ۲۸ روزه',
} as Record<number, string>;

export function groupMoldsByAge(molds: Mold[]): Record<string, Mold[]> {
  const result: Record<string, Mold[]> = {};
  for (const mold of molds) {
    const key = moldGroup(mold);
    result[key] = result[key] ?? [];
    result[key].push(mold);
  }
  return result;
}

export function dueLabel(info: Pick<MoldDueInfo, 'remainingDays' | 'isOverdue'>): string {
  if (info.isOverdue) return `دیرکرد ${Math.abs(info.remainingDays)} روز`;
  return `تا ${info.remainingDays} روز دیگر`;
}

export function collectAllMolds(samples: Sample[] | undefined): Mold[] {
  if (!samples) return [];
  const out: Mold[] = [];
  for (const s of samples) {
    for (const series of s.series ?? []) {
      out.push(...(series.molds ?? []));
    }
  }
  return out;
}