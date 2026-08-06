import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack, IconButton, Button } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FormActions } from '../../shared/components/form/FormActions';
import { TextInput, NumberInput, BoolField } from '../../shared/components/form/FormField';
import { projectApi } from '../../core/services/projects';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';
import type { ProjectSettings } from '../../core/types';
import { moldAgesFromSettings } from './projectSettings';

const schema = z.object({
  default_mold_ages: z.array(z.coerce.number().min(1)).min(1, 'حداقل یک سن قالب وارد کنید'),
  default_mold_count: z.coerce.number().min(1).optional(),
  pour_name_prefix: z.string().min(1, 'پیشوند نام ریزش الزامی است'),
  member_name_prefix: z.string().min(1, 'پیشوند نام عضو سازه‌ای الزامی است'),
  use_auto_numbering: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

interface ProjectSettingsFormProps {
  projectId: number;
  initial: ProjectSettings;
  onClose: () => void;
}

export function ProjectSettingsForm({ projectId, initial, onClose }: ProjectSettingsFormProps) {
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      default_mold_ages: moldAgesFromSettings(initial),
      default_mold_count: initial.default_mold_count || 1,
      pour_name_prefix: initial.pour_name_prefix,
      member_name_prefix: initial.member_name_prefix,
      use_auto_numbering: initial.use_auto_numbering,
    },
  });
  const moldAges = (methods.watch('default_mold_ages') as number[]) ?? [];
  const addAge = () => methods.setValue('default_mold_ages', [...moldAges, 0]);
  const removeAge = (index: number) =>
    methods.setValue('default_mold_ages', moldAges.filter((_, i) => i !== index));

  const mutation = useMutation({
    mutationFn: (d: FormValues) =>
      projectApi.updateSettings(projectId, {
        default_mold_ages: moldAgesFromSettings(d),
        default_mold_count: d.default_mold_count || 1,
        pour_name_prefix: d.pour_name_prefix,
        member_name_prefix: d.member_name_prefix,
        use_auto_numbering: d.use_auto_numbering ?? true,
      }),
    onSuccess: () => {
      enqueueSnackbar('تنظیمات پروژه ذخیره شد', { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['projects', projectId] });
      onClose();
    },
    onError: (e) => enqueueSnackbar(getErrorMessage(e), { variant: 'error' }),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))}>
        <Stack gap={2}>
          <TextInput<FormValues> name="member_name_prefix" label="پیشوند نام عضو سازه‌ای" required />
          <TextInput<FormValues> name="pour_name_prefix" label="پیشوند نام ریزش (مثال: Truck)" required />
          <NumberInput<FormValues> name="default_mold_count" label="تعداد پیش‌فرض قالب برای هر سن" />
          <Stack gap={1}>
            {moldAges.map((_, index) => (
              <Stack key={index} direction="row" alignItems="center" gap={1}>
                <NumberInput<FormValues> name={`default_mold_ages.${index}`} label={`سن قالب ${index + 1} (روز)`} required />
                <IconButton onClick={() => removeAge(index)} size="small" color="error">
                  <Delete />
                </IconButton>
              </Stack>
            ))}
            <Button startIcon={<Add />} onClick={addAge} variant="outlined" size="small">
              افزودن سن قالب
            </Button>
          </Stack>
          <BoolField<FormValues> name="use_auto_numbering" label="شماره‌گذاری خودکار ریزها" />
          <FormActions onCancel={onClose} loading={mutation.isPending} />
        </Stack>
      </form>
    </FormProvider>
  );
}