import { useQuery } from '@tanstack/react-query';
import { Box, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import {
  EventBusy,
  Today,
  EventAvailable,
  Schedule,
  Science,
} from '@mui/icons-material';
import { useMemo, useState } from 'react';
import { moldApi } from '../../core/services/domain';
import { moldDue, dueLabel } from '../../core/utils/molds';
import { formatDate } from '../../core/utils/format';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { StatusChip } from '../../shared/components/StatusChip';
import { KpiCard } from '../../shared/components/KpiCard';

type Window = 'overdue' | 'today' | 'tomorrow' | 'week' | 'upcoming';

const WINDOW_LABELS: Record<Window, string> = {
  overdue: 'دیرکرد',
  today: 'امروز',
  tomorrow: 'فردا',
  week: 'هفته جاری',
  upcoming: 'پیش‌رو',
};

export default function MoldsPage() {
  usePageTitle('مدیریت قالب‌ها');
  const [window, setWindow] = useState<Window>('overdue');

  const { data: moldsData } = useQuery({
    queryKey: ['molds', 'all'],
    queryFn: () => moldApi.list({ page_size: 500 }),
    staleTime: 30_000,
  });

  const molds = useMemo(() => moldsData?.results ?? [], [moldsData]);

  const counts = useMemo(() => {
    const c: Record<Window, number> = { overdue: 0, today: 0, tomorrow: 0, week: 0, upcoming: 0 };
    for (const m of molds) {
      const info = moldDue(m);
      if (info.isOverdue) c.overdue += 1;
      else if (info.isDueToday) c.today += 1;
      else if (info.isDueTomorrow) c.tomorrow += 1;
      else if (info.window === 'week') c.week += 1;
      else c.upcoming += 1;
    }
    return c;
  }, [molds]);

  const visible = useMemo(
    () =>
      molds
        .map((m) => ({ mold: m, info: moldDue(m) }))
        .filter(({ info }) => (window === 'week' ? info.window === 'week' : info.window === window))
        .sort((a, b) => a.info.remainingDays - b.info.remainingDays),
    [molds, window],
  );

  const windows: { key: Window; icon: React.ReactNode; color: string }[] = [
    { key: 'overdue', icon: <EventBusy />, color: '#DC2626' },
    { key: 'today', icon: <Today />, color: '#D97706' },
    { key: 'tomorrow', icon: <EventAvailable />, color: '#0284C7' },
    { key: 'week', icon: <Schedule />, color: '#16A34A' },
    { key: 'upcoming', icon: <Science />, color: '#7C3AED' },
  ];

  return (
    <Box className="fadeIn">
      <Typography variant="h5" fontWeight={700} mb={2}>
        مدیریت قالب‌ها
      </Typography>

      <Grid container spacing={2} mb={2}>
        {windows.map((w) => (
          <Grid key={w.key} size={{ xs: 6, sm: 4, md: 2.4 }}>
            <KpiCard title={WINDOW_LABELS[w.key]} value={counts[w.key]} icon={w.icon} color={w.color} onClick={() => setWindow(w.key)} />
          </Grid>
        ))}
      </Grid>

      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
            <Typography variant="subtitle1" fontWeight={700}>
              {WINDOW_LABELS[window]} — {visible.length} قالب
            </Typography>
            <Stack direction="row" gap={0.5}>
              {windows.map((w) => (
                <Chip
                  key={w.key}
                  label={WINDOW_LABELS[w.key]}
                  color={window === w.key ? 'primary' : 'default'}
                  size="small"
                  onClick={() => setWindow(w.key)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Stack>
          </Stack>
          <Stack gap={1}>
            {visible.length === 0 && (
              <Typography color="text.secondary" textAlign="center" py={3}>
                قالبی در این بازه وجود ندارد
              </Typography>
            )}
            {visible.map(({ mold, info }) => (
              <Stack key={mold.id} direction="row" alignItems="center" gap={1.5} flexWrap="wrap" sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Chip size="small" label={mold.sample_identifier} variant="outlined" color="primary" />
                <StatusChip value={mold.is_done ? 'completed' : 'waiting'} label={mold.is_done ? 'انجام شده' : 'در انتظار'} />
                <Typography variant="body2" color="text.secondary">
                  موعد: {formatDate(mold.deadline)}
                </Typography>
                <Chip
                  size="small"
                  label={dueLabel(info)}
                  sx={{ fontWeight: 700, color: info.isOverdue ? '#fff' : 'inherit', bgcolor: info.isOverdue ? 'error.main' : 'action.hover' }}
                />
                {mold.breaking_load !== null && mold.breaking_load !== undefined && (
                  <Chip size="small" label={`نتیجه: ${mold.breaking_load}`} sx={{ bgcolor: 'success.light', color: 'success.contrastText' }} />
                )}
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}