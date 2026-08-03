import { useQuery } from '@tanstack/react-query';
import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { activityApi } from '../../core/services/platform';
import { useApp } from '../../core/contexts/AppContext';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { formatDate } from '../../core/utils/format';

const ACTION_COLORS: Record<string, 'primary' | 'success' | 'error' | 'default' | 'warning'> = {
  create: 'success',
  update: 'primary',
  delete: 'error',
  login: 'default',
  approval: 'warning',
  status_change: 'warning',
  file_upload: 'default',
};

export default function ActivityPage() {
  const { t } = useApp();
  usePageTitle(t('nav.activity'));
  const { data, isLoading } = useQuery({ queryKey: ['activity'], queryFn: () => activityApi.list({ page_size: 100 }) });

  return (
    <Box className="fadeIn">
      <Typography variant="h5" fontWeight={700} mb={2}>
        {t('nav.activity')}
      </Typography>
      <Card variant="outlined">
        <CardContent>
          <Stack gap={1.5}>
            {isLoading && <Typography color="text.secondary">{t('common.loading')}</Typography>}
            {(data?.results ?? []).map((log) => (
              <Stack key={log.id} direction="row" alignItems="center" gap={1} flexWrap="wrap">
                <Chip size="small" label={log.action} color={ACTION_COLORS[log.action] ?? 'default'} variant="outlined" />
                <Typography variant="body2">
                  <strong>{log.username ?? 'سیستم'}</strong> — {log.content_type} #{log.object_id ?? '-'}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {formatDate(log.created_at, true)}
                </Typography>
                {log.ip && (
                  <Chip size="small" label={`IP: ${log.ip}`} />
                )}
                {log.new_value && Object.keys(log.new_value).length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    {JSON.stringify(log.new_value).slice(0, 80)}
                  </Typography>
                )}
              </Stack>
            ))}
            {(data?.results ?? []).length === 0 && !isLoading && (
              <Typography color="text.secondary" textAlign="center" py={4}>
                فعالیتی ثبت نشده است
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}