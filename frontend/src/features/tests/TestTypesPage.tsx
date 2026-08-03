import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { CrudFeature } from '../../shared/components/CrudFeature';
import { testTypeApi } from '../../core/services/catalog';
import type { TestType } from '../../core/types';
import { useApp } from '../../core/contexts/AppContext';
import { useAuth } from '../../core/auth/AuthContext';
import { canWrite } from '../../core/auth/roles';
import { TextInput, SelectInput, BoolField } from '../../shared/components/form/FormField';
import { FormActions } from '../../shared/components/form/FormActions';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const schema = z.object({
  code: z.string().min(1, 'کد الزامی است'),
  name: z.string().min(1, 'نام الزامی است'),
  category: z.string().optional(),
  unit: z.string().optional(),
  method_reference: z.string().optional(),
  is_active: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function TestTypesPage() {
  const { t } = useApp();
  const { role } = useAuth();
  const writable = canWrite(role, 'catalog');

  const columns: GridColDef<TestType>[] = [
    { field: 'code', headerName: 'کد', width: 140 },
    { field: 'name', headerName: 'نام', width: 220 },
    { field: 'category_display', headerName: 'دسته', width: 130 },
    { field: 'unit', headerName: 'واحد', width: 90 },
    { field: 'method_reference', headerName: 'مرجع روش', width: 200 },
    { field: 'is_active', headerName: 'فعال', width: 80, renderCell: (p) => (p.value ? 'بله' : 'خیر') },
  ];

  return (
    <CrudFeature<TestType>
      queryKey={['test-types']}
      title={t('nav.test.types')}
      fetcher={testTypeApi.list}
      removeFn={writable ? testTypeApi.remove : undefined}
      columns={columns}
      createEnabled={writable}
      updateEnabled={writable}
      deleteEnabled={writable}
      renderForm={({ record, onClose }) => <TestTypeForm record={record} onClose={onClose} />}
    />
  );
}

function TestTypeForm({ record, onClose }: { record: TestType | null; onClose: () => void }) {
  const { t } = useApp();
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: (record ?? {}) as FormValues,
  });
  const mutation = useMutation({
    mutationFn: (d: FormValues) =>
      record ? testTypeApi.update(record.id, d as Partial<TestType>) : testTypeApi.create(d as Partial<TestType>),
    onSuccess: () => {
      enqueueSnackbar(t('messages.updated'), { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['test-types'] });
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
          <Stack direction="row" gap={2}>
            <SelectInput<FormValues>
              name="category"
              label="دسته"
              options={[
                { value: 'concrete', label: 'بتن' },
                { value: 'cement', label: 'سیمان' },
                { value: 'aggregate', label: 'مصالح سنگی' },
                { value: 'water', label: 'آب' },
                { value: 'soil', label: 'خاک' },
                { value: 'steel', label: 'فولاد' },
                { value: 'asphalt', label: 'آسفالت' },
                { value: 'general', label: 'عمومی' },
              ]}
            />
            <TextInput<FormValues> name="unit" label="واحد" />
          </Stack>
          <TextInput<FormValues> name="method_reference" label="مرجع روش آزمون" />
          <BoolField<FormValues> name="is_active" label="فعال" />
          <FormActions onCancel={onClose} loading={mutation.isPending} />
        </Stack>
      </form>
    </FormProvider>
  );
}