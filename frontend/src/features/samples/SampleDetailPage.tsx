import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
  IconButton,
} from '@mui/material';
import { useState } from 'react';
import { ArrowBack } from '@mui/icons-material';
import { sampleApi } from '../../core/services/samples';
import type { Sample as SampleType, PourSeries } from '../../core/types';
import { formatJalali } from '../../core/utils/jalali';
import { formatNumber } from '../../core/utils/format';
import { useApp } from '../../core/contexts/AppContext';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { StatusChip } from '../../shared/components/StatusChip';
import { AppBreadcrumbs } from '../../shared/components/AppBreadcrumbs';
import { QrCodeBlock, BarcodeBlock } from '../../shared/components/Codes';
import { FileUpload } from '../../shared/components/FileUpload';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';
import { MoldDetailDrawer } from '../molds/MoldDetailDrawer';

const STATUS_OPTIONS = ['created', 'received', 'waiting', 'stored', 'curing', 'ready_for_test', 'testing', 'completed', 'reported', 'archived', 'cancelled'];

export default function SampleDetailPage() {
  const { id } = useParams();
  const { t } = useApp();
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const [tab, setTab] = useState(0);
  const [moldId, setMoldId] = useState<number | null>(null);
  usePageTitle(t('nav.sample.detail'));

  const { data: sample, isLoading } = useQuery({
    queryKey: ['samples', id],
    queryFn: () => sampleApi.get(Number(id)),
    enabled: Boolean(id),
  });
  const { data: history } = useQuery({
    queryKey: ['samples', id, 'history'],
    queryFn: () => sampleApi.history(Number(id)),
    enabled: Boolean(id),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => sampleApi.patch(Number(id), { status } as Partial<SampleType>),
    onSuccess: () => {
      enqueueSnackbar(t('messages.updated'), { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['samples', id] });
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: 'error' }),
  });

  if (isLoading || !sample) return <Typography>در حال بارگذاری...</Typography>;

  return (
    <Box className="fadeIn">
      <AppBreadcrumbs
        crumbs={[
          { label: t('nav.samples'), path: '/samples' },
          { label: sample.project_name ?? `پروژه ${sample.project}`, path: `/projects/${sample.project}` },
          { label: `${sample.code} — ${sample.category}` },
        ]}
      />
      <Stack direction="row" alignItems="center" gap={1} mb={2}>
        <IconButton onClick={() => window.history.back()}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          {sample.code} — {sample.category}
        </Typography>
        <Chip size="small" label={sample.project_name ?? `پروژه ${sample.project}`} variant="outlined" />
        <Box sx={{ flexGrow: 1 }} />
        <StatusChip value={sample.status} />
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable">
        <Tab label="نمای کلی" />
        <Tab label="ریزها و قالب‌ها" />
        <Tab label="تاریخچه" />
        <Tab label="فایل‌ها" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>
                  مشخصات نمونه
                </Typography>
                <Grid container spacing={2}>
                  {[
                    ['پروژه', sample.project_name ?? `#${sample.project}`],
                    ['تاریخ', formatJalali(sample.date, true)],
                    ['عیار سیمان', sample.cement_grade],
                    ['کارخانه بتن', sample.concrete_factory],
                    ['حجم بتن', `${sample.sampling_volume} m³`],
                    ['وضعیت جوی', sample.weather_condition],
                    ['دمای محیط', `${sample.ambient_temperature}°C`],
                    ['محل نمونه‌برداری', sample.sampling_location],
                    ['سن نمونه', `${sample.age_in_days ?? '-'} روز`],
                    ['وزن', formatNumber(sample.weight)],
                  ].map(([k, v]) => (
                    <Grid size={{ xs: 6, sm: 4 }} key={k as string}>
                      <Typography variant="caption" color="text.secondary">
                        {k}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {v}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" mb={1}>
                  تغییر وضعیت
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {STATUS_OPTIONS.filter((s) => s !== sample.status).map((s) => (
                    <Chip
                      key={s}
                      label={s}
                      size="small"
                      onClick={() => statusMutation.mutate(s)}
                      disabled={statusMutation.isPending}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack gap={2}>
              <Card variant="outlined">
                <CardContent sx={{ display: 'grid', placeItems: 'center', gap: 2 }}>
                  <QrCodeBlock value={sample.qr_token} label="QR کد" />
                  <BarcodeBlock value={sample.barcode} label="بارکد" />
                </CardContent>
              </Card>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" mb={1}>
                    سری‌های نمونه
                  </Typography>
                  {(sample.series ?? []).map((s) => (
                    <Box key={s.id} mb={1.5}>
                      <Typography variant="body2" fontWeight={600}>
                        {s.name || `سری ${s.id}`} — اسلامپ {s.slump}
                      </Typography>
                    </Box>
                  ))}
                  {(sample.series ?? []).length === 0 && (
                    <Typography color="text.secondary" variant="body2">سری‌ای ثبت نشده است</Typography>
                  )}
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <PoursTab pours={sample.pour_series ?? []} onMoldClick={(mid) => setMoldId(mid)} />
      )}

      {tab === 2 && (
        <Card variant="outlined">
          <CardContent>
            <Stack gap={1.5}>
              {(history ?? []).length === 0 && <Typography color="text.secondary">تاریخچه‌ای ثبت نشده است.</Typography>}
              {(history ?? []).map((log, i) => (
                <Box key={i}>
                  <Stack direction="row" gap={1} alignItems="center">
                    <Chip size="small" label={log.action} color="primary" variant="outlined" />
                    <Typography variant="body2">{formatJalali(log.created_at, true)}</Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {log.object_repr}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {tab === 3 && (
        <Card variant="outlined">
          <CardContent>
            <FileUpload contentType="sample" objectId={sample.id} onUploaded={() => qc.invalidateQueries({ queryKey: ['files'] })} />
          </CardContent>
        </Card>
      )}

      {moldId !== null && <MoldDetailDrawer moldId={moldId} onClose={() => setMoldId(null)} />}
    </Box>
  );
}

function PoursTab({ pours, onMoldClick }: { pours: PourSeries[]; onMoldClick: (id: number) => void }) {
  if (pours.length === 0) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography color="text.secondary" textAlign="center" py={4}>
            این نمونه به ریز بتنی متصل نیست. از بخش «پروژه‌ها» یک ریز بتن برای آن ثبت کنید.
          </Typography>
        </CardContent>
      </Card>
    );
  }
  return (
    <Stack gap={2}>
      {pours.map((pour) => {
        const molds = pour.molds ?? [];
        const done = molds.filter((m) => m.is_done).length;
        return (
          <Card key={pour.id} variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" mb={1}>
                <Chip size="small" label="ریز بتن" color="secondary" />
                <Typography variant="subtitle1" fontWeight={700}>
                  {pour.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatJalali(pour.pour_date, true)} · عضو سازه‌ای: {pour.member_name ?? '—'}
                </Typography>
                <Chip size="small" label={`${molds.length} قالب`} variant="outlined" />
                <Chip size="small" label={`${done} انجام شده`} color={done === molds.length && molds.length ? 'success' : 'default'} />
              </Stack>
              <Stack direction="row" flexWrap="wrap" gap={0.5}>
                {molds.map((m) => (
                  <Chip
                    key={m.id}
                    size="small"
                    variant="outlined"
                    label={`${m.age_in_days} روزه${m.is_done ? ' ✓' : m.is_overdue ? ' (دیر)' : ''}`}
                    color={m.is_done ? 'success' : m.is_overdue ? 'error' : 'warning'}
                    title={`${m.sample_identifier} — ${formatJalali(m.deadline)}`}
                    onClick={() => onMoldClick(m.id)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}