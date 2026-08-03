import { Drawer, Box, Typography, Stack, Button, Divider } from '@mui/material';
import { Close } from '@mui/icons-material';
import type { ReactNode } from 'react';
import { useApp } from '../../core/contexts/AppContext';

interface FormDrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}

export function FormDrawer({ open, title, onClose, children, width = 560 }: FormDrawerProps) {
  const { t } = useApp();
  return (
    <Drawer anchor="left" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: width }, p: 3 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">{title}</Typography>
        <Button onClick={onClose} startIcon={<Close />} color="inherit">
          {t('common.close')}
        </Button>
      </Stack>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>{children}</Box>
    </Drawer>
  );
}