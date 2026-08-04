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
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../../core/services/platform';
import { KpiCard } from '../../shared/components/KpiCard';
import { useApp } from '../../core/contexts/AppContext';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { projectApi } from '../../core/services/projects';
import { sampleApi } from '../../core/services/samples';
import { reportApi } from '../../core/services/reports';
import { moldApi } from '../../core/services/domain';
import { StatusChip } from '../../shared/components/StatusChip';
import { formatDate } from '../../core/utils/format';
import { moldDue } from '../../core/utils/molds';
import { EventBusy, Today, EventAvailable, Schedule } from '@mui/icons-material';

export default function DashboardPage() {
  const { t } = useApp();
  usePageTitle(t('nav.dashboard'));
  const { data: stats } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.stats });
  const { data: projects } = useQuery({ queryKey: ['dashboard-projects'], queryFn: () => projectApi.list({ page_size: 6, ordering: '-created_at' }) });
  const { data: samples } = useQuery({ queryKey: ['dashboard-samples'], queryFn: () => sampleApi.list({ page_size: 6, ordering: '-date' }) });
  const { data: reports } = useQuery({ queryKey: ['dashboard-reports'], queryFn: () => reportApi.list({ page_size: 5 }) });

  const trend = useMemo(() => {
    const byDay = new Map<string, number>();
    for (const s of samples?.results ?? []) {
      const key = dayjs(s.date).format('YYYY-MM-DD');
      byDay.set(key, (byDay.get(key) ?? 0) + 1);
    }
    return Array.from({ length: 7 }).map((_, i) => {
      const d = dayjs().subtract(6 - i, 'day').format('YYYY-MM-DD');
      return { day: dayjs(d).format('ddd'), samples: byDay.get(d) ?? 0 };
    });
  }, [samples]);

  const distribution = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of samples?.results ?? []) {
      const key = s.specimen_type === 'cube' ? 'مکعبی' : 'استوانه‌ای';
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [samples]);

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

      <DueDateSection />

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
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="samples" name="نمونه" stroke="#1E40AF" fill="url(#s)" />
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
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}

function DueDateSection() {
  const navigate = useNavigate();
  const { data: moldsData } = useQuery({
    queryKey: ['dashboard-molds'],
    queryFn: () => moldApi.list({ page_size: 500 }),
    staleTime: 30_000,
  });

  const molds = useMemo(() => moldsData?.results ?? [], [moldsData]);

  const counts = useMemo(() => {
    const c = { overdue: 0, today: 0, tomorrow: 0, seven: 0, fourteen: 0, twentyEight: 0 };
    for (const m of molds) {
      const info = moldDue(m);
      if (info.isOverdue) c.overdue += 1;
      else if (info.isDueToday) c.today += 1;
      else if (info.isDueTomorrow) c.tomorrow += 1;
      if (m.age_in_days === 7 && !info.isOverdue && info.remainingDays <= 7) c.seven += 1;
      if (m.age_in_days === 14 && !info.isOverdue && info.remainingDays <= 14) c.fourteen += 1;
      if (m.age_in_days === 28 && !info.isOverdue && info.remainingDays <= 28) c.twentyEight += 1;
    }
    return c;
  }, [molds]);

  const goMolds = () => navigate('/molds');

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <KpiCard title="قالب‌های دیرکرد" value={counts.overdue} icon={<EventBusy />} color="#DC2626" onClick={goMolds} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <KpiCard title="آزمون امروز" value={counts.today} icon={<Today />} color="#D97706" onClick={goMolds} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <KpiCard title="آزمون فردا" value={counts.tomorrow} icon={<EventAvailable />} color="#0284C7" onClick={goMolds} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <KpiCard title="نزدیک ۷ روزه" value={counts.seven} icon={<Schedule />} color="#16A34A" onClick={goMolds} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <KpiCard title="نزدیک ۱۴ روزه" value={counts.fourteen} icon={<Schedule />} color="#7C3AED" onClick={goMolds} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <KpiCard title="نزدیک ۲۸ روزه" value={counts.twentyEight} icon={<Schedule />} color="#1E40AF" onClick={goMolds} />
      </Grid>
    </Grid>
  );
}
