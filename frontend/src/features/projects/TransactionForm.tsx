import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { transactionApi } from '../../core/services/calendar';
import { TextInput, NumberInput, SelectInput, DateTimeField, BoolField } from '../../shared/components/form/FormField';
import { FormActions } from '../../shared/components/form/FormActions';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';
import type { Transaction, TransactionType, TransactionCategory, TransactionMethod } from '../../core/types';
import { TRANSACTION_CATEGORIES } from './AccountingTab';

const schema = z.object({
  type: z.string().min(1),
  description: z.string().min(1, 'توضیحات الزامی است'),
  amount: z.coerce.number().positive('مبلغ باید بزرگتر از صفر باشد'),
  date: z.string().optional(),
  category: z.string().optional(),
  method: z.string().optional(),
  is_settled: z.boolean().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface TransactionFormProps {
  projectId: number;
  record: Transaction | null;
  onClose: () => void;
  onSaved: () => void;
}

export function TransactionForm({ projectId, record, onClose, onSaved }: TransactionFormProps) {
  const { enqueueSnackbar } = useSnackbar();
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: record?.type ?? 'income',
      description: record?.description ?? '',
      amount: record ? Number(record.amount) : undefined,
      date: record?.date ?? dayjs().toISOString(),
      category: record?.category ?? 'other',
      method: record?.method ?? 'bank',
      is_settled: record?.is_settled ?? true,
      notes: record?.notes ?? '',
    },
  });

  const watchType = methods.watch('type');

  const mutation = useMutation({
    mutationFn: (d: FormValues) => {
      const payload = {
        project: projectId,
        type: d.type as TransactionType,
        description: d.description,
        amount: d.amount,
        date: d.date ?? dayjs().toISOString(),
        category: (d.category ?? 'other') as TransactionCategory,
        method: (d.method ?? 'bank') as TransactionMethod,
        is_settled: d.is_settled ?? true,
        notes: d.notes ?? '',
      };
      return record ? transactionApi.update(record.id, payload) : transactionApi.create(payload);
    },
    onSuccess: () => {
      enqueueSnackbar(record ? 'تراکنش به‌روزرسانی شد' : 'تراکنش ثبت شد', { variant: 'success' });
      onSaved();
      onClose();
    },
    onError: (e) => enqueueSnackbar(getErrorMessage(e), { variant: 'error' }),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))}>
        <Stack gap={2}>
          <SelectInput<FormValues>
            name="type"
            label="نوع"
            options={[
              { value: 'income', label: 'درآمد / واریز' },
              { value: 'expense', label: 'هزینه / برداشت' },
            ]}
          />
          <TextInput<FormValues> name="description" label="شرح" required />
          <NumberInput<FormValues> name="amount" label="مبلغ" />
          <Stack direction="row" gap={2}>
            <SelectInput<FormValues> name="category" label="دسته‌بندی" options={TRANSACTION_CATEGORIES} />
            <SelectInput<FormValues>
              name="method"
              label="روش"
              options={[
                { value: 'cash', label: 'نقدی' },
                { value: 'bank', label: 'بانکی' },
                { value: 'check', label: 'چک' },
              ]}
            />
          </Stack>
          <DateTimeField<FormValues> name="date" label="تاریخ" />
          {watchType === 'income' && <BoolField<FormValues> name="is_settled" label="وصول شده (در غیر این صورت مطالبه ثبت می‌شود)" />}
          <TextInput<FormValues> name="notes" label="یادداشت" multiline rows={2} />
          <FormActions onCancel={onClose} loading={mutation.isPending} />
        </Stack>
      </form>
    </FormProvider>
  );
}