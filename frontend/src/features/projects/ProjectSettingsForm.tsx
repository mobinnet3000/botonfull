import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack, IconButton, Button } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { FormActions } from '../../shared/components/form/FormActions';
import { TextInput, NumberInput, BoolField } from '../../shared/components/form/FormField';
import { saveProjectSettings, type ProjectSettings, moldAgesFromSettings } from './projectSettings';
import { useSnackbar } from 'notistack';

const schema = z.object({
  moldAges: z.array(z.coerce.number().min(1)).min(1, 'حداقل یک سن قالب وارد کنید'),
  archiveMold: z.boolean().optional(),
  pourNamePrefix: z.string().min(1, 'پیشوند نام ریزش الزامی است'),
  memberNamePrefix: z.string().min(1, 'پیشوند نام عضو سازه‌ای الزامی است'),
});
type FormValues = z.infer<typeof schema>;

interface ProjectSettingsFormProps {
  projectId: number;
  initial: ProjectSettings;
  onClose: () => void;
  onSaved: (settings: ProjectSettings) => void;
}

export function ProjectSettingsForm({ projectId, initial, onClose, onSaved }: ProjectSettingsFormProps) {
  const { enqueueSnackbar } = useSnackbar();
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      moldAges: initial.moldAges.length ? initial.moldAges : [7, 14, 28],
      archiveMold: initial.archiveMold,
      pourNamePrefix: initial.pourNamePrefix,
      memberNamePrefix: initial.memberNamePrefix,
    },
  });
  const moldAges = (methods.watch('moldAges') as number[]) ?? [];
  const addAge = () => methods.setValue('moldAges', [...moldAges, 0]);
  const removeAge = (index: number) =>
    methods.setValue(
      'moldAges',
      moldAges.filter((_, i) => i !== index),
    );

  const onSubmit = (values: FormValues) => {
    const settings: ProjectSettings = {
      moldAges: moldAgesFromSettings(values),
      archiveMold: values.archiveMold ?? true,
      pourNamePrefix: values.pourNamePrefix,
      memberNamePrefix: values.memberNamePrefix,
      schedule: moldAgesFromSettings(values).map((age) => ({
        age,
        label: `آزمون ${age} روزه`,
      })),
    };
    saveProjectSettings(projectId, settings);
    enqueueSnackbar('تنظیمات پروژه ذخیره شد', { variant: 'success' });
    onSaved(settings);
    onClose();
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Stack gap={2}>
          <TextInput<FormValues> name="memberNamePrefix" label="پیشوند نام عضو سازه‌ای" required />
          <TextInput<FormValues> name="pourNamePrefix" label="پیشوند نام ریزش (مثال: Truck)" required />
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
              افزودن سن قالب
            </Button>
          </Stack>
          <BoolField<FormValues> name="archiveMold" label="ایجاد قالب بایگانی" />
          <FormActions onCancel={onClose} />
        </Stack>
      </form>
    </FormProvider>
  );
}


