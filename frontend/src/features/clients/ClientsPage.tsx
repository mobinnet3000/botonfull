import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { CrudFeature } from '../../shared/components/CrudFeature';
import { clientApi } from '../../core/services/catalog';
import type { Client } from '../../core/types';
import { useApp } from '../../core/contexts/AppContext';
import { useAuth } from '../../core/auth/AuthContext';
import { canWrite } from '../../core/auth/roles';
import { TextInput, SelectInput } from '../../shared/components/form/FormField';
import { FormActions } from '../../shared/components/form/FormActions';
import { formatDate } from '../../core/utils/format';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const schema = z.object({
  name: z.string().min(1, 'نام الزامی است'),
  client_type: z.string().optional(),
  contact_person: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.string().email('ایمیل معتبر نیست').optional().or(z.literal('')),
  address: z.string().optional(),
  tax_id: z.string().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function ClientsPage() {
  const { t } = useApp();
  const { role } = useAuth();
  const writable = canWrite(role, 'clients');

  const columns: GridColDef<Client>[] = [
    { field: 'name', headerName: 'نام', width: 220 },
    { field: 'client_type', headerName: 'نوع', width: 130, renderCell: (p) => {
      const map: Record<string, string> = { company: 'شرکت', government: 'دولتی', private: 'خصوصی' };
      return map[p.value as string] ?? p.value;
    } },
    { field: 'contact_person', headerName: 'شخص رابط', width: 150 },
    { field: 'phone_number', headerName: 'تلفن', width: 140 },
    { field: 'email', headerName: 'ایمیل', width: 200 },
    { field: 'created_at', headerName: 'تاریخ', width: 150, renderCell: (p) => formatDate(p.value as string) },
  ];

  return (
    <CrudFeature<Client>
      queryKey={['clients']}
      title={t('nav.clients')}
      fetcher={clientApi.list}
      removeFn={writable ? clientApi.remove : undefined}
      columns={columns}
      createEnabled={writable}
      updateEnabled={writable}
      deleteEnabled={writable}
      renderForm={({ record, onClose }) => <ClientForm record={record} onClose={onClose} />}
    />
  );
}

function ClientForm({ record, onClose }: { record: Client | null; onClose: () => void }) {
  const { t } = useApp();
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: (record ?? {}) as FormValues,
  });
  const mutation = useMutation({
    mutationFn: (d: FormValues) =>
      record ? clientApi.update(record.id, d as Partial<Client>) : clientApi.create(d as Partial<Client>),
    onSuccess: () => {
      enqueueSnackbar(t('messages.updated'), { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['clients'] });
      onClose();
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: 'error' }),
  });
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))}>
        <Stack gap={2}>
          <TextInput<FormValues> name="name" label="نام" required />
          <SelectInput<FormValues>
            name="client_type"
            label="نوع"
            options={[
              { value: 'company', label: 'شرکت' },
              { value: 'government', label: 'سازمان دولتی' },
              { value: 'private', label: 'خصوصی' },
            ]}
          />
          <TextInput<FormValues> name="contact_person" label="شخص رابط" />
          <Stack direction="row" gap={2}>
            <TextInput<FormValues> name="phone_number" label="تلفن" />
            <TextInput<FormValues> name="email" label="ایمیل" />
          </Stack>
          <TextInput<FormValues> name="tax_id" label="شناسه مالیاتی" />
          <TextInput<FormValues> name="address" label="آدرس" multiline rows={2} />
          <TextInput<FormValues> name="notes" label="یادداشت" multiline rows={2} />
          <FormActions onCancel={onClose} loading={mutation.isPending} />
        </Stack>
      </form>
    </FormProvider>
  );
}