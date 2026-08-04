import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack, Chip } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reportApi } from '../../core/services/reports';
import { TextInput, NumberInput, SelectInput } from '../../shared/components/form/FormField';
import { FormActions } from '../../shared/components/form/FormActions';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';
import { useNavigate } from 'react-router-dom';

const schema = z.object({
  title: z.string().min(1, 'عنوان گزارش الزامی است'),
  scope: z.string().optional(),
  sample: z.any().optional(),
});
type FormValues = z.infer<typeof schema>;

export type ReportScope = 'project' | 'member' | 'series' | 'mold' | 'test';

interface ProjectReportDialogProps {
  projectId: number;
  projectName: string;
  scope: ReportScope;
  scopeLabel?: string;
  memberId?: number;
  onClose: () => void;
}

export function ProjectReportDialog({ projectId, projectName, scope, scopeLabel, memberId, onClose }: ProjectReportDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: `گزارش — ${projectName}${scopeLabel ? ` — ${scopeLabel}` : ''}`,
      scope,
      sample: memberId,
    },
  });

  const mutation = useMutation({
    mutationFn: (d: FormValues) =>
      reportApi.create({
        project: projectId,
        title: d.title,
        sample: d.scope === 'member' ? (d.sample ?? null) : null,
        description: '',
      } as any),
    onSuccess: (report) => {
      enqueueSnackbar('گزارش ایجاد شد', { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['reports'] });
      onClose();
      navigate(`/reports/${(report as any).id}`);
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: 'error' }),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))}>
        <Stack gap={2}>
          <Chip
            label={scopeLabel ? `گزارش ${scopeLabel}` : 'گزارش پروژه'}
            color="primary"
            variant="outlined"
            sx={{ alignSelf: 'flex-start' }}
          />
          <TextInput<FormValues> name="title" label="عنوان گزارش" required />
          <SelectInput<FormValues>
            name="scope"
            label="محدوده گزارش"
            options={[
              { value: 'project', label: 'کل پروژه' },
              { value: 'member', label: 'عضو سازه‌ای' },
              { value: 'series', label: 'ریزش بتن' },
              { value: 'mold', label: 'قالب' },
              { value: 'test', label: 'آزمون' },
            ]}
          />
          {methods.watch('scope') === 'member' && <NumberInput<FormValues> name="sample" label="شناسه عضو سازه‌ای" />}
          <FormActions onCancel={onClose} loading={mutation.isPending} />
        </Stack>
      </form>
    </FormProvider>
  );
}
