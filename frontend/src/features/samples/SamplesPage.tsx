import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { CrudFeature } from '../../shared/components/CrudFeature';
import { sampleApi } from '../../core/services/samples';
import type { Sample } from '../../core/types';
import { useApp } from '../../core/contexts/AppContext';
import { useAuth } from '../../core/auth/AuthContext';
import { canWrite } from '../../core/auth/roles';
import { StatusChip } from '../../shared/components/StatusChip';
import { formatDate } from '../../core/utils/format';
import { TextInput, NumberInput, SelectInput, DateTimeField } from '../../shared/components/form/FormField';
import { FormActions } from '../../shared/components/form/FormActions';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const schema = z.object({
  project: z.any(),
  date: z.string().optional(),
  sampling_volume: z.coerce.number().optional(),
  cement_grade: z.string().optional(),
  cement_type: z.string().optional(),
  category: z.string().optional(),
  weather_condition: z.string().optional(),
  ambient_temperature: z.coerce.number().optional(),
  concrete_factory: z.string().optional(),
  specimen_type: z.string().optional(),
  specimen_size: z.string().optional(),
  sampling_location: z.string().optional(),
  status: z.string().optional(),
  current_location: z.string().optional(),
  description: z.string().optional(),
  weight: z.coerce.number().optional(),
});
type FormValues = z.infer<typeof schema>;

const SAMPLE_STATUS_OPTIONS = [
  { value: 'created', label: 'ایجاد شده' },
  { value: 'received', label: 'دریافت شده' },
  { value: 'waiting', label: 'در انتظار' },
  { value: 'stored', label: 'نگهداری' },
  { value: 'curing', label: 'عمل‌آوری' },
  { value: 'ready_for_test', label: 'آماده آزمون' },
  { value: 'testing', label: 'در حال آزمون' },
  { value: 'completed', label: 'تکمیل شده' },
  { value: 'reported', label: 'گزارش شده' },
  { value: 'archived', label: 'بایگانی' },
  { value: 'cancelled', label: 'لغو شده' },
];

export default function SamplesPage() {
  const { t } = useApp();
  const { role } = useAuth();
  const navigate = useNavigate();
  const writable = canWrite(role, 'samples');

  const columns: GridColDef<Sample>[] = [
    { field: 'code', headerName: 'کد', width: 150 },
    { field: 'category', headerName: 'رده', width: 130 },
    { field: 'project', headerName: 'پروژه', width: 90, renderCell: (p) => `#${p.value}` },
    { field: 'cement_grade', headerName: 'عیار', width: 90 },
    { field: 'specimen_type', headerName: 'نوع نمونه', width: 120 },
    { field: 'status', headerName: 'وضعیت', width: 140, renderCell: (p) => <StatusChip value={p.value as string} /> },
    { field: 'sampling_volume', headerName: 'حجم', width: 90 },
    { field: 'date', headerName: 'تاریخ', width: 160, renderCell: (p) => formatDate(p.value as string, true) },
  ];

  return (
    <CrudFeature<Sample>
      queryKey={['samples']}
      title={t('nav.samples')}
      fetcher={sampleApi.list}
      removeFn={writable ? sampleApi.remove : undefined}
      columns={columns}
      createEnabled={writable}
      updateEnabled={writable}
      deleteEnabled={writable}
      onRowClick={(row) => navigate(`/samples/${row.id}`)}
      renderForm={({ record, onClose }) => <SampleForm record={record} onClose={onClose} />}
    />
  );
}

function SampleForm({ record, onClose }: { record: Sample | null; onClose: () => void }) {
  const { t } = useApp();
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: (record ?? {}) as FormValues,
  });
  const mutation = useMutation({
    mutationFn: (d: FormValues) =>
      record ? sampleApi.update(record.id, d as Partial<Sample>) : sampleApi.create(d as Partial<Sample>),
    onSuccess: () => {
      enqueueSnackbar(t('messages.updated'), { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['samples'] });
      onClose();
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: 'error' }),
  });
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))}>
        <Stack gap={2}>
          <NumberInput<FormValues> name="project" label="شناسه پروژه" />
          <DateTimeField<FormValues> name="date" label="تاریخ" />
          <Stack direction="row" gap={2}>
            <TextInput<FormValues> name="category" label="رده" />
            <TextInput<FormValues> name="cement_grade" label="عیار سیمان" />
          </Stack>
          <Stack direction="row" gap={2}>
            <SelectInput<FormValues>
              name="specimen_type"
              label="نوع نمونه"
              options={[
                { value: 'cube', label: 'مکعبی' },
                { value: 'cylinder', label: 'استوانه‌ای' },
              ]}
            />
            <SelectInput<FormValues>
              name="specimen_size"
              label="سایز"
              options={[
                { value: 'cube_15', label: '15x15x15' },
                { value: 'cyl_300_150', label: '300x150' },
                { value: 'cyl_200_100', label: '200x100' },
              ]}
            />
          </Stack>
          <Stack direction="row" gap={2}>
            <NumberInput<FormValues> name="sampling_volume" label="حجم بتن‌ریزی" />
            <NumberInput<FormValues> name="ambient_temperature" label="دمای محیط" />
            <NumberInput<FormValues> name="weight" label="وزن (kg)" />
          </Stack>
          <SelectInput<FormValues> name="status" label="وضعیت" options={SAMPLE_STATUS_OPTIONS} />
          <TextInput<FormValues> name="current_location" label="محل فعلی" />
          <TextInput<FormValues> name="concrete_factory" label="کارخانه بتن" />
          <TextInput<FormValues> name="weather_condition" label="وضعیت جوی" />
          <TextInput<FormValues> name="sampling_location" label="محل نمونه‌برداری" />
          <TextInput<FormValues> name="description" label="توضیحات" multiline rows={2} />
          <FormActions onCancel={onClose} loading={mutation.isPending} />
        </Stack>
      </form>
    </FormProvider>
  );
}