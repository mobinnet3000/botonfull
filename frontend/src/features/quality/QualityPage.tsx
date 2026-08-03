import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { qcApi } from '../../core/services/platform';
import { sampleApi } from '../../core/services/samples';
import { useApp } from '../../core/contexts/AppContext';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { KpiCard } from '../../shared/components/KpiCard';
import { formatNumber } from '../../core/utils/format';
import { testTypeApi } from '../../core/services/catalog';

export default function QualityPage() {
  const { t } = useApp();
  usePageTitle(t('nav.quality'));
  const [sampleId, setSampleId] = useState('');
  const [testTypeId, setTestTypeId] = useState('');

  const { data: samples } = useQuery({ queryKey: ['samples-opt'], queryFn: () => sampleApi.list({ page_size: 50 }) });
  const { data: testTypes } = useQuery({ queryKey: ['test-types'], queryFn: () => testTypeApi.list({ page_size: 100 }) });

  const { data: analysis, isLoading } = useQuery({
    queryKey: ['qc', sampleId, testTypeId],
    queryFn: () => qcApi.analysis(Number(sampleId), testTypeId ? Number(testTypeId) : undefined),
    enabled: Boolean(sampleId),
  });

  const stats = analysis?.statistics;

  const passData = [
    { name: 'مطابق', value: analysis?.compliance.passed ? 100 : 0 },
    { name: 'نامطابق', value: analysis?.compliance.passed ? 0 : 100 },
  ];

  return (
    <Stack gap={2} className="fadeIn">
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>
            تحلیل کنترل کیفیت
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} gap={2}>
            <TextField
              select
              size="small"
              label="نمونه"
              value={sampleId}
              onChange={(e) => setSampleId(e.target.value)}
              sx={{ minWidth: 220 }}
            >
              {(samples?.results ?? []).map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.code} — {s.category}
                </MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="نوع آزمون" value={testTypeId} onChange={(e) => setTestTypeId(e.target.value)} sx={{ minWidth: 220 }}>
              <MenuItem value="">
                <em>همه</em>
              </MenuItem>
              {(testTypes?.results ?? []).map((tt) => (
                <MenuItem key={tt.id} value={tt.id}>
                  {tt.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      {!analysis ? (
        <Typography color="text.secondary" textAlign="center" py={6}>
          {isLoading ? t('common.loading') : 'نمونه‌ای انتخاب کنید'}
        </Typography>
      ) : (
        <>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 3 }}>
              <KpiCard title="تعداد نتایج" value={stats?.count ?? 0} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <KpiCard title="میانگین" value={formatNumber(stats?.mean, 2)} color="#1E40AF" />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <KpiCard title="انحراف معیار" value={formatNumber(stats?.stdev, 2)} color="#D97706" />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <KpiCard
                title="نتیجه"
                value={analysis.compliance.passed ? 'مطابق' : 'نامطابق'}
                color={analysis.compliance.passed ? '#16A34A' : '#DC2626'}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>
                  توزیع نتایج
                </Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={analysis.values.map((v, i) => ({ index: i + 1, value: v }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1E40AF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>
                  پذیرش
                </Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={passData} dataKey="value" nameKey="name" outerRadius={100} label>
                      {passData.map((entry, i) => (
                        <Cell key={i} fill={i === 0 ? '#16A34A' : '#DC2626'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>
                  چک‌های پذیرش
                </Typography>
                <Stack gap={1}>
                  {analysis.compliance.checks.map((c, i) => (
                    <Stack key={i} direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">{c.rule}</Typography>
                      <Chip
                        label={c.passed ? 'مطابق' : 'نامطابق'}
                        color={c.passed ? 'success' : 'error'}
                        size="small"
                      />
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Stack>
  );
}