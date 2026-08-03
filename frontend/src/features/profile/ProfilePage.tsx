import { Box, Card, CardContent, Divider, FormControlLabel, Grid, Stack, Switch, TextField, Typography } from '@mui/material';
import { useForm, FormProvider } from 'react-hook-form';
import { useAuth } from '../../core/auth/AuthContext';
import { useApp } from '../../core/contexts/AppContext';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { ROLE_LABELS } from '../../core/auth/roles';
import { FormActions } from '../../shared/components/form/FormActions';
import { useMutation } from '@tanstack/react-query';
import { profileApi } from '../../core/services/platform';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useApp();
  usePageTitle(t('nav.profile'));

  if (!user) return null;

  return (
    <Box className="fadeIn">
      <Typography variant="h5" fontWeight={700} mb={2}>
        {t('nav.profile')}
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg,#1E40AF,#3B82F6)',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#fff',
                    fontSize: 32,
                    fontWeight: 800,
                  }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </Box>
                <Typography variant="h6">{user.username}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {ROLE_LABELS[user.role] ?? user.role}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {user.email}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                تنظیمات
              </Typography>
              <Stack gap={2}>
                <FormControlLabel control={<Switch defaultChecked />} label="اعلان‌های ایمیلی" />
                <FormControlLabel control={<Switch defaultChecked />} label="اعلان‌های سیستمی" />
                <FormControlLabel control={<Switch />} label="حالت تیره خودکار" />
              </Stack>
              <Divider sx={{ my: 2 }} />
              <ProfileForm />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function ProfileForm() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const methods = useForm({
    defaultValues: {
      first_name: user?.first_name,
      last_name: user?.last_name,
      email: user?.email,
    },
  });
  const mutation = useMutation({
    mutationFn: (d: { first_name?: string; last_name?: string; email?: string }) =>
      user?.lab_profile ? profileApi.update(user.lab_profile.id, d) : Promise.resolve(),
    onSuccess: () => enqueueSnackbar('ذخیره شد', { variant: 'success' }),
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: 'error' }),
  });
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))}>
        <Stack gap={2}>
          <Stack direction="row" gap={2}>
            <TextField label="نام" {...methods.register('first_name')} fullWidth size="small" />
            <TextField label="نام خانوادگی" {...methods.register('last_name')} fullWidth size="small" />
          </Stack>
          <TextField label="ایمیل" {...methods.register('email')} fullWidth size="small" />
          <FormActions onCancel={() => methods.reset()} loading={mutation.isPending} />
        </Stack>
      </form>
    </FormProvider>
  );
}
