import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useApp } from '../../core/contexts/AppContext';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onClose,
  loading,
}: ConfirmDialogProps) {
  const { t } = useApp();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title ?? t('confirm.title')}</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">{message ?? t('confirm.message')}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={onConfirm} variant="contained" color="error" disabled={loading}>
          {t('common.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}