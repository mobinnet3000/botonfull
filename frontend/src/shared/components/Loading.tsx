import { Box, CircularProgress, Skeleton, Stack, Typography } from '@mui/material';
import { useApp } from '../../core/contexts/AppContext';

export function LoadingScreen() {
  const { t } = useApp();
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', height: '60vh' }}>
      <Stack alignItems="center" gap={2}>
        <CircularProgress size={40} />
        <Typography color="text.secondary">{t('common.loading')}</Typography>
      </Stack>
    </Box>
  );
}

export function SkeletonTable({ rows = 6 }: { rows?: number }) {
  return (
    <Stack gap={1}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={44} />
      ))}
    </Stack>
  );
}