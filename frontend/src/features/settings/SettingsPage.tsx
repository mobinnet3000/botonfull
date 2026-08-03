import { Box, Button, Card, CardContent, Divider, FormControlLabel, Grid, Stack, Switch, Typography } from '@mui/material';
import { useApp } from '../../core/contexts/AppContext';
import { usePageTitle } from '../../core/hooks/usePageTitle';

export default function SettingsPage() {
  const { t, mode, toggleMode, lang, setLang, sidebarCollapsed, toggleSidebar } = useApp();
  usePageTitle(t('nav.settings'));

  return (
    <Box className="fadeIn">
      <Typography variant="h5" fontWeight={700} mb={2}>
        {t('nav.settings')}
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                ظاهر
              </Typography>
              <Stack gap={2}>
                <FormControlLabel
                  control={<Switch checked={mode === 'dark'} onChange={toggleMode} />}
                  label="حالت تیره"
                />
                <FormControlLabel
                  control={<Switch checked={sidebarCollapsed} onChange={toggleSidebar} />}
                  label="فشرده‌سازی منوی کناری"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                زبان
              </Typography>
              <Stack direction="row" gap={2} alignItems="center">
                <Button variant="outlined" onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}>
                  {lang === 'fa' ? 'Switch to English' : 'تغییر به فارسی'}
                </Button>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">
                زبان فعلی: {lang === 'fa' ? 'فارسی (RTL)' : 'English (LTR)'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}