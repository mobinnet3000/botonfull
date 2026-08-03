import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { CrudFeature } from '../../shared/components/CrudFeature';
import { maintenanceApi, equipmentApi } from '../../core/services/domain';
import type { MaintenanceRecord } from '../../core/types';
import { useApp } from '../../core/contexts/AppContext';
import { useAuth } from '../../core/auth/AuthContext';
import { canWrite } from '../../core/auth/roles';
import { formatDate } from '../../core/utils/format';
import { TextInput, SelectInput, NumberInput, DateField } from '../../shared/components/form/FormField';
import { FormActions } from '../../shared/components/form/FormActions';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const schema = z.object({
  equipment: z.any(),
  maintenance_type: z.string().optional(),
  date: z.string().optional(),
  next_due_date: z.string().nullable().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function MaintenancePage() {
  const { t } = useApp();
  const { role } = useAuth();
  const writable = canWrite(role, 'equipment');

  const columns: GridColDef<MaintenanceRecord>[] = [
    { field: 'equipment', headerName: 'دستگاه', width: 100, renderCell: (p) => `#${p.value}` },
    { field: 'maintenance_type', headerName: 'نوع', width: 130 },
    { field: 'technician_username', headerName: 'تکنسین', width: 130 },
    { field: 'date', headerName: 'تاریخ', width: 140, renderCell: (p) => formatDate(p.value as string) },
    { field: 'next_due_date', headerName: 'نوبت بعدی', width: 140, renderCell: (p) => formatDate(p.value as string) },
    { field: 'notes', headerName: 'یادداشت', width: 260 },
  ];

  return (
    <CrudFeature<MaintenanceRecord>
      queryKey={['maintenance-records']}
      title={t('nav.maintenance')}
      fetcher={maintenanceApi.list}
      removeFn={writable ? maintenanceApi.remove : undefined}
      columns={columns}
      createEnabled={writable}
      updateEnabled={writable}
      deleteEnabled={writable}
      renderForm={({ record, onClose }) => <MaintenanceForm record={record} onClose={onClose} />}
    />
  );
}

function MaintenanceForm({ record, onClose }: { record: MaintenanceRecord | null; onClose: () => void }) {
  const { t } = useApp();
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const { data: equipment } = useQuery({ queryKey: ['equipment-options'], queryFn: () => equipmentApi.list({ page_size: 100 }) });
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: (record ?? {}) as FormValues,
  });
  const mutation = useMutation({
    mutationFn: (d: FormValues) =>
      record
        ? maintenanceApi.update(record.id, d as Partial<MaintenanceRecord>)
        : maintenanceApi.create(d as Partial<MaintenanceRecord>),
    onSuccess: () => {
      enqueueSnackbar(t('messages.updated'), { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['maintenance-records'] });
      onClose();
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: 'error' }),
  });
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))}>
        <Stack gap={2}>
          <NumberInput<FormValues> name="equipment" label="شناسه دستگاه" />
          <SelectInput<FormValues>
            name="maintenance_type"
            label="نوع"
            options={[
              { value: 'calibration', label: 'کالیبراسیون' },
              { value: 'maintenance', label: 'نگهداری' },
              { value: 'repair', label: 'تعمیر' },
            ]}
          />
          <DateField<FormValues> name="date" label="تاریخ" />
          <DateField<FormValues> name="next_due_date" label="نوبت بعدی" />
          <TextInput<FormValues> name="notes" label="یادداشت" multiline rows={2} />
          <FormActions onCancel={onClose} loading={mutation.isPending} />
        </Stack>
      </form>
    </FormProvider>
  );
}