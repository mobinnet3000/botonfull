import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { CrudFeature } from '../../shared/components/CrudFeature';
import { sampleApi } from '../../core/services/samples';
import { projectApi } from '../../core/services/projects';
import type { Sample } from '../../core/types';
import { useApp } from '../../core/contexts/AppContext';
import { useAuth } from '../../core/auth/AuthContext';
import { canWrite } from '../../core/auth/roles';
import { StatusChip } from '../../shared/components/StatusChip';
import { formatJalali } from '../../core/utils/jalali';
import { TextInput, NumberInput, SelectInput, DateTimeField } from '../../shared/components/form/FormField';
import { FormActions } from '../../shared/components/form/FormActions';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

const schema = z.object({
  project: z.any().refine((v) => Number(v) > 0, 'انتخاب پروژه الزامی است'),
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
    { field: 'project_name', headerName: 'پروژه', width: 180 },
    { field: 'cement_grade', headerName: 'عیار', width: 90 },
    { field: 'specimen_type', headerName: 'نوع نمونه', width: 120 },
    { field: 'status', headerName: 'وضعیت', width: 140, renderCell: (p) => <StatusChip value={p.value as string} /> },
    { field: 'sampling_volume', headerName: 'حجم', width: 90 },
    { field: 'date', headerName: 'تاریخ', width: 150, renderCell: (p) => formatJalali(p.value as string, true) },
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
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const { data: projectsData } = useQuery({ queryKey: ['projects-for-sample-form'], queryFn: () => projectApi.list({ page_size: 200 }), staleTime: 60_000 });
  const projects = projectsData?.results ?? [];

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      project: record?.project ?? '',
      date: record?.date ?? dayjs().toISOString(),
      sampling_volume: record?.sampling_volume ?? 70,
      cement_grade: record?.cement_grade ?? '350',
      cement_type: record?.cement_type ?? 'تیپ 1',
      category: record?.category ?? '',
      weather_condition: record?.weather_condition ?? 'آفتابی',
      ambient_temperature: record?.ambient_temperature ?? 25,
      concrete_factory: record?.concrete_factory ?? '',
      specimen_type: record?.specimen_type ?? 'cube',
      specimen_size: record?.specimen_size ?? 'cube_15',
      sampling_location: record?.sampling_location ?? 'کارگاه',
      status: record?.status ?? 'created',
      current_location: record?.current_location ?? '',
      description: record?.description ?? '',
      weight: record?.weight ?? undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: (d: FormValues) => {
      const payload: Partial<Sample> = {
        project: Number(d.project),
        date: d.date ?? dayjs().toISOString(),
        sampling_volume: d.sampling_volume ?? 70,
        cement_grade: d.cement_grade || '350',
        cement_type: d.cement_type ?? 'تیپ 1',
        category: d.category || 'عمومی',
        weather_condition: d.weather_condition || 'آفتابی',
        ambient_temperature: d.ambient_temperature ?? 25,
        concrete_factory: d.concrete_factory || '---',
        specimen_type: d.specimen_type ?? 'cube',
        specimen_size: d.specimen_size ?? 'cube_15',
        sampling_location: d.sampling_location || 'کارگاه',
        status: (d.status as Sample['status']) ?? 'created',
        current_location: d.current_location ?? '',
        description: d.description ?? '',
        weight: d.weight ?? null,
      };
      return record ? sampleApi.update(record.id, payload) : sampleApi.create(payload);
    },
    onSuccess: () => {
      enqueueSnackbar(record ? 'نمونه به‌روزرسانی شد' : 'نمونه ایجاد شد', { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['samples'] });
      onClose();
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: 'error' }),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))}>
        <Stack gap={2}>
          <SelectInput<FormValues>
            name="project"
            label="پروژه (الزامی)"
            options={projects.map((p) => ({ value: p.id, label: p.project_name }))}
          />
          <DateTimeField<FormValues> name="date" label="تاریخ نمونه" />
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
          <Stack direction="row" gap={2}>
            <TextInput<FormValues> name="current_location" label="محل فعلی" />
            <TextInput<FormValues> name="concrete_factory" label="کارخانه بتن" />
          </Stack>
          <TextInput<FormValues> name="weather_condition" label="وضعیت جوی" />
          <TextInput<FormValues> name="sampling_location" label="محل نمونه‌برداری" />
          <TextInput<FormValues> name="description" label="توضیحات" multiline rows={2} />
          <FormActions onCancel={onClose} loading={mutation.isPending} />
        </Stack>
      </form>
    </FormProvider>
  );
}