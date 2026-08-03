import { Chip } from '@mui/material';
import { useMemo } from 'react';
import { palette, statusColors } from '../../core/theme/designTokens';
import { useApp } from '../../core/contexts/AppContext';

const STATUS_LABELS: Record<string, string> = {
  active: 'فعال',
  on_hold: 'متوقف',
  completed: 'تکمیل‌شده',
  cancelled: 'لغوشده',
  low: 'کم',
  medium: 'متوسط',
  high: 'زیاد',
  urgent: 'فوری',
  approved: 'تأییدشده',
  pending: 'در انتظار',
  rejected: 'ردشده',
  draft: 'پیش‌نویس',
  reviewed: 'بازبینی‌شده',
  open: 'باز',
  in_progress: 'در حال انجام',
  closed: 'بسته',
  planned: 'برنامه‌ریزی‌شده',
  created: 'ایجادشده',
  received: 'دریافت‌شده',
  waiting: 'در انتظار',
  stored: 'نگهداری',
  curing: 'عمل‌آوری',
  ready_for_test: 'آماده آزمون',
  testing: 'در حال آزمون',
  reported: 'گزارش‌شده',
  archived: 'بایگانی',
  maintenance: 'تعمیر',
  out_of_service: 'از کار افتاده',
  retired: 'بازنشسته',
};

export function StatusChip({ value, label }: { value?: string | null; label?: string }) {
  const { mode } = useApp();
  const color = useMemo(() => statusColors[value ?? ''] ?? palette[mode].secondary, [value, mode]);
  const text = label ?? STATUS_LABELS[value ?? ''] ?? value ?? '—';
  return (
    <Chip
      size="small"
      label={text}
      sx={{
        backgroundColor: `${color}1A`,
        color,
        border: `1px solid ${color}40`,
        fontWeight: 600,
      }}
    />
  );
}