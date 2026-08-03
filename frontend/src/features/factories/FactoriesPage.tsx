import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { CrudFeature } from '../../shared/components/CrudFeature';
import { factoryApi } from '../../core/services/catalog';
import type { Factory } from '../../core/types';
import { useApp } from '../../core/contexts/AppContext';
import { useAuth } from '../../core/auth/AuthContext';
import { canWrite } from '../../core/auth/roles';
import { TextInput } from '../../shared/components/form/FormField';
import { FormActions } from '../../shared/components/form/FormActions';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const schema = z.object({
  name: z.string().min(1, 'نام کارخانه الزامی است'),
  phone_number: z.string().optional(),
  address: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function FactoriesPage() {
  const { t } = useApp();
  const { role } = useAuth();
  const writable = canWrite(role, 'factories');

  const columns: GridColDef<Factory>[] = [
    { field: 'name', headerName: 'نام کارخانه', width: 240 },
    { field: 'manager_username', headerName: 'مدیر', width: 140 },
    { field: 'phone_number', headerName: 'تلفن', width: 140 },
    { field: 'address', headerName: 'آدرس', width: 260 },
  ];

  return (
    <CrudFeature<Factory>
      queryKey={['factories']}
      title={t('nav.factories')}
      fetcher={factoryApi.list}
      removeFn={writable ? factoryApi.remove : undefined}
      columns={columns}
      createEnabled={writable}
      updateEnabled={writable}
      deleteEnabled={writable}
      renderForm={({ record, onClose }) => <FactoryForm record={record} onClose={onClose} />}
    />
  );
}

function FactoryForm({ record, onClose }: { record: Factory | null; onClose: () => void }) {
  const { t } = useApp();
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: (record ?? {}) as FormValues,
  });
  const mutation = useMutation({
    mutationFn: (d: FormValues) =>
      record ? factoryApi.update(record.id, d as Partial<Factory>) : factoryApi.create(d as Partial<Factory>),
    onSuccess: () => {
      enqueueSnackbar(t('messages.updated'), { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['factories'] });
      onClose();
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: 'error' }),
  });
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))}>
        <Stack gap={2}>
          <TextInput<FormValues> name="name" label="نام کارخانه" required />
          <TextInput<FormValues> name="phone_number" label="تلفن" />
          <TextInput<FormValues> name="address" label="آدرس" multiline rows={2} />
          <FormActions onCancel={onClose} loading={mutation.isPending} />
        </Stack>
      </form>
    </FormProvider>
  );
}