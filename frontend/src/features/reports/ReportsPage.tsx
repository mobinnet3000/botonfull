import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { CrudFeature } from '../../shared/components/CrudFeature';
import { reportApi } from '../../core/services/reports';
import type { Report } from '../../core/types';
import { useApp } from '../../core/contexts/AppContext';
import { useAuth } from '../../core/auth/AuthContext';
import { canWrite } from '../../core/auth/roles';
import { StatusChip } from '../../shared/components/StatusChip';
import { formatDate } from '../../core/utils/format';
import { TextInput, NumberInput } from '../../shared/components/form/FormField';
import { FormActions } from '../../shared/components/form/FormActions';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';

const schema = z.object({
  project: z.any(),
  sample: z.any().optional(),
  title: z.string().min(1, 'عنوان الزامی است'),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function ReportsPage() {
  const { t } = useApp();
  const { role } = useAuth();
  const navigate = useNavigate();
  const writable = canWrite(role, 'reports');

  const columns: GridColDef<Report>[] = [
    { field: 'report_number', headerName: 'شماره', width: 140 },
    { field: 'title', headerName: 'عنوان', width: 240 },
    { field: 'project_name', headerName: 'پروژه', width: 200 },
    { field: 'status', headerName: 'وضعیت', width: 130, renderCell: (p) => <StatusChip value={p.value as string} /> },
    { field: 'version', headerName: 'نسخه', width: 80 },
    { field: 'created_by_username', headerName: 'ایجادکننده', width: 130 },
    { field: 'updated_at', headerName: 'بروزرسانی', width: 170, renderCell: (p) => formatDate(p.value as string, true) },
  ];

  return (
    <CrudFeature<Report>
      queryKey={['reports']}
      title={t('nav.reports')}
      fetcher={reportApi.list}
      removeFn={writable ? reportApi.remove : undefined}
      columns={columns}
      createEnabled={writable}
      updateEnabled={false}
      deleteEnabled={writable}
      onRowClick={(row) => navigate(`/reports/${row.id}`)}
      renderForm={({ record, onClose }) => <ReportForm record={record} onClose={onClose} />}
    />
  );
}

function ReportForm({ record, onClose }: { record: Report | null; onClose: () => void }) {
  const { t } = useApp();
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: (record ?? {}) as FormValues,
  });
  const mutation = useMutation({
    mutationFn: (d: FormValues) => reportApi.create(d as Partial<Report>),
    onSuccess: () => {
      enqueueSnackbar(t('messages.created'), { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['reports'] });
      onClose();
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: 'error' }),
  });
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))}>
        <Stack gap={2}>
          <NumberInput<FormValues> name="project" label="شناسه پروژه" />
          <NumberInput<FormValues> name="sample" label="شناسه نمونه (اختیاری)" />
          <TextInput<FormValues> name="title" label="عنوان" required />
          <TextInput<FormValues> name="description" label="توضیحات" multiline rows={3} />
          <FormActions onCancel={onClose} loading={mutation.isPending} />
        </Stack>
      </form>
    </FormProvider>
  );
}
