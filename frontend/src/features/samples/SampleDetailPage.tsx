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
  Button,
  IconButton,
} from '@mui/material';
import { useState } from 'react';
import { ArrowBack } from '@mui/icons-material';
import { sampleApi } from '../../core/services/samples';
import type { Sample as SampleType } from '../../core/types';
import { formatDate, formatNumber } from '../../core/utils/format';
import { useApp } from '../../core/contexts/AppContext';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { StatusChip } from '../../shared/components/StatusChip';
import { AppBreadcrumbs } from '../../shared/components/AppBreadcrumbs';
import { QrCodeBlock, BarcodeBlock } from '../../shared/components/Codes';
import { FileUpload } from '../../shared/components/FileUpload';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';
import { moldGroup, MOLD_GROUP_LABELS, moldDue, dueLabel, collectAllMolds, type MoldGroup } from '../../core/utils/molds';

const STATUS_OPTIONS = ['created', 'received', 'waiting', 'stored', 'curing', 'ready_for_test', 'testing', 'completed', 'reported', 'archived', 'cancelled'];

function Timeline({ logs }: { logs: { created_at: string; action: string; object_repr: string; new_value: Record<string, unknown> | null }[] }) {
  return (
    <Stack gap={1.5}>
      {(logs ?? []).length === 0 && <Typography color="text.secondary">تاریخچه‌ای ثبت نشده است.</Typography>}
      {logs.map((log, i) => (
        <Box key={i}>
          <Stack direction="row" gap={1} alignItems="center">
            <Chip size="small" label={log.action} color="primary" variant="outlined" />
            <Typography variant="body2">{formatDate(log.created_at, true)}</Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {log.object_repr}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}

export default function SampleDetailPage() {
  const { id } = useParams();
  const { t } = useApp();
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const [tab, setTab] = useState(0);
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
          { label: t('nav.projects'), path: '/projects' },
          { label: sample.category, path: `/projects/${sample.project}` },
          { label: sample.code },
        ]}
      />
      <Stack direction="row" alignItems="center" gap={1} mb={2}>
        <IconButton onClick={() => window.history.back()}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          {sample.code} — {sample.category}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <StatusChip value={sample.status} />
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable">
        <Tab label="نمای کلی" />
        <Tab label="تاریخچه" />
        <Tab label="ردیابی" />
        <Tab label="آزمون‌ها" />
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
                    ['پروژه', `#${sample.project}`],
                    ['تاریخ', formatDate(sample.date, true)],
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
                    سری‌ها و قالب‌ها
                  </Typography>
                  {(sample.series ?? []).map((s) => (
                    <Box key={s.id} mb={1.5}>
                      <Typography variant="body2" fontWeight={600}>
                        {s.name || `سری ${s.id}`} — اسلومپ {s.slump}
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" gap={0.5}>
                        {(s.molds ?? []).map((m) => (
                          <Chip
                            key={m.id}
                            size="small"
                            variant="outlined"
                            label={`${m.age_in_days} روزه ${m.is_done ? '✓' : ''}`}
                            color={m.is_done ? 'success' : 'default'}
                          />
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Card variant="outlined">
          <CardContent>
            <Timeline logs={history ?? []} />
          </CardContent>
        </Card>
      )}

      {tab === 2 && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" mb={2}>
              ردیابی نمونه
            </Typography>
            <Stack gap={1}>
              <StatusChip value={sample.status} />
              <Typography variant="body2" color="text.secondary">
                کد رهگیری: {sample.code}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() =>
                  navigator.clipboard.writeText(`${sample.code}|${sample.qr_token}`).then(() =>
                    enqueueSnackbar('کپی شد', { variant: 'success' }),
                  )
                }
              >
                کپی کد رهگیری
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {tab === 3 && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" mb={2}>
              چرخه قالب‌های نمونه
            </Typography>
            <Grid container spacing={2}>
              {(Object.keys(MOLD_GROUP_LABELS) as MoldGroup[]).map((group) => {
                const groupMolds = collectAllMolds([sample]).filter((m) => moldGroup(m) === group);
                return (
                  <Grid key={group} size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5, minHeight: 140 }}>
                      <Typography variant="subtitle2" fontWeight={700} color="primary" mb={1}>
                        {MOLD_GROUP_LABELS[group]} ({groupMolds.length})
                      </Typography>
                      {groupMolds.length === 0 ? (
                        <Typography color="text.secondary" variant="body2">
                          قالبی ثبت نشده
                        </Typography>
                      ) : (
                        groupMolds.map((m) => {
                          const info = moldDue(m);
                          return (
                            <Stack key={m.id} gap={0.5} mb={1}>
                              <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                                <Chip size="small" label={m.sample_identifier} variant="outlined" />
                                <Chip
                                  size="small"
                                  label={m.is_done ? 'انجام شده' : info.isOverdue ? 'دیرکرد' : 'در انتظار'}
                                  color={m.is_done ? 'success' : info.isOverdue ? 'error' : 'warning'}
                                />
                              </Stack>
                              <Typography variant="caption" color="text.secondary">
                                موعد: {formatDate(m.deadline)} — {dueLabel(info)}
                              </Typography>
                              {m.breaking_load !== null && m.breaking_load !== undefined && (
                                <Typography variant="body2" fontWeight={600}>
                                  بار شکست: {m.breaking_load}
                                </Typography>
                              )}
                            </Stack>
                          );
                        })
                      )}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      )}

      {tab === 4 && (
        <Card variant="outlined">
          <CardContent>
            <FileUpload contentType="sample" objectId={sample.id} onUploaded={() => qc.invalidateQueries({ queryKey: ['files'] })} />
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
