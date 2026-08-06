import type { ProjectSettings as CoreSettings } from '../../core/types';

export type ProjectSettings = CoreSettings;

export const DEFAULT_MOLD_AGES = [7, 14, 28];

export const DEFAULT_SETTINGS: ProjectSettings = {
  id: 0,
  project: 0,
  default_mold_ages: DEFAULT_MOLD_AGES,
  default_mold_count: 1,
  pour_name_prefix: 'Truck',
  member_name_prefix: 'Member',
  use_auto_numbering: true,
  next_pour_number: 1,
  next_member_number: 1,
  custom_age_labels: {},
  created_at: '',
  updated_at: '',
};

export function projectSettings(settings?: Partial<ProjectSettings> | null): ProjectSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...(settings ?? {}),
    default_mold_ages: Array.isArray(settings?.default_mold_ages) && settings!.default_mold_ages.length
      ? settings!.default_mold_ages
      : DEFAULT_MOLD_AGES,
  };
}

export function moldAgesFromSettings(settings: { default_mold_ages: number[] }): number[] {
  return Array.from(new Set(settings.default_mold_ages.filter((a) => Number.isFinite(a) && a > 0))).sort((a, b) => a - b);
}

export function ageLabel(age: number): string {
  return `آزمون ${age} روزه`;
}