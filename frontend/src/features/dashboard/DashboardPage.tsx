import { Grid, Paper, Stack, Typography, Divider } from '@mui/material';
import {
  Apartment as ProjectsIcon,
  Science as SamplesIcon,
  FactCheck as TestsIcon,
  Description as ReportsIcon,
  PrecisionManufacturing as EquipIcon,
  Notifications as NotifIcon,
  WaterDrop as CuringIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import dayjs from 'dayjs';
import { dashboardApi } from '../../core/services/platform';
import { KpiCard } from '../../shared/components/KpiCard';
import { useApp } from '../../core/contexts/AppContext';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { projectApi } from '../../core/services/projects';
import { sampleApi } from '../../core/services/samples';
import { reportApi } from '../../core/services/reports';
import { StatusChip } from '../../shared/components/StatusChip';
import { formatDate } from '../../core/utils/format';

export default function DashboardPage() {
  const { t } = useApp();
  usePageTitle(t('nav.dashboard'));
  const { data: stats } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.stats });
  const { data: projects } = useQuery({ queryKey: ['dashboard-projects'], queryFn: () => projectApi.list({ page_size: 6, ordering: '-created_at' }) });
  const { data: samples } = useQuery({ queryKey: ['dashboard-samples'], queryFn: () => sampleApi.list({ page_size: 6, ordering: '-date' }) });
  const { data: reports } = useQuery({ queryKey: ['dashboard-reports'], queryFn: () => reportApi.list({ page_size: 5 }) });

  const trend = Array.from({ length: 7 }).map((_, i) => {
    const d = dayjs().subtract(6 - i, 'day');
    return {
      day: d.format('ddd'),
      samples: 5 + Math.round(Math.sin(i) * 4 + i),
      tests: 3 + Math.round(Math.cos(i) * 3 + i),
    };
  });
  const distribution = [
    { name: 'مکعبی', value: 35 },
    { name: 'استوانه‌ای', value: 25 },
    { name: 'سیمان', value: 15 },
    { name: 'مصالح', value: 12 },
    { name: 'سایر', value: 13 },
  ];

  return (
    <Stack gap={2} className="fadeIn">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="پروژه‌ها"
            value={stats?.projects.total ?? 0}
            hint={`${stats?.projects.active ?? 0} فعال`}
            icon={<ProjectsIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="نمونه‌ها"
            value={stats?.samples.total ?? 0}
            hint={`${stats?.samples.today ?? 0} امروز`}
            icon={<SamplesIcon />}
            color="#16A34A"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="آزمون‌های در انتظار"
            value={stats?.tests.pending ?? 0}
            hint={`${stats?.tests.late ?? 0} دیرکرد`}
            icon={<TestsIcon />}
            color="#D97706"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="گزارش‌های تأیید شده"
            value={stats?.reports.approved ?? 0}
            hint={`${stats?.reports.draft ?? 0} پیش‌نویس`}
            icon={<ReportsIcon />}
            color="#0284C7"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="دستگاه‌های فعال"
            value={stats?.equipment.active ?? 0}
            hint={`${stats?.equipment.calibration_due ?? 0} کالیبراسیون نزدیک`}
            icon={<EquipIcon />}
            color="#7C3AED"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="مخازن عمل‌آوری"
            value={stats?.curing_tanks.total ?? 0}
            icon={<CuringIcon />}
            color="#06B6D4"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="اعلان‌های خوانده نشده"
            value={stats?.notifications.unread ?? 0}
            icon={<NotifIcon />}
            color="#DC2626"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="آزمون‌های ۳۰ روز اخیر"
            value={stats?.activity.monthly_tests ?? 0}
            icon={<TestsIcon />}
            color="#1E40AF"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: 2, height: 360 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>
              روند نمونه‌برداری و آزمون
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#1E40AF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="t" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D97706" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#D97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="samples" name="نمونه" stroke="#1E40AF" fill="url(#s)" />
                <Area type="monotone" dataKey="tests" name="آزمون" stroke="#D97706" fill="url(#t)" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2, height: 360 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>
              توزیع انواع نمونه
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" name="درصد" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              آخرین پروژه‌ها
            </Typography>
            <List dense>
              {(projects?.results ?? []).map((p) => (
                <ListItemButton key={p.id} component="a" href={`/projects/${p.id}`}>
                  <ListItemText
                    primary={p.project_name}
                    secondary={`${p.code} • ${formatDate(p.created_at)}`}
                  />
                  <StatusChip value={p.status} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              آخرین نمونه‌ها
            </Typography>
            <List dense>
              {(samples?.results ?? []).map((s) => (
                <ListItemButton key={s.id} component="a" href={`/samples/${s.id}`}>
                  <ListItemText
                    primary={`${s.code} • ${s.category}`}
                    secondary={`${formatDate(s.date)} • ${s.sampling_volume} m³`}
                  />
                  <StatusChip value={s.status} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              فعالیت اخیر گزارش‌ها
            </Typography>
            <Divider />
            <List>
              {(reports?.results ?? []).map((r) => (
                <ListItem key={r.id} divider>
                  <ListItemText
                    primary={r.title}
                    secondary={`${r.report_number} • نسخه ${r.version} • ${formatDate(r.updated_at, true)}`}
                  />
                  <StatusChip value={r.status} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>
              روند نمونه‌برداری (خطی)
            </Typography>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="samples" name="نمونه" stroke="#1E40AF" strokeWidth={2} />
                <Line type="monotone" dataKey="tests" name="آزمون" stroke="#16A34A" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
