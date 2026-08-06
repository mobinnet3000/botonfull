import dayjs from 'dayjs';
import type { Project, Mold, StructuralMember, PourSeries } from '../../core/types';

export interface PourSummary {
  total: number;
  dueToday: number;
  tested: number;
  overdue: number;
  nextDue: string | null;
  nextDueLabel: string;
}

export function summarizeSeries(series: PourSeries | { molds?: Mold[] }): PourSummary {
  const molds = series.molds ?? [];
  const today = dayjs().startOf('day');
  let dueToday = 0;
  let tested = 0;
  let overdue = 0;
  let nextDue: string | null = null;
  let nextDueDay: dayjs.Dayjs | null = null;
  for (const m of molds) {
    if (m.is_done) {
      tested += 1;
      continue;
    }
    const deadline = dayjs(m.deadline);
    const diff = deadline.startOf('day').diff(today, 'day');
    if (diff < 0) overdue += 1;
    else if (diff === 0) dueToday += 1;
    if (nextDueDay === null || deadline.isBefore(nextDueDay)) {
      nextDueDay = deadline;
      nextDue = deadline.format('YYYY-MM-DD');
    }
  }
  const days = nextDueDay ? nextDueDay.startOf('day').diff(today, 'day') : null;
  return {
    total: molds.length,
    dueToday,
    tested,
    overdue,
    nextDue,
    nextDueLabel: days === null ? '—' : days <= 0 ? 'امروز' : `${days} روز`,
  };
}

export function memberMolds(member: StructuralMember): Mold[] {
  const out: Mold[] = [];
  for (const series of member.pour_series ?? []) {
    out.push(...(series.molds ?? []));
  }
  return out;
}

export function projectMolds(project: Project): Mold[] {
  const out: Mold[] = [];
  for (const member of project.structural_members ?? []) {
    out.push(...memberMolds(member));
  }
  return out;
}

export function projectMembers(project: Project): StructuralMember[] {
  return project?.structural_members ?? [];
}

export function moldMember(
  project: Project,
  moldId: number,
): { member?: StructuralMember; series?: any; mold?: Mold } {
  for (const member of project.structural_members ?? []) {
    for (const series of member.pour_series ?? []) {
      const mold = (series.molds ?? []).find((m) => m.id === moldId);
      if (mold) return { member, series, mold };
    }
  }
  return {};
}

export function moldAgeLabel(age: number): string {
  if (age === 7) return 'آزمون ۷ روزه';
  if (age === 14) return 'آزمون ۱۴ روزه';
  if (age === 28) return 'آزمون ۲۸ روزه';
  return `آزمون ${age} روزه`;
}