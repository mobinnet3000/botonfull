import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack, IconButton, Button } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { seriesApi } from '../../core/services/domain';
import { TextInput, NumberInput } from '../../shared/components/form/FormField';
import { FormActions } from '../../shared/components/form/FormActions';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';
import type { ProjectSettings } from './projectSettings';
import { moldAgesFromSettings } from './projectSettings';

const schema = z.object({
  name: z.string().min(1, 'نام ریزش الزامی است'),
  concrete_temperature: z.coerce.number().optional(),
  slump: z.coerce.number().optional(),
  axis: z.string().optional(),
  moldAges: z.array(z.coerce.number().min(1)).min(1, 'حداقل یک قالب باید تعریف شود'),
});
type FormValues = z.infer<typeof schema>;

interface PourSeriesDialogProps {
  projectId: number;
  memberId: number;
  settings: ProjectSettings;
  defaultName: string;
  onClose: () => void;
}

export function PourSeriesDialog({ projectId, memberId, settings, defaultName, onClose }: PourSeriesDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultName,
      concrete_temperature: 0,
      slump: 0,
      axis: '',
      moldAges: moldAgesFromSettings(settings),
    },
  });
  const moldAges = (methods.watch('moldAges') as number[]) ?? [];
  const addAge = () => methods.setValue('moldAges', [...moldAges, 0]);
  const removeAge = (index: number) =>
    methods.setValue(
      'moldAges',
      moldAges.filter((_, i) => i !== index),
    );

  const mutation = useMutation({
    mutationFn: (d: FormValues) =>
      seriesApi.create({
        sample: memberId,
        name: d.name,
        concrete_temperature: d.concrete_temperature ?? 0,
        slump: d.slump ?? 0,
        axis: d.axis ?? '',
        has_additive: false,
        mold_ages: d.moldAges,
      } as any),
    onSuccess: () => {
      enqueueSnackbar('ریزش بتن و قالب‌های آن ایجاد شد', { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['projects', projectId] });
      qc.invalidateQueries({ queryKey: ['samples'] });
      onClose();
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: 'error' }),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))}>
        <Stack gap={2}>
          <TextInput<FormValues> name="name" label="نام ریزش (مثال: Truck #1)" required />
          <Stack direction="row" gap={2}>
            <NumberInput<FormValues> name="concrete_temperature" label="دمای بتن" />
            <NumberInput<FormValues> name="slump" label="اسلامپ" />
          </Stack>
          <TextInput<FormValues> name="axis" label="محور" />
          <Stack gap={1}>
            {moldAges.map((_, index) => (
              <Stack key={index} direction="row" alignItems="center" gap={1}>
                <NumberInput<FormValues> name={`moldAges.${index}`} label={`سن قالب ${index + 1} (روز)`} required />
                <IconButton onClick={() => removeAge(index)} size="small" color="error">
                  <Delete />
                </IconButton>
              </Stack>
            ))}
            <Button startIcon={<Add />} onClick={addAge} variant="outlined" size="small">
              افزودن قالب
            </Button>
          </Stack>
          <FormActions onCancel={onClose} loading={mutation.isPending} />
        </Stack>
      </form>
    </FormProvider>
  );
}


