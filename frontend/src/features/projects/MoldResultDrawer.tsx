import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { moldApi } from '../../core/services/domain';
import { NumberInput, DateTimeField } from '../../shared/components/form/FormField';
import { FormActions } from '../../shared/components/form/FormActions';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';
import type { Mold } from '../../core/types';
import { moldAgeLabel } from './projectHelpers';

const schema = z.object({
  breaking_load: z.coerce.number().optional(),
  mass: z.coerce.number().optional(),
  completed_at: z.string().nullable().optional(),
});
type FormValues = z.infer<typeof schema>;

interface MoldResultDrawerProps {
  mold: Mold;
  projectId: number;
  onClose: () => void;
}

export function MoldResultDrawer({ mold, projectId, onClose }: MoldResultDrawerProps) {
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      breaking_load: mold.breaking_load ?? undefined,
      mass: mold.mass ?? undefined,
      completed_at: mold.completed_at ?? null,
    },
  });

  const mutation = useMutation({
    mutationFn: (d: FormValues) =>
      moldApi.patch(mold.id, {
        breaking_load: d.breaking_load ?? null,
        mass: d.mass ?? null,
        completed_at: d.completed_at ?? dayjs().toISOString(),
      } as any),
    onSuccess: () => {
      enqueueSnackbar('نتیجه قالب ثبت شد', { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['projects', projectId] });
      onClose();
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: 'error' }),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))}>
        <Stack gap={2}>
          <Typography variant="subtitle2" color="primary">
            {mold.sample_identifier} — {moldAgeLabel(mold.age_in_days)}
          </Typography>
          <NumberInput<FormValues> name="breaking_load" label="بار شکست (kN)" />
          <NumberInput<FormValues> name="mass" label="جرم (kg)" />
          <DateTimeField<FormValues> name="completed_at" label="زمان انجام آزمون" />
          <FormActions onCancel={onClose} loading={mutation.isPending} />
        </Stack>
      </form>
    </FormProvider>
  );
}