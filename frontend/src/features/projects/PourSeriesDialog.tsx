import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack, IconButton, Button, Typography, Box } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { pourSeriesApi } from '../../core/services/domain';
import { TextInput, NumberInput, DateTimeField, SelectInput } from '../../shared/components/form/FormField';
import { FormActions } from '../../shared/components/form/FormActions';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';
import type { ProjectSettings, StructuralMember, PourSeries } from '../../core/types';
import { moldAgesFromSettings } from './projectSettings';

const schema = z.object({
  structural_member: z.number().min(1, 'انتخاب عضو سازه‌ای الزامی است'),
  name: z.string().min(1, 'نام ریزش الزامی است'),
  pour_date: z.string().optional(),
  concrete_temperature: z.coerce.number().optional(),
  slump: z.coerce.number().optional(),
  axis: z.string().optional(),
  truck_number: z.string().optional(),
  batch_number: z.string().optional(),
  mold_ages: z.array(z.coerce.number().min(1)).min(1, 'حداقل یک سن قالب تعریف کنید'),
  mold_count: z.coerce.number().min(1).optional(),
});
type FormValues = z.infer<typeof schema>;

interface PourSeriesDialogProps {
  projectId: number;
  memberId: number;
  members: StructuralMember[];
  settings: ProjectSettings;
  defaultName: string;
  onClose: () => void;
}

export function PourSeriesDialog({ projectId, memberId, members, settings, defaultName, onClose }: PourSeriesDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      structural_member: memberId || members[0]?.id || 0,
      name: defaultName,
      pour_date: dayjs().toISOString(),
      concrete_temperature: 0,
      slump: 0,
      axis: '',
      truck_number: '',
      batch_number: '',
      mold_ages: moldAgesFromSettings(settings),
      mold_count: settings.default_mold_count || 1,
    },
  });
  const moldAges = (methods.watch('mold_ages') as number[]) ?? [];
  const addAge = () => methods.setValue('mold_ages', [...moldAges, 0]);
  const removeAge = (index: number) =>
    methods.setValue('mold_ages', moldAges.filter((_, i) => i !== index));

  const mutation = useMutation({
    mutationFn: (d: FormValues) =>
      pourSeriesApi.create({
        structural_member: d.structural_member,
        name: d.name,
        pour_date: d.pour_date ?? dayjs().toISOString(),
        concrete_temperature: d.concrete_temperature ?? 0,
        slump: d.slump ?? 0,
        axis: d.axis ?? '',
        truck_number: d.truck_number ?? '',
        batch_number: d.batch_number ?? '',
        mold_ages: d.mold_ages,
        mold_count: d.mold_count ?? 1,
      } as Partial<PourSeries> & { mold_ages: number[]; mold_count: number }),
    onSuccess: () => {
      enqueueSnackbar('ریزش بتن و قالب‌های آن ایجاد شد', { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['projects', projectId] });
      qc.invalidateQueries({ queryKey: ['molds'] });
      onClose();
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: 'error' }),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))}>
        <Stack gap={2}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              قالب‌ها به‌صورت خودکار بر اساس تنظیمات پروژه ساخته می‌شوند. تنها برای همین ریز می‌توانید تعداد را تغییر دهید.
            </Typography>
          </Box>
          <SelectInput<FormValues>
            name="structural_member"
            label="عضو سازه‌ای (الزامی)"
            options={members.map((m) => ({ value: m.id, label: m.name }))}
          />
          <Stack direction="row" gap={2}>
            <TextInput<FormValues> name="name" label="نام ریزش (مثال: Truck #1)" required />
            <DateTimeField<FormValues> name="pour_date" label="تاریخ ریز" />
          </Stack>
          <Stack direction="row" gap={2}>
            <NumberInput<FormValues> name="concrete_temperature" label="دمای بتن" />
            <NumberInput<FormValues> name="slump" label="اسلامپ" />
          </Stack>
          <Stack direction="row" gap={2}>
            <TextInput<FormValues> name="axis" label="محور" />
            <TextInput<FormValues> name="truck_number" label="شماره کامیون" />
          </Stack>
          <NumberInput<FormValues> name="mold_count" label="تعداد قالب برای هر سن" />
          <Stack gap={1}>
            {moldAges.map((_, index) => (
              <Stack key={index} direction="row" alignItems="center" gap={1}>
                <NumberInput<FormValues> name={`mold_ages.${index}`} label={`سن قالب ${index + 1} (روز)`} required />
                <IconButton onClick={() => removeAge(index)} size="small" color="error">
                  <Delete />
                </IconButton>
              </Stack>
            ))}
            <Button startIcon={<Add />} onClick={addAge} variant="outlined" size="small">
              افزودن سن قالب
            </Button>
          </Stack>
          <FormActions onCancel={onClose} loading={mutation.isPending} />
        </Stack>
      </form>
    </FormProvider>
  );
}