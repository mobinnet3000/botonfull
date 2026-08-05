// Hierarchy Types for Laboratory Workflow
// Project -> StructuralMember -> PourSeries -> Mold

export type StructuralMemberType = 'foundation' | 'column' | 'beam' | 'wall' | 'slab' | 'stair' | 'other';
export type MoldStatus = 'pending' | 'in_progress' | 'completed' | 'rejected' | 'overdue';
export type MoldPriority = 'low' | 'medium' | 'high' | 'urgent';

// Structural Member Interface
export interface StructuralMember {
  id: number;
  project: number;
  name: string;
  member_type: StructuralMemberType;
  description: string;
  created_at: string;
  updated_at: string;
  member_type_display?: string;
  project_name?: string;
  pour_count?: number;
  mold_count?: number;
  pour_series?: PourSeries[];
}

// Pour Series Interface
export interface PourSeries {
  id: number;
  structural_member: number;
  name: string;
  pour_date: string;
  concrete_temperature: number;
  concrete_temperature_image: string | null;
  slump: number;
  slump_image: string | null;
  axis: string;
  has_additive: boolean;
  truck_number: string;
  batch_number: string;
  sample: number | null;
  notes: string;
  created_at: string;
  updated_at: string;
  
  // Related fields
  structural_member_name?: string;
  structural_member_type?: string;
  project_id?: number;
  project_name?: string;
  
  // Summary fields
  total_molds?: number;
  completed_molds?: number;
  overdue_molds?: number;
  due_today_molds?: number;
  next_due_date?: string | null;
  
  molds?: Mold[];
}

// Project Settings Interface
export interface ProjectSettings {
  id: number;
  project: number;
  default_mold_ages: number[];
  default_mold_count: number;
  pour_name_prefix: string;
  member_name_prefix: string;
  use_auto_numbering: boolean;
  next_pour_number: number;
  next_member_number: number;
  custom_age_labels: Record<string, string>;
  created_at: string;
  updated_at: string;
}

// Extended Mold Interface with hierarchy info
export interface Mold {
  id: number;
  pour_series: number;
  age_in_days: number;
  mass: number | null;
  breaking_load: number | null;
  created_at: string;
  completed_at: string | null;
  deadline: string;
  sample_identifier: string;
  extra_data: Record<string, unknown>;
  pre_break_image: string | null;
  post_break_image: string | null;
  is_done: boolean;
  is_overdue: boolean;
  is_due_today: boolean;
  is_due_tomorrow: boolean;
  
  // Status and priority
  status: MoldStatus;
  priority: MoldPriority;
  technician: number | null;
  failure_type: string;
  test_notes: string;
  
  // Related fields
  pour_series_id?: number;
  pour_series_name?: string;
  structural_member_id?: number;
  structural_member_name?: string;
  project_id?: number;
  project_name?: string;
  status_display?: string;
  priority_display?: string;
  technician_name?: string | null;
}

// Summary types for hierarchy
export interface PourSummary {
  total: number;
  dueToday: number;
  tested: number;
  overdue: number;
  nextDue: string | null;
  nextDueLabel: string;
}

export interface MemberSummary {
  id: number;
  name: string;
  type: StructuralMemberType;
  pour_count: number;
  mold_count: number;
  completed_molds: number;
  overdue_molds: number;
  due_today_molds: number;
  next_due_label: string;
}

export interface ProjectHierarchySummary {
  project_id: number;
  project_name: string;
  structural_members: MemberSummary[];
  total_pours: number;
  total_molds: number;
  completed_molds: number;
  overdue_molds: number;
  due_today_molds: number;
}
