import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { CrudFeature } from '../../shared/components/CrudFeature';
import { sampleTypeApi } from '../../core/services/catalog';
import type { SampleType } from '../../core/types';
import { useApp } from '../../core/contexts/AppContext';
import { useAuth } from '../../core/auth/AuthContext';
import { canWrite } from '../../core/auth/roles';
import { TextInput, BoolField } from '../../shared/components/form/FormField';
import { FormActions } from '../../shared/components/form/FormActions';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const schema = z.object({
  code: z.string().min(1, 'کد الزامی است'),
  name: z.string().min(1, 'نام الزامی است'),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function SampleTypesPage() {
  const { t } = useApp();
  const { role } = useAuth();
  const writable = canWrite(role, 'catalog');

  const columns: GridColDef<SampleType>[] = [
    { field: 'code', headerName: 'کد', width: 120 },
    { field: 'name', headerName: 'نام', width: 220 },
    { field: 'description', headerName: 'توضیحات', width: 320 },
    { field: 'is_active', headerName: 'فعال', width: 90, renderCell: (p) => (p.value ? 'بله' : 'خیر') },
  ];

  return (
    <CrudFeature<SampleType>
      queryKey={['sample-types']}
      title={t('nav.sample.types')}
      fetcher={sampleTypeApi.list}
      removeFn={writable ? sampleTypeApi.remove : undefined}
      columns={columns}
      createEnabled={writable}
      updateEnabled={writable}
      deleteEnabled={writable}
      renderForm={({ record, onClose }) => <SampleTypeForm record={record} onClose={onClose} />}
    />
  );
}

function SampleTypeForm({ record, onClose }: { record: SampleType | null; onClose: () => void }) {
  const { t } = useApp();
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: (record ?? {}) as FormValues,
  });
  const mutation = useMutation({
    mutationFn: (d: FormValues) =>
      record ? sampleTypeApi.update(record.id, d as Partial<SampleType>) : sampleTypeApi.create(d as Partial<SampleType>),
    onSuccess: () => {
      enqueueSnackbar(t('messages.updated'), { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['sample-types'] });
      onClose();
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: 'error' }),
  });
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))}>
        <Stack gap={2}>
          <TextInput<FormValues> name="code" label="کد" required />
          <TextInput<FormValues> name="name" label="نام" required />
          <TextInput<FormValues> name="description" label="توضیحات" multiline rows={2} />
          <BoolField<FormValues> name="is_active" label="فعال" />
          <FormActions onCancel={onClose} loading={mutation.isPending} />
        </Stack>
      </form>
    </FormProvider>
  );
}