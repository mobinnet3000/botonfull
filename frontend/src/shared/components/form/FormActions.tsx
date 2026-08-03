import { Box, Button, CircularProgress, Stack } from '@mui/material';
import { useApp } from '../../../core/contexts/AppContext';

export function FormActions({ onCancel, loading }: { onCancel: () => void; loading?: boolean }) {
  const { t } = useApp();
  return (
    <Box sx={{ pt: 2 }}>
      <Stack direction="row" gap={1} justifyContent="flex-end">
        <Button onClick={onCancel}>{t('common.cancel')}</Button>
        <Button type="submit" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={16} /> : null}>
          {t('common.save')}
        </Button>
      </Stack>
    </Box>
  );
}