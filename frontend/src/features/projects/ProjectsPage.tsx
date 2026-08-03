import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { GridColDef } from '@mui/x-data-grid';
import { Stack } from '@mui/material';
import { CrudFeature } from '../../shared/components/CrudFeature';
import { projectApi } from '../../core/services/projects';
import type { Project } from '../../core/types';
import { useApp } from '../../core/contexts/AppContext';
import { useAuth } from '../../core/auth/AuthContext';
import { canWrite } from '../../core/auth/roles';
import { StatusChip } from '../../shared/components/StatusChip';
import { formatDate, formatNumber } from '../../core/utils/format';
import { TextInput, NumberInput, SelectInput, DateField } from '../../shared/components/form/FormField';
import { FormActions } from '../../shared/components/form/FormActions';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const schema = z.object({
  project_name: z.string().min(1, 'نام پروژه الزامی است'),
  file_number: z.string().min(1, 'شماره پرونده الزامی است'),
  client_name: z.string().optional(),
  client_phone_number: z.string().optional(),
  supervisor_name: z.string().optional(),
  supervisor_phone_number: z.string().optional(),
  requester_name: z.string().optional(),
  requester_phone_number: z.string().optional(),
  municipality_zone: z.string().optional(),
  address: z.string().optional(),
  project_usage_type: z.string().optional(),
  floor_count: z.coerce.number().optional(),
  occupied_area: z.coerce.number().optional(),
  contract_price: z.coerce.number().optional(),
  test_type: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  contractor_name: z.string().optional(),
  consultant_name: z.string().optional(),
  contract_number: z.string().optional(),
  responsible_engineer: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ProjectsPage() {
  const { t } = useApp();
  const { role } = useAuth();
  const navigate = useNavigate();
  const writable = canWrite(role, 'projects');

  const realColumns: GridColDef<Project>[] = [
    { field: 'code', headerName: 'کد', width: 110 },
    { field: 'project_name', headerName: 'نام پروژه', width: 220 },
    { field: 'client_name', headerName: 'کارفرما', width: 150 },
    { field: 'supervisor_name', headerName: 'ناظر', width: 130 },
    { field: 'status', headerName: 'وضعیت', width: 130, renderCell: (p) => <StatusChip value={p.value as string} /> },
    { field: 'priority', headerName: 'اولویت', width: 100, renderCell: (p) => <StatusChip value={p.value as string} /> },
    { field: 'floor_count', headerName: 'طبقات', width: 80 },
    { field: 'contract_price', headerName: 'قرارداد', width: 130, renderCell: (p) => formatNumber(p.value as string) },
    { field: 'created_at', headerName: 'تاریخ ایجاد', width: 150, renderCell: (p) => formatDate(p.value as string) },
  ];

  return (
    <CrudFeature<Project>
      queryKey={['projects']}
      title={t('nav.projects')}
      fetcher={projectApi.list}
      removeFn={writable ? projectApi.remove : undefined}
      columns={realColumns}
      createEnabled={writable}
      updateEnabled={writable}
      deleteEnabled={writable}
      onRowClick={(row) => navigate(`/projects/${row.id}`)}
      renderForm={({ record, onClose }) => (
        <ProjectForm record={record} onClose={onClose} queryKey={['projects']} />
      )}
    />
  );
}

function ProjectForm({
  record,
  onClose,
  queryKey,
}: {
  record: Project | null;
  onClose: () => void;
  queryKey: string[];
}) {
  const { t } = useApp();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: (record ?? {}) as FormValues,
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      record ? projectApi.update(record.id, data as Partial<Project>) : projectApi.create(data as Partial<Project>),
    onSuccess: () => {
      enqueueSnackbar(record ? t('messages.updated') : t('messages.created'), { variant: 'success' });
      queryClient.invalidateQueries({ queryKey });
      onClose();
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: 'error' }),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))}>
        <Stack gap={2}>
          <TextInput<FormValues> name="project_name" label="نام پروژه" required />
          <TextInput<FormValues> name="file_number" label="شماره پرونده" required />
          <Stack direction="row" gap={2}>
            <TextInput<FormValues> name="client_name" label="نام کارفرما" />
            <TextInput<FormValues> name="client_phone_number" label="تلفن کارفرما" />
          </Stack>
          <Stack direction="row" gap={2}>
            <TextInput<FormValues> name="supervisor_name" label="نام ناظر" />
            <TextInput<FormValues> name="supervisor_phone_number" label="تلفن ناظر" />
          </Stack>
          <Stack direction="row" gap={2}>
            <TextInput<FormValues> name="requester_name" label="درخواست‌دهنده" />
            <TextInput<FormValues> name="requester_phone_number" label="تلفن درخواست‌دهنده" />
          </Stack>
          <Stack direction="row" gap={2}>
            <SelectInput<FormValues>
              name="status"
              label="وضعیت"
              options={[
                { value: 'active', label: 'فعال' },
                { value: 'on_hold', label: 'متوقف' },
                { value: 'completed', label: 'تکمیل شده' },
                { value: 'cancelled', label: 'لغو شده' },
              ]}
            />
            <SelectInput<FormValues>
              name="priority"
              label="اولویت"
              options={[
                { value: 'low', label: 'کم' },
                { value: 'medium', label: 'متوسط' },
                { value: 'high', label: 'زیاد' },
                { value: 'urgent', label: 'فوری' },
              ]}
            />
          </Stack>
          <Stack direction="row" gap={2}>
            <TextInput<FormValues> name="contractor_name" label="پیمانکار" />
            <TextInput<FormValues> name="consultant_name" label="مشاور" />
          </Stack>
          <Stack direction="row" gap={2}>
            <TextInput<FormValues> name="municipality_zone" label="منطقه شهرداری" />
            <TextInput<FormValues> name="project_usage_type" label="کاربری" />
          </Stack>
          <Stack direction="row" gap={2}>
            <NumberInput<FormValues> name="floor_count" label="طبقات" />
            <NumberInput<FormValues> name="occupied_area" label="سطح زیربنا" />
            <NumberInput<FormValues> name="contract_price" label="مبلغ قرارداد" />
          </Stack>
          <Stack direction="row" gap={2}>
            <TextInput<FormValues> name="contract_number" label="شماره قرارداد" />
            <TextInput<FormValues> name="responsible_engineer" label="مهندس مسئول" />
          </Stack>
          <Stack direction="row" gap={2}>
            <DateField<FormValues> name="start_date" label="تاریخ شروع" />
            <DateField<FormValues> name="end_date" label="تاریخ پایان" />
          </Stack>
          <TextInput<FormValues> name="address" label="آدرس" multiline rows={2} />
          <TextInput<FormValues> name="notes" label="یادداشت" multiline rows={2} />
          <FormActions onCancel={onClose} loading={mutation.isPending} />
        </Stack>
      </form>
    </FormProvider>
  );
}