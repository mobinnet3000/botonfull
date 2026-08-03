import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack, Chip } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { CrudFeature } from '../../shared/components/CrudFeature';
import { equipmentApi } from '../../core/services/domain';
import type { Equipment } from '../../core/types';
import { useApp } from '../../core/contexts/AppContext';
import { useAuth } from '../../core/auth/AuthContext';
import { canWrite } from '../../core/auth/roles';
import { StatusChip } from '../../shared/components/StatusChip';
import { formatDate } from '../../core/utils/format';
import { TextInput, SelectInput, DateField } from '../../shared/components/form/FormField';
import { FormActions } from '../../shared/components/form/FormActions';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const schema = z.object({
  code: z.string().min(1, 'کد الزامی است'),
  name: z.string().min(1, 'نام الزامی است'),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  calibration_date: z.string().nullable().optional(),
  next_calibration_date: z.string().nullable().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function EquipmentPage() {
  const { t } = useApp();
  const { role } = useAuth();
  const writable = canWrite(role, 'equipment');

  const columns: GridColDef<Equipment>[] = [
    { field: 'code', headerName: 'کد', width: 110 },
    { field: 'name', headerName: 'نام دستگاه', width: 220 },
    { field: 'manufacturer', headerName: 'سازنده', width: 150 },
    { field: 'model', headerName: 'مدل', width: 130 },
    { field: 'status', headerName: 'وضعیت', width: 130, renderCell: (p) => <StatusChip value={p.value as string} /> },
    {
      field: 'is_calibration_expired',
      headerName: 'کالیبراسیون',
      width: 120,
      renderCell: (p) =>
        p.value ? <Chip size="small" color="error" label="منقضی" /> : <Chip size="small" color="success" label="معتبر" />,
    },
    {
      field: 'next_calibration_date',
      headerName: 'کالیبراسیون بعدی',
      width: 150,
      renderCell: (p) => formatDate(p.value as string),
    },
  ];

  return (
    <CrudFeature<Equipment>
      queryKey={['equipment']}
      title={t('nav.equipment')}
      fetcher={equipmentApi.list}
      removeFn={writable ? equipmentApi.remove : undefined}
      columns={columns}
      createEnabled={writable}
      updateEnabled={writable}
      deleteEnabled={writable}
      renderForm={({ record, onClose }) => <EquipmentForm record={record} onClose={onClose} />}
    />
  );
}

function EquipmentForm({ record, onClose }: { record: Equipment | null; onClose: () => void }) {
  const { t } = useApp();
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: (record ?? {}) as FormValues,
  });
  const mutation = useMutation({
    mutationFn: (d: FormValues) =>
      record ? equipmentApi.update(record.id, d as Partial<Equipment>) : equipmentApi.create(d as Partial<Equipment>),
    onSuccess: () => {
      enqueueSnackbar(t('messages.updated'), { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['equipment'] });
      onClose();
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: 'error' }),
  });
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))}>
        <Stack gap={2}>
          <Stack direction="row" gap={2}>
            <TextInput<FormValues> name="code" label="کد" required />
            <TextInput<FormValues> name="name" label="نام دستگاه" required />
          </Stack>
          <Stack direction="row" gap={2}>
            <TextInput<FormValues> name="manufacturer" label="سازنده" />
            <TextInput<FormValues> name="model" label="مدل" />
          </Stack>
          <Stack direction="row" gap={2}>
            <TextInput<FormValues> name="serial_number" label="شماره سریال" />
            <SelectInput<FormValues>
              name="status"
              label="وضعیت"
              options={[
                { value: 'active', label: 'فعال' },
                { value: 'maintenance', label: 'در تعمیر' },
                { value: 'out_of_service', label: 'از کار افتاده' },
                { value: 'retired', label: 'بازنشسته' },
              ]}
            />
          </Stack>
          <Stack direction="row" gap={2}>
            <DateField<FormValues> name="calibration_date" label="تاریخ کالیبراسیون" />
            <DateField<FormValues> name="next_calibration_date" label="کالیبراسیون بعدی" />
          </Stack>
          <TextInput<FormValues> name="notes" label="یادداشت" multiline rows={2} />
          <FormActions onCancel={onClose} loading={mutation.isPending} />
        </Stack>
      </form>
    </FormProvider>
  );
}
