import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { sampleApi } from '../../core/services/samples';
import { TextInput, SelectInput } from '../../shared/components/form/FormField';
import { FormActions } from '../../shared/components/form/FormActions';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';

const schema = z.object({
  category: z.string().min(1, 'نام عضو سازه‌ای الزامی است'),
  description: z.string().optional(),
  sampling_location: z.string().optional(),
  current_location: z.string().optional(),
  cement_grade: z.string().optional(),
  concrete_factory: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface StructuralMemberDialogProps {
  projectId: number;
    onClose: () => void;
}

export function StructuralMemberDialog({ projectId, onClose }: StructuralMemberDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: '',
      status: 'created',
      cement_grade: '350',
    },
  });

  const mutation = useMutation({
    mutationFn: (d: FormValues) =>
      sampleApi.create({
        project: projectId,
        category: d.category,
        description: d.description ?? '',
        sampling_location: d.sampling_location ?? '',
        current_location: d.current_location ?? '',
        cement_grade: d.cement_grade || '350',
        concrete_factory: d.concrete_factory ?? '',
        status: (d.status as 'created') ?? 'created',
        date: dayjs().toISOString(),
        sampling_volume: 1,
      } as any),
    onSuccess: () => {
      enqueueSnackbar('عضو سازه‌ای ایجاد شد', { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['projects', projectId] });
      onClose();
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: 'error' }),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))}>
        <Stack gap={2}>
          <TextInput<FormValues> name="category" label="نام عضو سازه‌ای" required />
          <TextInput<FormValues> name="description" label="توضیحات" multiline rows={2} />
          <Stack direction="row" gap={2}>
            <TextInput<FormValues> name="sampling_location" label="موقعیت" />
            <TextInput<FormValues> name="cement_grade" label="عیار سیمان" />
          </Stack>
          <TextInput<FormValues> name="concrete_factory" label="کارخانه بتن" />
          <SelectInput<FormValues>
            name="status"
            label="وضعیت"
            options={[
              { value: 'created', label: 'ایجاد شده' },
              { value: 'received', label: 'دریافت شده' },
              { value: 'waiting', label: 'در انتظار' },
              { value: 'testing', label: 'در حال آزمون' },
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


