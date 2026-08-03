import { Alert, Box, Button, Typography } from '@mui/material';
import { useApp } from '../../core/contexts/AppContext';

export function EmptyState({ title, description }: { title?: string; description?: string }) {
  const { t } = useApp();
  return (
    <Box sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h6" color="text.secondary">
        {title ?? t('common.empty')}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.disabled" mt={1}>
          {description}
        </Typography>
      )}
    </Box>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const { t } = useApp();
  return (
    <Alert severity="error" action={onRetry && <Button onClick={onRetry}>{t('error.tryAgain')}</Button>}>
      {message ?? t('common.error')}
    </Alert>
  );
}
