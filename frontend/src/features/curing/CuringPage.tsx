import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { CrudFeature } from '../../shared/components/CrudFeature';
import { curingTankApi, curingRecordApi } from '../../core/services/domain';
import type { CuringTank, CuringRecord } from '../../core/types';
import { useApp } from '../../core/contexts/AppContext';
import { useAuth } from '../../core/auth/AuthContext';
import { canWrite } from '../../core/auth/roles';
import { formatDate } from '../../core/utils/format';
import { TextInput, NumberInput, DateField, DateTimeField } from '../../shared/components/form/FormField';
import { FormActions } from '../../shared/components/form/FormActions';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const tankSchema = z.object({
  code: z.string().min(1, 'کد الزامی است'),
  name: z.string().min(1, 'نام الزامی است'),
  capacity: z.coerce.number().optional(),
  water_temperature: z.coerce.number().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  is_active: z.boolean().optional(),
});
type TankValues = z.infer<typeof tankSchema>;

const recordSchema = z.object({
  tank: z.any(),
  sample: z.any(),
  entry_date: z.string().optional(),
  exit_date: z.string().nullable().optional(),
  notes: z.string().optional(),
});
type RecordValues = z.infer<typeof recordSchema>;

export default function CuringPage() {
  const { t } = useApp();
  const { role } = useAuth();
  const writable = canWrite(role, 'curing');

  const tankColumns: GridColDef<CuringTank>[] = [
    { field: 'code', headerName: 'کد', width: 110 },
    { field: 'name', headerName: 'نام مخزن', width: 200 },
    { field: 'capacity', headerName: 'ظرفیت', width: 100 },
    { field: 'water_temperature', headerName: 'دمای آب', width: 110, renderCell: (p) => (p.value === null ? '—' : `${p.value}°C`) },
    { field: 'current_sample_count', headerName: 'نمونه فعلی', width: 120 },
    { field: 'is_active', headerName: 'فعال', width: 80, renderCell: (p) => (p.value ? 'بله' : 'خیر') },
  ];

  const recordColumns: GridColDef<CuringRecord>[] = [
    { field: 'sample_code', headerName: 'نمونه', width: 140 },
    { field: 'tank_name', headerName: 'مخزن', width: 180 },
    { field: 'entry_date', headerName: 'ورود', width: 170, renderCell: (p) => formatDate(p.value as string, true) },
    { field: 'exit_date', headerName: 'خروج', width: 170, renderCell: (p) => formatDate(p.value as string, true) },
    { field: 'notes', headerName: 'یادداشت', width: 220 },
  ];

  return (
    <Stack gap={4}>
      <CrudFeature<CuringTank>
        queryKey={['curing-tanks']}
        title={t('nav.curing')}
        fetcher={curingTankApi.list}
        removeFn={writable ? curingTankApi.remove : undefined}
        columns={tankColumns}
        createEnabled={writable}
        updateEnabled={writable}
        deleteEnabled={writable}
        renderForm={({ record, onClose }) => <TankForm record={record} onClose={onClose} />}
      />
      <CrudFeature<CuringRecord>
        queryKey={['curing-records']}
        title="رکوردهای عمل‌آوری"
        fetcher={curingRecordApi.list}
        removeFn={writable ? curingRecordApi.remove : undefined}
        columns={recordColumns}
        createEnabled={writable}
        updateEnabled={writable}
        deleteEnabled={writable}
        renderForm={({ record, onClose }) => <RecordForm record={record} onClose={onClose} />}
      />
    </Stack>
  );
}

function TankForm({ record, onClose }: { record: CuringTank | null; onClose: () => void }) {
  const { t } = useApp();
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const methods = useForm<TankValues>({
    resolver: zodResolver(tankSchema),
    defaultValues: (record ?? {}) as TankValues,
  });
  const mutation = useMutation({
    mutationFn: (d: TankValues) =>
      record ? curingTankApi.update(record.id, d as Partial<CuringTank>) : curingTankApi.create(d as Partial<CuringTank>),
    onSuccess: () => {
      enqueueSnackbar(t('messages.updated'), { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['curing-tanks'] });
      onClose();
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: 'error' }),
  });
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))}>
        <Stack gap={2}>
          <TextInput<TankValues> name="code" label="کد" required />
          <TextInput<TankValues> name="name" label="نام مخزن" required />
          <Stack direction="row" gap={2}>
            <NumberInput<TankValues> name="capacity" label="ظرفیت" />
            <NumberInput<TankValues> name="water_temperature" label="دمای آب" />
          </Stack>
          <TextInput<TankValues> name="location" label="موقعیت" />
          <TextInput<TankValues> name="notes" label="یادداشت" multiline rows={2} />
          <FormActions onCancel={onClose} loading={mutation.isPending} />
        </Stack>
      </form>
    </FormProvider>
  );
}

function RecordForm({ record, onClose }: { record: CuringRecord | null; onClose: () => void }) {
  const { t } = useApp();
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const methods = useForm<RecordValues>({
    resolver: zodResolver(recordSchema),
    defaultValues: (record ?? {}) as RecordValues,
  });
  const mutation = useMutation({
    mutationFn: (d: RecordValues) =>
      record
        ? curingRecordApi.update(record.id, d as Partial<CuringRecord>)
        : curingRecordApi.create(d as Partial<CuringRecord>),
    onSuccess: () => {
      enqueueSnackbar(t('messages.updated'), { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['curing-records'] });
      onClose();
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: 'error' }),
  });
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))}>
        <Stack gap={2}>
          <NumberInput<RecordValues> name="tank" label="شناسه مخزن" />
          <NumberInput<RecordValues> name="sample" label="شناسه نمونه" />
          <DateTimeField<RecordValues> name="entry_date" label="تاریخ ورود" />
          <DateTimeField<RecordValues> name="exit_date" label="تاریخ خروج" />
          <TextInput<RecordValues> name="notes" label="یادداشت" multiline rows={2} />
          <FormActions onCancel={onClose} loading={mutation.isPending} />
        </Stack>
      </form>
    </FormProvider>
  );
}