import dayjs from 'dayjs';
import type { Project, Sample, SamplingSeries, Mold } from '../../core/types';

export interface PourSummary {
  total: number;
  dueToday: number;
  tested: number;
  overdue: number;
  nextDue: string | null;
  nextDueLabel: string;
}

export function summarizeSeries(series: SamplingSeries): PourSummary {
  const molds = series.molds ?? [];
  const today = dayjs().startOf('day');
  let dueToday = 0;
  let tested = 0;
  let overdue = 0;
  let nextDue: string | null = null;
  let nextDueDay: dayjs.Dayjs | null = null;
  for (const m of molds) {
    if (m.is_done || (m.breaking_load !== null && m.breaking_load !== undefined)) {
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

export function memberMolds(member: Sample | null | undefined): Mold[] {
  if (!member) return [];
  const out: Mold[] = [];
  for (const series of member.series ?? []) {
    out.push(...(series.molds ?? []));
  }
  return out;
}

export function projectMolds(project: Project | null | undefined): Mold[] {
  if (!project) return [];
  const out: Mold[] = [];
  for (const member of project.samples ?? []) {
    out.push(...memberMolds(member));
  }
  return out;
}

export function projectMembers(project: Project | null | undefined): Sample[] {
  return project?.samples ?? [];
}

export function moldMember(
  project: Project | null | undefined,
  moldId: number,
): { member?: Sample; series?: SamplingSeries; mold?: Mold } {
  if (!project) return {};
  for (const member of project.samples ?? []) {
    for (const series of member.series ?? []) {
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