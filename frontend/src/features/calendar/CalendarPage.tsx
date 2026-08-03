import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { sampleApi } from '../../core/services/samples';
import { equipmentApi } from '../../core/services/domain';
import { useApp } from '../../core/contexts/AppContext';
import { usePageTitle } from '../../core/hooks/usePageTitle';

type View = 'month' | 'week' | 'day' | 'agenda';

interface CalEvent {
  id: string;
  title: string;
  date: Date;
  kind: 'sample' | 'test' | 'calibration' | 'report';
  color: string;
}

function buildEvents(samples: any[], equipment: any[]): CalEvent[] {
  const events: CalEvent[] = [];
  for (const s of samples ?? []) {
    events.push({ id: `s-${s.id}`, title: s.code, date: new Date(s.date), kind: 'sample', color: '#1E40AF' });
    if (s.age_in_days !== undefined && s.age_in_days !== null) {
      const base = new Date(s.casting_date || s.date);
      [7, 14, 28].forEach((days) => {
        const d = new Date(base);
        d.setDate(base.getDate() + days);
        events.push({ id: `s-${s.id}-${days}`, title: `${s.code} – آزمون ${days} روزه`, date: d, kind: 'test', color: days === 7 ? '#D97706' : days === 14 ? '#0284C7' : '#16A34A' });
      });
    }
  }
  for (const e of equipment ?? []) {
    if (e.next_calibration_date) {
      events.push({
        id: `e-${e.id}`,
        title: `کالیبراسیون ${e.name}`,
        date: new Date(e.next_calibration_date),
        kind: 'calibration',
        color: '#DC2626',
      });
    }
  }
  return events;
}

const KIND_LABELS: Record<CalEvent['kind'], string> = {
  sample: 'نمونه',
  test: 'آزمون',
  calibration: 'کالیبراسیون',
  report: 'گزارش',
};

export default function CalendarPage() {
  const { t } = useApp();
  usePageTitle(t('nav.calendar'));
  const [view, setView] = useState<View>('month');
  const [cursor, setCursor] = useState<Dayjs>(dayjs());

  const { data: samples } = useQuery({ queryKey: ['cal-samples'], queryFn: () => sampleApi.list({ page_size: 100 }) });
  const { data: equipment } = useQuery({ queryKey: ['cal-equipment'], queryFn: () => equipmentApi.list({ page_size: 100 }) });
  const events = useMemo(() => buildEvents(samples?.results ?? [], equipment?.results ?? []), [samples, equipment]);

  const days = useMemo(() => {
    if (view === 'month') {
      const start = cursor.startOf('month').startOf('week');
      return Array.from({ length: 42 }, (_, i) => start.add(i, 'day'));
    }
    if (view === 'week') {
      const start = cursor.startOf('week');
      return Array.from({ length: 7 }, (_, i) => start.add(i, 'day'));
    }
    if (view === 'day') {
      return [cursor];
    }
    return [] as Dayjs[];
  }, [view, cursor]);

  const isSameDay = (a: Date, b: Dayjs) =>
    a.getFullYear() === b.year() && a.getMonth() === b.month() && a.getDate() === b.date();

  return (
    <Box className="fadeIn">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
        <Typography variant="h5" fontWeight={700}>
          {t('nav.calendar')}
        </Typography>
        <Stack direction="row" gap={1} alignItems="center">
          <ToggleButtonGroup size="small" value={view} exclusive onChange={(_, v) => v && setView(v)}>
            <ToggleButton value="month">ماه</ToggleButton>
            <ToggleButton value="week">هفته</ToggleButton>
            <ToggleButton value="day">روز</ToggleButton>
            <ToggleButton value="agenda">دستور</ToggleButton>
          </ToggleButtonGroup>
          <Stack direction="row" gap={0.5}>
            {(['sample', 'test', 'calibration'] as const).map((k) => (
              <Chip key={k} size="small" label={KIND_LABELS[k]} sx={{ bgcolor: `${events[0] && (k === 'sample' ? '#1E40AF' : k === 'test' ? '#16A34A' : '#DC2626')}22`, fontWeight: 600 }} />
            ))}
          </Stack>
          <Stack direction="row" gap={0.5}>
            <Button size="small" onClick={() => setCursor(cursor.subtract(1, view === 'month' ? 'month' : 'week'))}>
              قبلی
            </Button>
            <Button size="small" onClick={() => setCursor(dayjs())}>
              امروز
            </Button>
            <Button size="small" onClick={() => setCursor(cursor.add(1, view === 'month' ? 'month' : 'week'))}>
              بعدی
            </Button>
          </Stack>
        </Stack>
      </Stack>

      <Card variant="outlined">
        <CardContent>
          {view === 'agenda' ? (
            <Stack gap={1}>
              {events
                .slice()
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map((e) => (
                  <Stack key={e.id} direction="row" gap={2} alignItems="center">
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: e.color }} />
                    <Typography variant="body2" sx={{ minWidth: 110 }}>
                      {dayjs(e.date).format('YYYY-MM-DD')}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {e.title}
                    </Typography>
                    <Chip size="small" label={KIND_LABELS[e.kind]} variant="outlined" />
                  </Stack>
                ))}
            </Stack>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 0.5,
              }}
            >
              {['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'].map((d) => (
                <Box key={d} sx={{ p: 1, textAlign: 'center', fontWeight: 600, color: 'text.secondary' }}>
                  {d}
                </Box>
              ))}
              {days.map((d) => {
                const dayEvents = events.filter((e) => isSameDay(e.date, d));
                return (
                  <Box
                    key={d.toString()}
                    sx={{
                      minHeight: view === 'day' ? 320 : 100,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 0.5,
                      opacity: d.month() === cursor.month() ? 1 : 0.4,
                    }}
                  >
                    <Typography variant="caption" fontWeight={700}>
                      {d.date()}
                    </Typography>
                    <Stack gap={0.25} mt={0.5}>
                      {dayEvents.slice(0, 4).map((e) => (
                        <Box
                          key={e.id}
                          sx={{
                            fontSize: 11,
                            bgcolor: `${e.color}22`,
                            borderInlineStart: `3px solid ${e.color}`,
                            px: 0.5,
                            py: 0.25,
                            borderRadius: 0.5,
                            color: 'text.primary',
                            cursor: 'grab',
                          }}
                          title={e.title}
                        >
                          {e.title}
                        </Box>
                      ))}
                      {dayEvents.length > 4 && (
                        <Typography variant="caption" color="text.secondary">
                          +{dayEvents.length - 4} مورد
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}