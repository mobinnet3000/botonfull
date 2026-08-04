export interface MoldScheduleEntry {
  age: number;
  label: string;
}

export interface ProjectSettings {
  moldAges: number[];
  archiveMold: boolean;
  schedule: MoldScheduleEntry[];
  pourNamePrefix: string;
  memberNamePrefix: string;
}

export const DEFAULT_SETTINGS: ProjectSettings = {
  moldAges: [7, 14, 28],
  archiveMold: true,
  schedule: [
    { age: 7, label: 'آزمون ۷ روزه' },
    { age: 14, label: 'آزمون ۱۴ روزه' },
    { age: 28, label: 'آزمون ۲۸ روزه' },
  ],
  pourNamePrefix: 'Truck',
  memberNamePrefix: 'Member',
};

const STORAGE_PREFIX = 'nboton_project_settings_';

export function getProjectSettings(projectId: number): ProjectSettings {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${projectId}`);
    if (!raw) return { ...DEFAULT_SETTINGS, schedule: DEFAULT_SETTINGS.schedule.map((s) => ({ ...s })) };
    const parsed = JSON.parse(raw) as Partial<ProjectSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      schedule: parsed.schedule ?? DEFAULT_SETTINGS.schedule.map((s) => ({ ...s })),
      moldAges: parsed.moldAges ?? DEFAULT_SETTINGS.moldAges,
    };
  } catch {
    return { ...DEFAULT_SETTINGS, schedule: DEFAULT_SETTINGS.schedule.map((s) => ({ ...s })) };
  }
}

export function saveProjectSettings(projectId: number, settings: ProjectSettings): void {
  localStorage.setItem(`${STORAGE_PREFIX}${projectId}`, JSON.stringify(settings));
}

export function moldAgesFromSettings(settings: { moldAges: number[] }): number[] {
  return Array.from(new Set(settings.moldAges.filter((a) => Number.isFinite(a) && a > 0))).sort(
    (a, b) => a - b,
  );
}

export function nextPourNumber(projectId: number, existing: number): number {
  const key = `${STORAGE_PREFIX}${projectId}_pour_count`;
  const current = Number(localStorage.getItem(key) ?? '0');
  const next = Math.max(current, existing) + 1;
  localStorage.setItem(key, String(next));
  return next;
}

export function resetPourCounter(projectId: number): void {
  localStorage.removeItem(`${STORAGE_PREFIX}${projectId}_pour_count`);
}