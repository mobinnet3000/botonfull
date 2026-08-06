import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Drawer,
  Grid,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  EventBusy,
  Today,
  EventAvailable,
  Schedule,
  Science,
  Warning,
  NavigateBefore,
  NavigateNext,
  Close,
} from '@mui/icons-material';
import dayjs, { type Dayjs } from 'dayjs';
import { calendarApi } from '../../core/services/calendar';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { KpiCard } from '../../shared/components/KpiCard';
import { StatusChip } from '../../shared/components/StatusChip';
import { MoldDetailDrawer } from '../molds/MoldDetailDrawer';
import {
  toJalali,
  toGregorian,
  formatJalali,
  jalaliMonthLabel,
  jalaliDayLabel,
  JALALI_WEEKDAYS,
} from '../../core/utils/jalali';
import type { Mold } from '../../core/types';

type View = 'month' | 'week' | 'day' | 'agenda';
type Filter = 'all' | 'overdue' | 'urgent' | 'today' | 'pending' | 'completed';

const FILTERS: { key: Filter; label: string; color: string }[] = [
  { key: 'all', label: 'همه', color: '#64748B' },
  { key: 'overdue', label: 'دیرکرد', color: '#DC2626' },
  { key: 'today', label: 'امروز', color: '#D97706' },
  { key: 'urgent', label: 'فوری', color: '#B91C1C' },
  { key: 'pending', label: 'در انتظار', color: '#0284C7' },
  { key: 'completed', label: 'انجام شده', color: '#16A34A' },
];

const toFa = (n: number | string) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

export default function CalendarPage() {
  usePageTitle('تقویم کاری تکنسین');
  const [view, setView] = useState<View>('month');
  const [cursor, setCursor] = useState<Dayjs>(dayjs());
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [moldId, setMoldId] = useState<number | null>(null);

  const { data: schedule } = useQuery({
    queryKey: ['calendar', 'schedule', cursor.format('YYYY-MM')],
    queryFn: () => {
      const from = cursor.subtract(10, 'day').format('YYYY-MM-DD');
      const to = cursor.add(40, 'day').format('YYYY-MM-DD');
      return calendarApi.schedule({ from, to });
    },
    staleTime: 20_000,
  });

  const molds = useMemo(() => schedule?.molds ?? [], [schedule]);

  const gridDays = useMemo(() => {
    if (view === 'month') {
      const [jy, jm] = toJalali(cursor.year(), cursor.month() + 1, cursor.date());
      const [gy, gm, gd] = toGregorian(jy, jm, 1);
      const monthStart = dayjs(new Date(gy, gm - 1, gd));
      const offset = (monthStart.day() + 1) % 7;
      const start = monthStart.subtract(offset, 'day');
      return Array.from({ length: 42 }, (_, i) => start.add(i, 'day'));
    }
    if (view === 'week') {
      const offset = (cursor.day() + 1) % 7;
      const start = cursor.subtract(offset, 'day');
      return Array.from({ length: 7 }, (_, i) => start.add(i, 'day'));
    }
    if (view === 'day') return [cursor];
    return [] as Dayjs[];
  }, [view, cursor]);

  const monthHasCursor = useMemo(() => {
    if (view !== 'month') return true;
    const [jy, jm] = toJalali(cursor.year(), cursor.month() + 1, cursor.date());
    return gridDays.some((d) => {
      const [dy, dm] = toJalali(d.year(), d.month() + 1, d.date());
      return dy === jy && dm === jm;
    });
  }, [gridDays, cursor, view]);

  const cursorJalaliMonth = useMemo(() => {
    const [jy, jm] = toJalali(cursor.year(), cursor.month() + 1, cursor.date());
    return `${jy}/${jm}`;
  }, [cursor]);

  const navigate = (dir: 1 | -1) => {
    const [jy, jm] = toJalali(cursor.year(), cursor.month() + 1, cursor.date());
    let nextM = jm + dir;
    let nextY = jy;
    if (nextM < 1) { nextM = 12; nextY -= 1; }
    if (nextM > 12) { nextM = 1; nextY += 1; }
    const [gy, gm, gd] = toGregorian(nextY, nextM, 1);
    setCursor(dayjs(new Date(gy, gm - 1, Math.min(gd, 28))));
  };

  const dayKey = (d: Dayjs) => d.format('YYYY-MM-DD');
  const isToday = (d: Dayjs) => dayKey(d) === dayjs().format('YYYY-MM-DD');

  const moldsOfDay = (key: string) => molds.filter((m) => dayjs(m.deadline).format('YYYY-MM-DD') === key);

  const visibleMoldsOfDay = (key: string) => {
    const list = moldsOfDay(key);
    if (filter === 'all') return list;
    return list.filter((m) => matchFilter(m, filter));
  };

  const dayCounts = (key: string) => {
    const list = moldsOfDay(key);
    const c = { overdue: 0, today: 0, urgent: 0, pending: 0, completed: 0, rejected: 0 };
    for (const m of list) {
      if (m.priority === 'urgent' && !m.is_done) c.urgent += 1;
      if (m.is_done) c[m.status === 'rejected' ? 'rejected' : 'completed'] += 1;
      else if (m.is_overdue) c.overdue += 1;
      else if (dayKey(dayjs(m.deadline)) === dayjs().format('YYYY-MM-DD')) c.today += 1;
      else c.pending += 1;
    }
    return c;
  };

  const upcoming = useMemo(
    () =>
      molds
        .filter((m) => !m.is_done && !m.is_overdue)
        .sort((a, b) => Number(new Date(a.deadline)) - Number(new Date(b.deadline)))
        .slice(0, 8),
    [molds],
  );

  const selectedMolds = selectedDay ? visibleMoldsOfDay(selectedDay) : [];
  const selectedCounts = selectedDay ? dayCounts(selectedDay) : null;

  return (
    <Box className="fadeIn">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
        <Typography variant="h5" fontWeight={700}>
          تقویم کاری تکنسین
        </Typography>
        <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
          <ToggleButtonGroup size="small" value={view} exclusive onChange={(_, v) => v && setView(v)}>
            <ToggleButton value="month">ماه</ToggleButton>
            <ToggleButton value="week">هفته</ToggleButton>
            <ToggleButton value="day">روز</ToggleButton>
            <ToggleButton value="agenda">لیست</ToggleButton>
          </ToggleButtonGroup>
          <Stack direction="row" gap={0.5}>
            <IconButton size="small" onClick={() => navigate(-1)}>
              <NavigateNext />
            </IconButton>
            <Button size="small" onClick={() => setCursor(dayjs())}>
              امروز
            </Button>
            <IconButton size="small" onClick={() => navigate(1)}>
              <NavigateBefore />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>

      <Typography variant="subtitle1" fontWeight={700} mb={1}>
        {view === 'month' && monthHasCursor ? jalaliMonthLabel(cursor) : jalaliDayLabel(cursor, true)}
      </Typography>

      <Grid container spacing={2} mb={2}>
        {[
          { key: 'overdue', label: 'دیرکرد', value: schedule?.stats.overdue, icon: <EventBusy />, color: '#DC2626' },
          { key: 'today', label: 'امروز', value: schedule?.stats.today, icon: <Today />, color: '#D97706' },
          { key: 'pending', label: 'در انتظار', value: schedule?.stats.pending, icon: <Schedule />, color: '#0284C7' },
          { key: 'completed', label: 'انجام شده', value: schedule?.stats.completed, icon: <EventAvailable />, color: '#16A34A' },
          { key: 'rejected', label: 'رد شده', value: schedule?.stats.rejected, icon: <Science />, color: '#7C3AED' },
          { key: 'urgent', label: 'فوری', value: schedule?.stats.urgent, icon: <Warning />, color: '#B91C1C' },
        ].map((s) => (
          <Grid key={s.key} size={{ xs: 6, sm: 4, md: 2 }}>
            <KpiCard title={s.label} value={s.value ?? 0} icon={s.icon} color={s.color} />
          </Grid>
        ))}
      </Grid>

      <Stack direction="row" gap={0.5} flexWrap="wrap" mb={2}>
        {FILTERS.map((f) => (
          <Chip
            key={f.key}
            size="small"
            label={f.label}
            onClick={() => setFilter(f.key)}
            sx={{
              bgcolor: filter === f.key ? f.color : 'transparent',
              color: filter === f.key ? '#fff' : 'inherit',
              cursor: 'pointer',
            }}
          />
        ))}
      </Stack>

      <Card variant="outlined">
        <CardContent>
          {view === 'agenda' ? (
            <AgendaList
              molds={molds.filter((m) => filter === 'all' || matchFilter(m, filter))}
              onOpen={(id) => setMoldId(id)}
              onDay={(key) => {
                setSelectedDay(key);
              }}
            />
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
              {JALALI_WEEKDAYS.map((d) => (
                <Box key={d} sx={{ p: 1, textAlign: 'center', fontWeight: 700, color: 'text.secondary', fontSize: 13 }}>
                  {d}
                </Box>
              ))}
              {gridDays.map((d) => {
                const key = dayKey(d);
                const counts = dayCounts(key);
                const [jy, jm, jd] = toJalali(d.year(), d.month() + 1, d.date());
                const inMonth = view !== 'month' || `${jy}/${jm}` === cursorJalaliMonth;
                const active = filter === 'all' || (filter === 'overdue' && counts.overdue > 0) || (filter === 'urgent' && counts.urgent > 0) || (filter === 'today' && counts.today > 0) || (filter === 'pending' && counts.pending > 0) || (filter === 'completed' && counts.completed + counts.rejected > 0);
                return (
                  <Box
                    key={key}
                    onClick={() => setSelectedDay(key)}
                    sx={{
                      minHeight: view === 'day' ? 300 : 96,
                      border: isToday(d) ? '2px solid' : '1px solid',
                      borderColor: isToday(d) ? 'primary.main' : 'divider',
                      borderRadius: 1.5,
                      p: 0.75,
                      opacity: inMonth ? 1 : 0.35,
                      cursor: 'pointer',
                      bgcolor: active ? '#FFF8F0' : 'transparent',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={isToday(d) ? 800 : 600} color={isToday(d) ? 'primary' : 'text.primary'}>
                        {toFa(jd)}
                      </Typography>
                      {counts.urgent > 0 && <Chip size="small" label={toFa(counts.urgent)} sx={{ bgcolor: '#B91C1C', color: '#fff', fontSize: 10, height: 18 }} />}
                    </Stack>
                    <Stack gap={0.25} mt={0.5}>
                      {counts.overdue > 0 && <CountDot color="#DC2626" n={counts.overdue} label="دیرکرد" />}
                      {counts.today > 0 && <CountDot color="#D97706" n={counts.today} label="امروز" />}
                      {counts.pending > 0 && <CountDot color="#0284C7" n={counts.pending} label="در انتظار" />}
                      {counts.completed + counts.rejected > 0 && (
                        <CountDot color="#16A34A" n={counts.completed + counts.rejected} label="انجام" />
                      )}
                      {counts.overdue + counts.today + counts.pending + counts.completed + counts.rejected === 0 && (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                      )}
                    </Stack>
                  </Box>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={2} mt={0.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={1}>
                آزمون‌های پیش‌رو
              </Typography>
              <Stack gap={0.5}>
                {upcoming.length === 0 && <Typography color="text.secondary" variant="body2">آزمون پیش‌رویی نیست</Typography>}
                {upcoming.map((m) => (
                  <Stack
                    key={m.id}
                    direction="row"
                    alignItems="center"
                    gap={1}
                    sx={{ p: 0.75, borderRadius: 1, borderBottom: '1px solid', borderColor: 'divider', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    onClick={() => setMoldId(m.id)}
                  >
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: m.priority === 'urgent' ? '#B91C1C' : '#0284C7' }} />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {m.sample_identifier} — {m.project_name ?? ''} / {m.member_name ?? ''}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {jalaliDayLabel(m.deadline, true)} · {m.pour_name ?? ''} · سن {m.age_in_days} روزه
                      </Typography>
                    </Box>
                    <Chip size="small" label={m.technician_username ?? 'بدون تکنسین'} variant="outlined" />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={1}>
                ریزهای آینده و مهلت‌های پروژه
              </Typography>
              <Stack gap={0.5}>
                {(schedule?.pours ?? []).length === 0 && (schedule?.deadlines ?? []).length === 0 && (
                  <Typography color="text.secondary" variant="body2">موردی در این بازه نیست</Typography>
                )}
                {(schedule?.pours ?? []).map((p) => (
                  <Stack key={`p-${p.id}`} direction="row" gap={1} alignItems="center" sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 0.5 }}>
                    <Chip size="small" label="ریز" color="secondary" />
                    <Typography variant="body2">{p.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{p.project} / {p.member}</Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Typography variant="caption">{formatJalali(p.pour_date)}</Typography>
                  </Stack>
                ))}
                {(schedule?.deadlines ?? []).map((d) => (
                  <Stack key={`dl-${d.id}`} direction="row" gap={1} alignItems="center" sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 0.5 }}>
                    <Chip size="small" label="مهلت" color="error" />
                    <Typography variant="body2">{d.project_name}</Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Typography variant="caption">{formatJalali(d.end_date)}</Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <DayPanel
        open={selectedDay !== null}
        date={selectedDay}
        counts={selectedCounts}
        molds={selectedMolds}
        onClose={() => setSelectedDay(null)}
        onOpen={(id) => setMoldId(id)}
      />

      {moldId !== null && (
        <MoldDetailDrawer
          moldId={moldId}
          onClose={() => setMoldId(null)}
          onSaved={() => setMoldId(null)}
        />
      )}
    </Box>
  );
}

function matchFilter(m: Mold, filter: Filter): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'overdue':
      return !m.is_done && m.is_overdue === true;
    case 'urgent':
      return !m.is_done && m.priority === 'urgent';
    case 'today':
      return !m.is_done && dayjs(m.deadline).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
    case 'pending':
      return !m.is_done && !m.is_overdue;
    case 'completed':
      return m.is_done;
  }
}

function CountDot({ color, n, label }: { color: string; n: number; label: string }) {
  return (
    <Stack direction="row" alignItems="center" gap={0.5}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
      <Typography variant="caption" sx={{ fontSize: 10, lineHeight: 1 }}>
        {label} {n}
      </Typography>
    </Stack>
  );
}

function AgendaList({
  molds,
  onOpen,
  onDay,
}: {
  molds: Mold[];
  onOpen: (id: number) => void;
  onDay: (key: string) => void;
}) {
  const sorted = useMemo(() => [...molds].sort((a, b) => Number(new Date(a.deadline)) - Number(new Date(b.deadline))), [molds]);
  return (
    <Stack gap={0.75}>
      {sorted.length === 0 && <Typography color="text.secondary" textAlign="center" py={3}>قالبی در این بازه نیست</Typography>}
      {sorted.map((m) => (
        <Stack
          key={m.id}
          direction="row"
          alignItems="center"
          gap={1.5}
          sx={{ p: 1, borderRadius: 1, borderBottom: '1px solid', borderColor: 'divider', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
          onClick={() => onOpen(m.id)}
        >
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: m.is_done ? '#16A34A' : m.is_overdue ? '#DC2626' : m.priority === 'urgent' ? '#B91C1C' : '#0284C7' }} />
          <Typography variant="body2" sx={{ minWidth: 130 }}>{formatJalali(m.deadline)}</Typography>
          <Typography variant="body2" fontWeight={600} sx={{ flexGrow: 1 }}>{m.sample_identifier}</Typography>
          <Typography variant="caption" color="text.secondary">{m.project_name} / {m.member_name} / {m.pour_name}</Typography>
          <StatusChip value={m.status} label={m.status_display ?? m.status} />
          <Button size="small" onClick={(e) => { e.stopPropagation(); onDay(dayjs(m.deadline).format('YYYY-MM-DD')); }}>
            روز
          </Button>
        </Stack>
      ))}
    </Stack>
  );
}

function DayPanel({
  open,
  date,
  counts,
  molds,
  onClose,
  onOpen,
}: {
  open: boolean;
  date: string | null;
  counts: { overdue: number; today: number; urgent: number; pending: number; completed: number; rejected: number } | null;
  molds: Mold[];
  onClose: () => void;
  onOpen: (id: number) => void;
}) {
  return (
    <Drawer anchor="left" open={open} onClose={onClose} sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 480 } } }}>
      <Stack spacing={2} sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
            {date ? jalaliDayLabel(date, true) : ''}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Stack>
        {counts && (
          <Stack direction="row" flexWrap="wrap" gap={0.5}>
            {counts.overdue > 0 && <Chip size="small" label={`دیرکرد: ${counts.overdue}`} color="error" />}
            {counts.today > 0 && <Chip size="small" label={`امروز: ${counts.today}`} color="warning" />}
            {counts.pending > 0 && <Chip size="small" label={`در انتظار: ${counts.pending}`} color="info" />}
            {counts.completed > 0 && <Chip size="small" label={`انجام: ${counts.completed}`} color="success" />}
            {counts.rejected > 0 && <Chip size="small" label={`رد شده: ${counts.rejected}`} color="secondary" />}
            {counts.urgent > 0 && <Chip size="small" label={`فوری: ${counts.urgent}`} sx={{ bgcolor: '#B91C1C', color: '#fff' }} />}
          </Stack>
        )}
        <Stack gap={1}>
          {molds.length === 0 && <Typography color="text.secondary">قالبی برای این روز نیست</Typography>}
          {molds.map((m) => (
            <Box key={m.id} onClick={() => onOpen(m.id)} sx={{ p: 1.25, borderRadius: 2, border: '1px solid', borderColor: 'divider', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
              <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                <Typography variant="body2" fontWeight={700} sx={{ flexGrow: 1 }}>
                  {m.sample_identifier}
                </Typography>
                <StatusChip value={m.status} label={m.status_display ?? m.status} />
                <Chip
                  size="small"
                  label={m.priority_display ?? m.priority}
                  color={m.priority === 'urgent' ? 'error' : m.priority === 'high' ? 'warning' : 'default'}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                پروژه: {m.project_name ?? '—'} · عضو: {m.member_name ?? '—'} · ریز: {m.pour_name ?? '—'} · سن {m.age_in_days} روزه
              </Typography>
              <Stack direction="row" justifyContent="space-between" mt={0.5}>
                <Typography variant="caption">
                  موعد: {formatJalali(m.deadline, true)}
                </Typography>
                <Typography variant="caption" fontWeight={700} color={m.is_overdue ? 'error.main' : 'text.secondary'}>
                  {m.is_done
                    ? 'انجام شده'
                    : m.is_overdue
                      ? `دیرکرد ${Math.abs(m.remaining_days ?? 0)} روز`
                      : m.remaining_days === 0
                        ? 'امروز'
                        : `${m.remaining_days} روز مانده`}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" mt={0.5}>
                <Typography variant="caption">تکنسین: {m.technician_username ?? '—'}</Typography>
                {m.breaking_load !== null && m.breaking_load !== undefined && (
                  <Typography variant="caption" fontWeight={700} color="success.main">
                    نتیجه: {m.breaking_load}
                  </Typography>
                )}
              </Stack>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Drawer>
  );
}