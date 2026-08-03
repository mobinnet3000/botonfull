import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack, Button, IconButton, Tooltip } from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import type { GridColDef } from '@mui/x-data-grid';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { testExecutionApi } from '../../core/services/domain';
import type { TestExecution } from '../../core/types';
import { useApp } from '../../core/contexts/AppContext';
import { useAuth } from '../../core/auth/AuthContext';
import { canWrite } from '../../core/auth/roles';
import { StatusChip } from '../../shared/components/StatusChip';
import { formatDate } from '../../core/utils/format';
import { PageHeader } from '../../shared/components/PageHeader';
import { DataTable } from '../../shared/components/DataTable';
import { useListQuery } from '../../core/hooks/useListQuery';
import { FormDrawer } from '../../shared/components/FormDrawer';
import { useState } from 'react';
import { TextInput, NumberInput, SelectInput, DateTimeField, AutocompleteField } from '../../shared/components/form/FormField';
import { FormActions } from '../../shared/components/form/FormActions';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';
import { testTypeApi } from '../../core/services/catalog';

const schema = z.object({
  sample: z.any(),
  test_type: z.any(),
  machine: z.any(),
  start_time: z.string().optional(),
  finish_time: z.string().nullable().optional(),
  temperature: z.coerce.number().optional(),
  humidity: z.coerce.number().optional(),
  result: z.coerce.number().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function TestsPage() {
  const { t } = useApp();
  const { role } = useAuth();
  const writable = canWrite(role, 'tests');
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TestExecution | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useListQuery(
    ['test-executions'],
    testExecutionApi.list,
    { page, page_size: pageSize, search: search || undefined },
  );

  const approveMutation = useMutation({
    mutationFn: (id: number) => testExecutionApi.approve(id),
    onSuccess: () => {
      enqueueSnackbar('تأیید شد', { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['test-executions'] });
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: 'error' }),
  });

  const columns: GridColDef<TestExecution>[] = [
    { field: 'sample_code', headerName: 'نمونه', width: 140 },
    { field: 'test_type_name', headerName: 'نوع آزمون', width: 160 },
    { field: 'machine_name', headerName: 'دستگاه', width: 150 },
    { field: 'operator_username', headerName: 'اپراتور', width: 120 },
    {
      field: 'result',
      headerName: 'نتیجه',
      width: 110,
      renderCell: (p) => (p.value === null || p.value === undefined ? '—' : p.value),
    },
    { field: 'status', headerName: 'وضعیت', width: 130, renderCell: (p) => <StatusChip value={p.value as string} /> },
    {
      field: 'result_status',
      headerName: 'نتیجه',
      width: 130,
      renderCell: (p) => <StatusChip value={p.value as string} />,
    },
    { field: 'start_time', headerName: 'شروع', width: 160, renderCell: (p) => formatDate(p.value as string, true) },
    {
      field: 'actions',
      headerName: 'عملیات',
      width: 100,
      sortable: false,
      renderCell: (p) =>
        p.row.result_status === 'pending' ? (
          <Stack direction="row">
            <Tooltip title="تأیید">
              <IconButton size="small" color="success" onClick={() => approveMutation.mutate(p.row.id)}>
                <Check />
              </IconButton>
            </Tooltip>
            <Tooltip title="رد">
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  testExecutionApi
                    .reject(p.row.id)
                    .then(() => qc.invalidateQueries({ queryKey: ['test-executions'] }))
                    .catch((e) => enqueueSnackbar(getErrorMessage(e), { variant: 'error' }));
                }}
              >
                <Close />
              </IconButton>
            </Tooltip>
          </Stack>
        ) : null,
    },
  ];

  return (
    <>
      <PageHeader
        title={t('nav.tests')}
        actions={
          writable && (
            <Button
              variant="contained"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              {t('common.add')}
            </Button>
          )
        }
      />
      <DataTable<TestExecution>
        columns={columns}
        rows={data?.results ?? []}
        rowCount={data?.count}
        loading={isLoading}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        searchValue={search}
        onSearchChange={setSearch}
        onRefresh={() => refetch()}
        exportFileName="tests"
      />
      <FormDrawer
        open={formOpen}
        title={t('common.add') + ' آزمون'}
        onClose={() => setFormOpen(false)}
      >
        <TestExecutionForm
          record={editing}
          onClose={() => setFormOpen(false)}
        />
      </FormDrawer>
    </>
  );
}

function TestExecutionForm({ record, onClose }: { record: TestExecution | null; onClose: () => void }) {
  const { t } = useApp();
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const { data: testTypes } = useQuery({ queryKey: ['test-types'], queryFn: () => testTypeApi.list({ page_size: 100 }) });
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: (record ?? {}) as FormValues,
  });
  const mutation = useMutation({
    mutationFn: (d: FormValues) =>
      record ? testExecutionApi.update(record.id, d as Partial<TestExecution>) : testExecutionApi.create(d as Partial<TestExecution>),
    onSuccess: () => {
      enqueueSnackbar(t('messages.updated'), { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['test-executions'] });
      onClose();
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: 'error' }),
  });
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))}>
        <Stack gap={2}>
          <NumberInput<FormValues> name="sample" label="شناسه نمونه" />
          <AutocompleteField<FormValues>
            name="test_type"
            label="نوع آزمون"
            options={(testTypes?.results ?? []).map((tt) => ({ value: tt.id, label: tt.name }))}
          />
          <NumberInput<FormValues> name="machine" label="شناسه دستگاه" />
          <DateTimeField<FormValues> name="start_time" label="زمان شروع" />
          <Stack direction="row" gap={2}>
            <NumberInput<FormValues> name="temperature" label="دما" />
            <NumberInput<FormValues> name="humidity" label="رطوبت" />
            <NumberInput<FormValues> name="result" label="نتیجه" />
          </Stack>
          <SelectInput<FormValues>
            name="status"
            label="وضعیت"
            options={[
              { value: 'planned', label: 'برنامه‌ریزی شده' },
              { value: 'in_progress', label: 'در حال اجرا' },
              { value: 'completed', label: 'تکمیل شده' },
            ]}
          />
          <TextInput<FormValues> name="notes" label="یادداشت" multiline rows={2} />
          <FormActions onCancel={onClose} loading={mutation.isPending} />
        </Stack>
      </form>
    </FormProvider>
  );
}