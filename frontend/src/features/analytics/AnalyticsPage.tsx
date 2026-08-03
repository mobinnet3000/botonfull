import { useQuery } from '@tanstack/react-query';
import { Box, Card, CardContent, Grid, Paper, Stack, Typography } from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useMemo } from 'react';
import { sampleApi } from '../../core/services/samples';
import { testExecutionApi } from '../../core/services/domain';
import { equipmentApi } from '../../core/services/domain';
import { requestApi } from '../../core/services/domain';
import { useApp } from '../../core/contexts/AppContext';
import { usePageTitle } from '../../core/hooks/usePageTitle';

export default function AnalyticsPage() {
  const { t } = useApp();
  usePageTitle(t('nav.analytics'));
  const { data: samples } = useQuery({ queryKey: ['analytics-samples'], queryFn: () => sampleApi.list({ page_size: 200 }) });
  const { data: tests } = useQuery({ queryKey: ['analytics-tests'], queryFn: () => testExecutionApi.list({ page_size: 200 }) });
  const { data: equipment } = useQuery({ queryKey: ['analytics-equipment'], queryFn: () => equipmentApi.list({ page_size: 200 }) });
  const { data: requests } = useQuery({ queryKey: ['analytics-requests'], queryFn: () => requestApi.list({ page_size: 200 }) });

  const byStatus = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of samples?.results ?? []) map.set(s.status, (map.get(s.status) ?? 0) + 1);
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [samples]);

  const testTrend = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of tests?.results ?? []) {
      const d = new Date(t.start_time);
      const k = `${d.getMonth() + 1}/${d.getDate()}`;
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return Array.from(map.entries()).slice(-14).map(([name, value]) => ({ name, value }));
  }, [tests]);

  const colors = ['#1E40AF', '#3B82F6', '#16A34A', '#D97706', '#DC2626', '#7C3AED', '#0284C7'];

  return (
    <Box className="fadeIn">
      <Typography variant="h5" fontWeight={700} mb={2}>
        {t('nav.analytics')}
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>
              توزیع نمونه‌ها بر اساس وضعیت
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" outerRadius={100} label>
                  {byStatus.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>
              روند آزمون‌ها
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={testTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#16A34A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                دستگاه‌ها بر اساس وضعیت
              </Typography>
              <Stack gap={1}>
                {(['active', 'maintenance', 'out_of_service', 'retired'] as const).map((s) => {
                  const count = (equipment?.results ?? []).filter((e) => e.status === s).length;
                  return (
                    <Stack key={s} direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">{s === 'active' ? 'فعال' : s === 'maintenance' ? 'در تعمیر' : s === 'out_of_service' ? 'از کار افتاده' : 'بازنشسته'}</Typography>
                      <Typography fontWeight={700}>{count}</Typography>
                    </Stack>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                درخواست‌ها بر اساس وضعیت
              </Typography>
              <Stack gap={1}>
                {['draft', 'submitted', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled'].map((s) => {
                  const count = (requests?.results ?? []).filter((r) => r.status === s).length;
                  return (
                    <Stack key={s} direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">{s}</Typography>
                      <Typography fontWeight={700}>{count}</Typography>
                    </Stack>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}