import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { structuralMemberApi } from '../../core/services/domain';
import { TextInput, SelectInput } from '../../shared/components/form/FormField';
import { FormActions } from '../../shared/components/form/FormActions';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';

const schema = z.object({
  name: z.string().min(1, 'نام عضو سازه‌ای الزامی است'),
  member_type: z.string().optional(),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const MEMBER_TYPES = [
  { value: 'foundation', label: 'فنداسیون' },
  { value: 'column', label: 'ستون' },
  { value: 'beam', label: 'تیر' },
  { value: 'wall', label: 'دیوار' },
  { value: 'slab', label: 'سقف' },
  { value: 'stair', label: 'پله' },
  { value: 'other', label: 'سایر' },
];

interface StructuralMemberDialogProps {
  projectId: number;
  onClose: () => void;
}

export function StructuralMemberDialog({ projectId, onClose }: StructuralMemberDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', member_type: 'foundation', description: '' },
  });

  const mutation = useMutation({
    mutationFn: (d: FormValues) =>
      structuralMemberApi.create({
        project: projectId,
        name: d.name,
        member_type: (d.member_type as 'foundation') ?? 'other',
        description: d.description ?? '',
      }),
    onSuccess: () => {
      enqueueSnackbar('عضو سازه‌ای ایجاد شد', { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['projects', projectId] });
      onClose();
    },
    onError: (e) => enqueueSnackbar(getErrorMessage(e), { variant: 'error' }),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))}>
        <Stack gap={2}>
          <TextInput<FormValues> name="name" label="نام عضو سازه‌ای (مثال: فنداسیون شمالی)" required />
          <SelectInput<FormValues> name="member_type" label="نوع عضو" options={MEMBER_TYPES} />
          <TextInput<FormValues> name="description" label="توضیحات" multiline rows={2} />
          <FormActions onCancel={onClose} loading={mutation.isPending} />
        </Stack>
      </form>
    </FormProvider>
  );
}