import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CrudFeature } from '../../shared/components/CrudFeature';
import { userApi } from '../../core/services/platform';
import type { AdminUser } from '../../core/types';
import { useApp } from '../../core/contexts/AppContext';
import { TextInput, SelectInput } from '../../shared/components/form/FormField';
import { FormActions } from '../../shared/components/form/FormActions';
import { formatDate } from '../../core/utils/format';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';
import { ROLE_LABELS } from '../../core/auth/roles';

const schema = z.object({
  username: z.string().min(3, 'نام کاربری حداقل ۳ کاراکتر'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  role: z.string().optional(),
  password: z.string().optional(),
  is_active: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));

export default function UsersPage() {
  const { t } = useApp();
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();

  const columns: GridColDef<AdminUser>[] = [
    { field: 'username', headerName: 'نام کاربری', width: 160 },
    { field: 'first_name', headerName: 'نام', width: 130 },
    { field: 'last_name', headerName: 'نام خانوادگی', width: 140 },
    { field: 'email', headerName: 'ایمیل', width: 220 },
    { field: 'role_display', headerName: 'نقش', width: 170 },
    { field: 'is_active', headerName: 'فعال', width: 90, renderCell: (p) => (p.value ? 'بله' : 'خیر') },
    { field: 'date_joined', headerName: 'عضویت', width: 160, renderCell: (p) => formatDate(p.value as string) },
  ];

  return (
    <CrudFeature<AdminUser>
      queryKey={['users']}
      title={t('nav.users')}
      fetcher={userApi.list}
      removeFn={(id) => userApi.remove(id)}
      columns={columns}
      createEnabled
      updateEnabled
      deleteEnabled
      renderForm={({ record, onClose }) => (
        <UserForm
          record={record}
          onClose={onClose}
          onSuccess={() => qc.invalidateQueries({ queryKey: ['users'] })}
          notify={(msg) => enqueueSnackbar(msg, { variant: 'success' })}
        />
      )}
    />
  );
}

function UserForm({
  record,
  onClose,
  onSuccess,
  notify,
}: {
  record: AdminUser | null;
  onClose: () => void;
  onSuccess: () => void;
  notify: (msg: string) => void;
}) {
  const { t } = useApp();
  const { enqueueSnackbar } = useSnackbar();
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: (record ?? {}) as FormValues,
  });
  const mutation = useMutation({
    mutationFn: (d: FormValues) => {
      if (record) {
        const { password, ...rest } = d;
        return userApi.update(record.id, { ...rest } as Record<string, unknown>);
      }
      return userApi.create({ ...d } as Partial<AdminUser> & { password?: string });
    },
    onSuccess: () => {
      enqueueSnackbar(t('messages.updated'), { variant: 'success' });
      onSuccess();
      onClose();
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: 'error' }),
  });
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))}>
        <Stack gap={2}>
          <TextInput<FormValues> name="username" label="نام کاربری" required />
          <Stack direction="row" gap={2}>
            <TextInput<FormValues> name="first_name" label="نام" />
            <TextInput<FormValues> name="last_name" label="نام خانوادگی" />
          </Stack>
          <TextInput<FormValues> name="email" label="ایمیل" />
          <SelectInput<FormValues> name="role" label="نقش" options={ROLE_OPTIONS} />
          {!record && <TextInput<FormValues> name="password" label="رمز عبور" />}
          <FormActions onCancel={onClose} loading={mutation.isPending} />
        </Stack>
      </form>
    </FormProvider>
  );
}