import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { CrudFeature } from '../../shared/components/CrudFeature';
import { requestApi } from '../../core/services/domain';
import type { LabRequest } from '../../core/types';
import { useApp } from '../../core/contexts/AppContext';
import { useAuth } from '../../core/auth/AuthContext';
import { canWrite } from '../../core/auth/roles';
import { StatusChip } from '../../shared/components/StatusChip';
import { formatDate } from '../../core/utils/format';
import { TextInput, NumberInput, SelectInput, MultiSelectInput, DateTimeField } from '../../shared/components/form/FormField';
import { FormActions } from '../../shared/components/form/FormActions';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { testTypeApi } from '../../core/services/catalog';

const schema = z.object({
  project: z.any(),
  priority: z.string().optional(),
  requested_tests: z.array(z.any()).optional(),
  due_date: z.string().nullable().optional(),
  comments: z.string().optional(),
  status: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function RequestsPage() {
  const { t } = useApp();
  const { role } = useAuth();
  const writable = canWrite(role, 'requests');

  const columns: GridColDef<LabRequest>[] = [
    { field: 'request_number', headerName: 'شماره', width: 140 },
    { field: 'project_name', headerName: 'پروژه', width: 200 },
    { field: 'priority', headerName: 'اولویت', width: 100, renderCell: (p) => <StatusChip value={p.value as string} /> },
    { field: 'status', headerName: 'وضعیت', width: 140, renderCell: (p) => <StatusChip value={p.value as string} /> },
    { field: 'requested_by_username', headerName: 'درخواست‌دهنده', width: 130 },
    { field: 'due_date', headerName: 'مهلت', width: 160, renderCell: (p) => formatDate(p.value as string, true) },
  ];

  return (
    <CrudFeature<LabRequest>
      queryKey={['lab-requests']}
      title={t('nav.requests')}
      fetcher={requestApi.list}
      removeFn={writable ? requestApi.remove : undefined}
      columns={columns}
      createEnabled={writable}
      updateEnabled={writable}
      deleteEnabled={writable}
      renderForm={({ record, onClose }) => <RequestForm record={record} onClose={onClose} />}
    />
  );
}

function RequestForm({ record, onClose }: { record: LabRequest | null; onClose: () => void }) {
  const { t } = useApp();
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const { data: testTypes } = useQuery({ queryKey: ['test-types'], queryFn: () => testTypeApi.list({ page_size: 100 }) });
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...(record ?? {}),
      requested_tests: record?.requested_tests ?? [],
    } as FormValues,
  });
  const mutation = useMutation({
    mutationFn: (d: FormValues) =>
      record ? requestApi.update(record.id, d as Partial<LabRequest>) : requestApi.create(d as Partial<LabRequest>),
    onSuccess: () => {
      enqueueSnackbar(t('messages.updated'), { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['lab-requests'] });
      onClose();
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: 'error' }),
  });
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))}>
        <Stack gap={2}>
          <NumberInput<FormValues> name="project" label="شناسه پروژه" />
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
          <MultiSelectInput<FormValues>
            name="requested_tests"
            label="آزمون‌های درخواستی"
            options={(testTypes?.results ?? []).map((tt) => ({ value: tt.id, label: tt.name }))}
          />
          <DateTimeField<FormValues> name="due_date" label="مهلت" />
          <SelectInput<FormValues>
            name="status"
            label="وضعیت"
            options={[
              { value: 'draft', label: 'پیش‌نویس' },
              { value: 'submitted', label: 'ارسال شده' },
              { value: 'approved', label: 'تأیید شده' },
              { value: 'rejected', label: 'رد شده' },
              { value: 'in_progress', label: 'در حال انجام' },
              { value: 'completed', label: 'تکمیل شده' },
              { value: 'cancelled', label: 'لغو شده' },
            ]}
          />
          <TextInput<FormValues> name="comments" label="توضیحات" multiline rows={2} />
          <FormActions onCancel={onClose} loading={mutation.isPending} />
        </Stack>
      </form>
    </FormProvider>
  );
}