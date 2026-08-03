export type Role =
  | 'admin'
  | 'lab_manager'
  | 'quality_manager'
  | 'engineer'
  | 'technician'
  | 'reception'
  | 'client'
  | 'readonly'
  | 'factory_manager'
  | 'supervisor';

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiErrorBody {
  error: { code: string; message: unknown };
}

export interface LoginRequest {
  username: string;
  password: string;
}
export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: Role;
  phone_number?: string;
  lab_code?: string;
  lab_name?: string;
  lab_mobile_number?: string;
  lab_address?: string;
  province?: string;
  city?: string;
  lab_phone_number?: string;
  telegram_id?: string;
  factory_name?: string;
  factory_address?: string;
  factory_phone_number?: string;
}

export interface LabProfile {
  id: number;
  lab_name: string;
  lab_phone_number: string;
  lab_mobile_number: string;
  lab_address: string;
  province: string;
  city: string;
  telegram_id: string | null;
  first_name?: string;
  last_name?: string;
  email?: string;
  user: number;
  lab_code?: string;
}

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  role_display: string;
  is_staff?: boolean;
  is_active?: boolean;
  date_joined?: string;
  lab_profile: LabProfile | null;
  tickets?: Ticket[];
}

export interface FullUserData {
  user: User;
  projects: Project[];
}

export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Project {
  id: number;
  owner: number;
  code: string;
  created_at: string;
  updated_at: string;
  file_number: string;
  project_name: string;
  client_name: string;
  client_phone_number: string;
  supervisor_name: string;
  supervisor_phone_number: string;
  requester_name: string;
  requester_phone_number: string;
  municipality_zone: string;
  address: string;
  project_usage_type: string;
  floor_count: number;
  test_type: string;
  occupied_area: number;
  contract_price: string;
  client: number | null;
  contractor_name: string;
  consultant_name: string;
  description: string;
  contract_number: string;
  start_date: string | null;
  end_date: string | null;
  status: ProjectStatus;
  priority: Priority;
  responsible_engineer: string;
  notes: string;
  client_user: number | null;
  supervisor_user: number | null;
  factory: number | null;
  created_by: number | null;
  status_display?: string;
  priority_display?: string;
  factory_name?: string | null;
  client_company?: string | null;
  samples?: Sample[];
  transactions?: Transaction[];
  total_income?: number;
  total_expense?: number;
  balance?: number;
}

export type SampleStatus =
  | 'created'
  | 'received'
  | 'waiting'
  | 'stored'
  | 'curing'
  | 'ready_for_test'
  | 'testing'
  | 'completed'
  | 'reported'
  | 'archived'
  | 'cancelled';

export interface Sample {
  id: number;
  project: number;
  code: string;
  barcode: string;
  qr_token: string;
  date: string;
  casting_date: string | null;
  sampling_date: string | null;
  receiving_date: string | null;
  status: SampleStatus;
  status_display?: string;
  current_location: string;
  sampling_volume: number;
  cement_grade: string;
  cement_type: string;
  category: string;
  weather_condition: string;
  ambient_temperature: number;
  concrete_factory: string;
  specimen_type: string;
  specimen_size: string;
  sampling_location: string;
  concrete_production_method: string;
  sample_type: number | null;
  sample_type_name?: string | null;
  weight: number | null;
  dimensions: Record<string, unknown>;
  description: string;
  technician: number | null;
  responsible_engineer: number | null;
  received_by: number | null;
  age_in_days?: number | null;
  series?: SamplingSeries[];
}

export interface SamplingSeries {
  id: number;
  sample: number;
  name: string;
  concrete_temperature: number;
  concrete_temperature_image: string | null;
  slump: number;
  slump_image: string | null;
  axis: string;
  has_additive: boolean;
  molds?: Mold[];
  photos?: SamplingSeriesPhoto[];
}

export interface SamplingSeriesPhoto {
  id: number;
  series: number;
  image: string;
  created_at: string;
}

export interface Mold {
  id: number;
  series: number;
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
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: number;
  project: number;
  type: TransactionType;
  description: string;
  amount: string;
  date: string;
}

export interface Ticket {
  id: number;
  title: string;
  user: number;
  username: string;
  status: 'open' | 'in_progress' | 'closed';
  status_display: string;
  priority: 'low' | 'medium' | 'high';
  priority_display: string;
  created_at: string;
  updated_at: string;
  messages: TicketMessage[];
}

export interface TicketMessage {
  id: number;
  ticket: number;
  user: number;
  username: string;
  message: string;
  created_at: string;
}

export type ClientType = 'company' | 'government' | 'private';

export interface Client {
  id: number;
  client_type: ClientType;
  name: string;
  contact_person: string;
  phone_number: string;
  email: string;
  address: string;
  tax_id: string;
  notes: string;
  created_by: number | null;
  created_at: string;
}

export interface Factory {
  id: number;
  name: string;
  manager: number | null;
  manager_username: string | null;
  phone_number: string;
  address: string;
  created_at: string;
}

export interface SampleType {
  id: number;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
}

export interface TestType {
  id: number;
  code: string;
  name: string;
  category: string;
  category_display: string;
  unit: string;
  method_reference: string;
  params_schema: unknown[];
  is_active: boolean;
}

export interface AcceptanceCriteria {
  id: number;
  name: string;
  test_type: number | null;
  test_type_name: string | null;
  standard_name: string;
  params: Record<string, unknown>;
  is_active: boolean;
}

export type LabRequestStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface LabRequest {
  id: number;
  request_number: string;
  project: number;
  project_name: string;
  priority: Priority;
  priority_display: string;
  requested_tests: number[];
  requested_tests_detail: TestType[];
  due_date: string | null;
  requested_by: number | null;
  requested_by_username: string | null;
  approved_by: number | null;
  status: LabRequestStatus;
  status_display: string;
  comments: string;
  created_at: string;
  updated_at: string;
}

export type EquipmentStatus = 'active' | 'maintenance' | 'out_of_service' | 'retired';

export interface Equipment {
  id: number;
  code: string;
  name: string;
  manufacturer: string;
  model: string;
  serial_number: string;
  calibration_date: string | null;
  next_calibration_date: string | null;
  status: EquipmentStatus;
  notes: string;
  is_usable: boolean;
  is_calibration_expired: boolean;
  created_at: string;
}

export interface MaintenanceRecord {
  id: number;
  equipment: number;
  maintenance_type: 'calibration' | 'maintenance' | 'repair';
  date: string;
  technician: number | null;
  technician_username: string | null;
  next_due_date: string | null;
  notes: string;
}

export interface CuringTank {
  id: number;
  code: string;
  name: string;
  capacity: number | null;
  water_temperature: number | null;
  location: string;
  notes: string;
  is_active: boolean;
  current_sample_count?: number;
}

export interface CuringRecord {
  id: number;
  tank: number;
  tank_name: string;
  sample: number;
  sample_code: string;
  entry_date: string;
  exit_date: string | null;
  operator: number | null;
  notes: string;
}

export type ReportStatus = 'draft' | 'reviewed' | 'approved' | 'rejected';

export interface ReportRevision {
  id: number;
  report: number;
  version: number;
  content: Record<string, unknown>;
  changed_by: number | null;
  changed_by_username: string | null;
  notes: string;
  created_at: string;
}

export interface Report {
  id: number;
  report_number: string;
  project: number;
  project_name: string;
  sample: number | null;
  sample_code: string | null;
  title: string;
  description: string;
  status: ReportStatus;
  status_display: string;
  version: number;
  content: Record<string, unknown>;
  qr_verify_token: string;
  digital_signature: Record<string, unknown>;
  created_by: number | null;
  created_by_username: string | null;
  reviewed_by: number | null;
  approved_by: number | null;
  approved_by_username: string | null;
  reviewed_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  revisions: ReportRevision[];
}

export type TestResultStatus = 'pending' | 'approved' | 'rejected';
export type TestExecutionStatus = 'planned' | 'in_progress' | 'completed';

export interface TestExecution {
  id: number;
  sample: number;
  sample_code: string;
  test_type: number;
  test_type_name: string;
  lab_request: number | null;
  operator: number | null;
  operator_username: string | null;
  machine: number | null;
  machine_name: string | null;
  start_time: string;
  finish_time: string | null;
  temperature: number | null;
  humidity: number | null;
  measured_values: Record<string, unknown>;
  calculated_values: Record<string, unknown>;
  result: number | null;
  result_status: TestResultStatus;
  result_status_display: string;
  status: TestExecutionStatus;
  status_display: string;
  notes: string;
  approved_by: number | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export type NotificationType =
  | 'sample_ready'
  | 'late_test'
  | 'equipment_calibration'
  | 'report_approved'
  | 'report_reviewed'
  | 'project_update'
  | 'general';

export interface AppNotification {
  id: number;
  user: number;
  ntype: NotificationType;
  ntype_display: string;
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

export type FileContentType =
  | 'project'
  | 'sample'
  | 'report'
  | 'testexecution'
  | 'labrequest'
  | 'equipment';

export interface AppFile {
  id: number;
  content_type: FileContentType;
  object_id: number;
  file: string;
  url: string;
  file_type: string;
  original_name: string;
  uploaded_by: number | null;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  user: number | null;
  username: string | null;
  action: string;
  content_type: string;
  object_id: number | null;
  object_repr: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  ip: string | null;
  created_at: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  role: Role;
  role_display: string;
  date_joined: string;
}

export interface DashboardStats {
  projects: { total: number; active: number; completed: number };
  samples: { total: number; today: number; waiting: number; completed: number };
  tests: { today: number; pending: number; completed: number; late: number };
  reports: { draft: number; reviewed: number; approved: number };
  equipment: { active: number; calibration_due: number };
  curing_tanks: { total: number };
  notifications: { unread: number };
  activity: { monthly_tests: number; monthly_samples: number };
}

export interface QcStatistics {
  count: number;
  mean: number | null;
  stdev: number | null;
  cv_percent: number | null;
  min: number | null;
  max: number | null;
  outliers: number[];
}

export interface QcAnalysis {
  sample: number;
  sample_code: string;
  test_type: number | null;
  values: number[];
  statistics: QcStatistics;
  criteria: { id: number; name: string } | null;
  compliance: { passed: boolean; checks: { rule: string; passed: boolean; limit?: number; value?: number }[] };
}
