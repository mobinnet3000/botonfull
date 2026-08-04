import { Box, Card, CardContent, Stack, Typography, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { palette } from '../../core/theme/designTokens';
import { useApp } from '../../core/contexts/AppContext';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  color?: string;
  hint?: string;
  sx?: SxProps<Theme>;
  onClick?: () => void;
}

export function KpiCard({ title, value, icon, color, hint, sx, onClick }: KpiCardProps) {
  const { mode } = useApp();
  const accent = color ?? palette[mode].primary;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card
        sx={{
          height: '100%',
          ...(onClick ? { cursor: 'pointer', '&:hover': { borderColor: accent } } : {}),
          ...sx,
        }}
        onClick={onClick}
      >
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {icon && <Box color={accent}>{icon}</Box>}
          </Stack>
          <Typography variant="h4" sx={{ mt: 1, color: accent, fontWeight: 700 }}>
            {value}
          </Typography>
          {hint && (
            <Typography variant="caption" color="text.secondary">
              {hint}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}