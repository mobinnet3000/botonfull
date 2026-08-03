import { Box, Stack, Typography, type ButtonProps } from '@mui/material';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useApp } from '../../core/contexts/AppContext';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {title}
          </Typography>
          {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
        </Box>
        {actions && <Stack direction="row" gap={1}>{actions}</Stack>}
      </Stack>
    </motion.div>
  );
}

export function AddButton({ children, ...props }: ButtonProps) {
  return (
    <Button variant="contained" color="primary" {...props}>
      {children}
    </Button>
  );
}


